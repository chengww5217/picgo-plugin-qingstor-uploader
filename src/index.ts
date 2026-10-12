import { IPicGo } from 'picgo'
import { registerLocales, translate, translateError } from './i18n'
import {
  buildObjectUrl,
  checkConnectivity,
  deleteObjectRequest,
  generateSignature,
  handleError,
  normalizeOptions,
  uploadOptions,
  validateOptions,
} from './utils'
import { config } from './utils/config'
import { CONFIG_NOT_FOUND_ERROR } from './utils/error'
import { Options, QingStorError } from './typings'

/** The uploader id, also used as the `type` of album entries. */
const UPLOADER_ID = 'qingstor-uploader'

/**
 * The PicGo GUI emits one `remove` event per deleted image (a single-element
 * array each time), so consecutive events are batched here to send one
 * notification with the total count instead of one per image.
 */
const REMOVE_BATCH_DELAY = 250

/** The subset of `guiApi` this plugin uses (see the GUI plugin docs). */
interface GuiApi {
  showMessageBox: (options: {
    title?: string
    message?: string
    type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  }) => Promise<{ result: number; checkboxChecked?: boolean }>
}

/** An image removed from the album, as sent by the `remove` event. */
interface RemovedImage {
  type?: string
  imgUrl?: string
}

const handle = async (ctx: IPicGo): Promise<IPicGo> => {
  const rawOptions = ctx.getConfig<Options>('picBed.qingstor-uploader')
  if (!rawOptions) {
    handleError(ctx, CONFIG_NOT_FOUND_ERROR)
    return ctx
  }
  const qingstorOptions = normalizeOptions(rawOptions)
  const invalidOption = validateOptions(qingstorOptions)
  if (invalidOption) {
    handleError(ctx, { code: invalidOption })
    return ctx
  }
  try {
    const imgList = ctx.output
    // Upload in parallel: a batch of images shouldn't have to wait one by one.
    const results = await Promise.allSettled(
      imgList.map(async img => {
        const { fileName = '', extname = '' } = img
        const { signature, date } = generateSignature(qingstorOptions, fileName, extname)
        const image = img.buffer ?? (img.base64Image ? Buffer.from(img.base64Image, 'base64') : undefined)
        if (!image) {
          // Both buffer and base64Image are missing: surface it instead of
          // silently leaving an image without a url in the gallery.
          throw { code: 'empty_image' }
        }
        const options = uploadOptions(qingstorOptions, fileName, signature, image, extname, date)
        await ctx.request(options)
        delete img.base64Image
        delete img.buffer
        const objectUrl = buildObjectUrl(qingstorOptions, fileName)
        img.imgUrl = objectUrl
        // PicGo falls back to imgUrl, but the clipboard url is taken from `url`.
        // Declaring it explicitly keeps both in sync for any file type.
        img.url = objectUrl
      }),
    )
    const failure = results.find((result): result is PromiseRejectedResult => result.status === 'rejected')
    if (failure) {
      handleError(ctx, failure.reason as QingStorError)
    }
    return ctx
  } catch (err) {
    handleError(ctx, err as QingStorError)
    return ctx
  }
}

/**
 * Delete the given objects from QingStor, then notify the user with the result.
 * @param ctx {IPicGo} The context used to send requests and notify.
 * @param options {Options} The active QingStor config.
 * @param files {RemovedImage[]} The removed album entries (with `imgUrl`).
 * @return {Promise<void>} Resolves when the requests and notification are done.
 */
async function syncDelete(ctx: IPicGo, options: Options, files: RemovedImage[]): Promise<void> {
  const results = await Promise.allSettled(
    files.map(file => ctx.request(deleteObjectRequest(options, file.imgUrl as string))),
  )
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected')
  failures.forEach(result => ctx.log.error('Qingstor delete error: ', JSON.stringify(result.reason)))
  const success = results.length - failures.length
  const title = translate(ctx, 'QINGSTOR_NAME')
  const body = failures.length
    ? translate(ctx, 'QINGSTOR_DELETE_PARTIAL', { success, failed: failures.length })
    : translate(ctx, 'QINGSTOR_DELETE_SUCCESS', { count: success })
  ctx.emit('notification', { title, body })
}

/**
 * The `remove` event handler: when the user deletes QingStor images from the
 * album, delete the matching objects too if the "sync delete" switch is on.
 * @param ctx {IPicGo} The context.
 * @param files {RemovedImage[]} The removed album entries.
 * @return {Promise<void>} Never rejects.
 */
async function handleRemove(ctx: IPicGo, files: RemovedImage[]): Promise<void> {
  try {
    const rawOptions = ctx.getConfig<Options>('picBed.qingstor-uploader')
    if (!rawOptions) return
    const options = normalizeOptions(rawOptions)
    if (options.deleteRemote !== true) return
    if (validateOptions(options)) return
    const targets = (files ?? []).filter(
      file => file?.type === UPLOADER_ID && typeof file.imgUrl === 'string' && file.imgUrl.length > 0,
    )
    if (targets.length === 0) return

    await syncDelete(ctx, options, targets)
  } catch (err) {
    ctx.log.error('Qingstor remove handler error: ', JSON.stringify(err))
  }
}

/**
 * GUI-only menu, shown in the plugin page of the PicGo app.
 * Lets the user verify the config and whether QingStor is reachable.
 */
const guiMenu = (ctx: IPicGo) => {
  return [
    {
      label: translate(ctx, 'QINGSTOR_MENU_CHECK_CONFIG'),
      async handle(ctx: IPicGo, guiApi: GuiApi) {
        const title = translate(ctx, 'QINGSTOR_NAME')
        const rawOptions = ctx.getConfig<Options>('picBed.qingstor-uploader')
        if (!rawOptions) {
          await guiApi.showMessageBox({
            type: 'warning',
            title,
            message: translate(ctx, 'QINGSTOR_CHECK_NO_CONFIG'),
          })
          return
        }
        const qingstorOptions = normalizeOptions(rawOptions)
        const invalidOption = validateOptions(qingstorOptions)
        if (invalidOption) {
          await guiApi.showMessageBox({
            type: 'error',
            title,
            message: translateError(ctx, invalidOption) ?? invalidOption,
          })
          return
        }
        const reachable = await checkConnectivity(ctx, qingstorOptions)
        await guiApi.showMessageBox({
          type: reachable ? 'info' : 'warning',
          title,
          message: translate(ctx, reachable ? 'QINGSTOR_CHECK_CONNECT_OK' : 'QINGSTOR_CHECK_CONNECT_FAIL'),
        })
      },
    },
  ]
}

export = (ctx: IPicGo) => {
  const register = () => {
    registerLocales(ctx)
    ctx.helper.uploader.register('qingstor-uploader', {
      handle,
      name: translate(ctx, 'QINGSTOR_NAME'),
      config,
    })
    // Delete the matching objects when images are removed from the album,
    // if the "sync delete" switch is enabled in the plugin settings.
    // The GUI fires one event per image, so batch them into a single summary.
    let pending: RemovedImage[] = []
    let flushTimer: ReturnType<typeof setTimeout> | undefined
    const flush = () => {
      flushTimer = undefined
      const files = pending
      pending = []
      void handleRemove(ctx, files)
    }
    ctx.on('remove', (files: RemovedImage[]) => {
      if (!Array.isArray(files) || files.length === 0) return
      pending = pending.concat(files)
      if (flushTimer) clearTimeout(flushTimer)
      flushTimer = setTimeout(flush, REMOVE_BATCH_DELAY)
    })
  }
  return {
    uploader: 'qingstor-uploader',
    register,
    guiMenu,
  }
}
