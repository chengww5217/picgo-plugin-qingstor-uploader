import { IPicGo } from 'picgo'
import { generatePath, generateSignature, getHost, handleError, uploadOptions, validateOptions } from './utils'
import { config } from './utils/config'
import { CONFIG_NOT_FOUND_ERROR } from './utils/error'
import { Options, QingStorError } from './typings'

const handle = async (ctx: IPicGo): Promise<IPicGo> => {
  const qingstorOptions = ctx.getConfig<Options>('picBed.qingstor-uploader')
  if (!qingstorOptions) {
    handleError(ctx, CONFIG_NOT_FOUND_ERROR)
    return ctx
  }
  const invalidOption = validateOptions(qingstorOptions)
  if (invalidOption) {
    handleError(ctx, { code: invalidOption })
    return ctx
  }
  try {
    const imgList = ctx.output
    const customUrl = qingstorOptions.customUrl ?? ''
    const path = generatePath(qingstorOptions.path ?? '')
    const url = getHost(customUrl)
    // Upload in parallel: a batch of images shouldn't have to wait one by one.
    const results = await Promise.allSettled(imgList.map(async (img) => {
      const { fileName = '', extname = '' } = img
      const { signature, date } = generateSignature(qingstorOptions, fileName, extname)
      const image = img.buffer ?? (img.base64Image ? Buffer.from(img.base64Image, 'base64') : undefined)
      if (!image) return
      const options = uploadOptions(qingstorOptions, fileName, signature, image, extname, date)
      await ctx.request(options)
      delete img.base64Image
      delete img.buffer
      img.imgUrl = `${url.protocol}://${qingstorOptions.bucket}.${qingstorOptions.zone}.${url.host}${path}/${encodeURI(fileName)}`
    }))
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

export = (ctx: IPicGo) => {
  const register = () => {
    ctx.helper.uploader.register('qingstor-uploader', {
      handle,
      name: '青云 QingStor',
      config
    })
  }
  return {
    uploader: 'qingstor-uploader',
    register
  }
}
