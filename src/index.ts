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
    for (let i in imgList) {
      if (!imgList.hasOwnProperty(i)) continue
      const { fileName = '', extname = '' } = imgList[i]
      const { signature, date } = generateSignature(qingstorOptions, fileName, extname)
      const image = imgList[i].buffer ?? (imgList[i].base64Image ? Buffer.from(imgList[i].base64Image as string, 'base64') : undefined)
      if (!image) continue
      const options = uploadOptions(qingstorOptions, fileName, signature, image, extname, date)
      await ctx.request(options)
      delete imgList[i].base64Image
      delete imgList[i].buffer
      const url = getHost(customUrl)
      imgList[i].imgUrl = `${url.protocol}://${qingstorOptions.bucket}.${qingstorOptions.zone}.${url.host}${path}/${fileName}`
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
      name: '青云 QingStor ',
      config
    })
  }
  return {
    uploader: 'qingstor-uploader',
    register
  }
}
