import picgo from 'picgo'
import { generatePath, generateSignature, getHost, handleError, uploadOptions } from './utils'
import { config } from './utils/config'
import { CONFIG_NOT_FOUND_ERROR } from './utils/error'

const handle = async (ctx: picgo): Promise<picgo> => {
  const qingstorOptions = ctx.getConfig('picBed.qingstor-uploader')
  if (!qingstorOptions) {
    handleError(ctx, CONFIG_NOT_FOUND_ERROR)
    return ctx
  }
  try {
    const imgList = ctx.output
    const customUrl = qingstorOptions.customUrl
    const path = generatePath(qingstorOptions.path)
    for (let i in imgList) {
      if (!imgList.hasOwnProperty(i)) continue
      const signature = generateSignature(qingstorOptions, imgList[i].fileName)
      let image = imgList[i].buffer
      if (!image && imgList[i].base64Image) {
        image = Buffer.from(imgList[i].base64Image, 'base64')
      }
      const options = uploadOptions(qingstorOptions, imgList[i].fileName, signature, image)
      const body = await ctx.Request.request(options)
      if (body.statusCode === 200 || body.statusCode === 201) {
        delete imgList[i].base64Image
        delete imgList[i].buffer
        const url = getHost(customUrl)
        imgList[i].imgUrl = `${url.protocol}://${qingstorOptions.zone}.${url.host}/${qingstorOptions.bucket}${path}/${imgList[i].fileName}`
      }
    }
    return ctx
  } catch (err) {
    handleError(ctx, err)
    return ctx
  }
}

export = (ctx: picgo) => {
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
