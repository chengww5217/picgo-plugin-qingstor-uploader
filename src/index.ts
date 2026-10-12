import { IPicGo } from 'picgo'
import { registerLocales, translate, translateError } from './i18n'
import {
  buildObjectUrl,
  checkConnectivity,
  generateSignature,
  handleError,
  normalizeOptions,
  uploadOptions,
  validateOptions,
} from './utils'
import { config } from './utils/config'
import { CONFIG_NOT_FOUND_ERROR } from './utils/error'
import { Options, QingStorError } from './typings'

/** The subset of `guiApi` this plugin uses (see the GUI plugin docs). */
interface GuiApi {
  showMessageBox: (options: {
    title?: string
    message?: string
    type?: 'none' | 'info' | 'error' | 'question' | 'warning'
  }) => Promise<{ result: number; checkboxChecked: boolean }>
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
 * GUI-only menu, shown in the plugin page of the PicGo app.
 * Lets the user verify the config and whether QingStor is reachable.
 */
const guiMenu = (ctx: IPicGo) => {
  return [
    {
      label: translate(ctx, 'QINGSTOR_MENU_CHECK_CONFIG', '检查配置与连接'),
      async handle(ctx: IPicGo, guiApi: GuiApi) {
        const title = translate(ctx, 'QINGSTOR_CHECK_TITLE', '青云 QingStor')
        const rawOptions = ctx.getConfig<Options>('picBed.qingstor-uploader')
        if (!rawOptions) {
          await guiApi.showMessageBox({
            type: 'warning',
            title,
            message: translate(
              ctx,
              'QINGSTOR_CHECK_NO_CONFIG',
              '还没有配置青云 QingStor 图床，请先在图床设置里完成配置',
            ),
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
          message: translate(
            ctx,
            reachable ? 'QINGSTOR_CHECK_CONNECT_OK' : 'QINGSTOR_CHECK_CONNECT_FAIL',
            reachable
              ? '配置完整，已成功连接青云服务'
              : '配置完整，但无法连接青云服务，请检查区域(zone)、自定义网址和网络',
          ),
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
      name: '青云 QingStor',
      config,
    })
  }
  return {
    uploader: 'qingstor-uploader',
    register,
    guiMenu,
  }
}
