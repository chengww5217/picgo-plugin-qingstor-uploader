import picgo from 'picgo'
import { PluginConfig } from 'picgo/dist/utils/interfaces'
import crypto from 'crypto'
import { ERRORS } from 'qingstor_errors'

// generate QingStor signature
const generateSignature = (options: any, fileName: string): string => {
  const date = new Date().toUTCString()
  const strToSign = `PUT\n\n\n${date}\n/${options.bucket}/${encodeURI(options.path)}/${encodeURI(fileName)}`

  const signature = crypto.createHmac('sha256', options.accessKeySecret).update(strToSign).digest('base64')
  return `QS ${options.accessKeyId}:${signature}`
}

const getHost = (customUrl: any): any => {
  let protocol = 'https'
  let host = 'qingstor.com'
  if (customUrl) {
    if (customUrl.startsWith('http://')) {
      protocol = 'http'
      host = customUrl.substring(7)
    } else if (customUrl.startsWith('https://')) {
      host = customUrl.substring(8)
    } else {
      host = customUrl
    }
  }
  return {
    protocol: protocol,
    host: host
  }
}

const postOptions = (options: any, fileName: string, signature: string, image: Buffer): any => {
  const url = getHost(options.customUrl)
  return {
    method: 'PUT',
    url: `${url.protocol}://${options.zone}.${url.host}/${options.bucket}/${encodeURI(options.path)}/${encodeURI(fileName)}`,
    headers: {
      Host: `${options.zone}.${url.host}`,
      Authorization: signature,
      Date: new Date().toUTCString()
    },
    body: image,
    resolveWithFullResponse: true
  }
}

const handle = async (ctx: picgo): Promise<picgo> => {
  const qingstorOptions = ctx.getConfig('picBed.qingstor-uploader')
  if (!qingstorOptions) {
    throw new Error('找不到青云 QingStor 图床配置文件')
  }
  try {
    const imgList = ctx.output
    const customUrl = qingstorOptions.customUrl
    const path = qingstorOptions.path
    for (let i in imgList) {
      const signature = generateSignature(qingstorOptions, imgList[i].fileName)
      let image = imgList[i].buffer
      if (!image && imgList[i].base64Image) {
        image = Buffer.from(imgList[i].base64Image, 'base64')
      }
      const options = postOptions(qingstorOptions, imgList[i].fileName, signature, image)
      let body = await ctx.Request.request(options)
      if (body.statusCode === 200 || body.statusCode === 201) {
        delete imgList[i].base64Image
        delete imgList[i].buffer
        const url = getHost(customUrl)
        imgList[i]['imgUrl'] = `${url.protocol}://${qingstorOptions.zone}.${url.host}/${qingstorOptions.bucket}/${encodeURI(path)}/${imgList[i].fileName}`
      } else {
        let message
        if (body.code) {
          message = ERRORS[body.code] ? ERRORS[body.code] : body.code
        } else {
          message = 'Upload failed'
        }
        throw new Error(message)
      }
    }
    return ctx
  } catch (err) {
    if (err.error === 'Upload failed') {
      ctx.emit('notification', {
        title: '上传失败！',
        body: `请检查配置项或网络情况`
      })
    } else {
      ctx.emit('notification', {
        title: '上传失败！',
        body: err.error
      })
    }
    throw err
  }
}

const config = (ctx: picgo): PluginConfig[] => {
  let userConfig = ctx.getConfig('picBed.qingstor-uploader')
  if (!userConfig) {
    userConfig = {}
  }
  const config = [
    {
      name: 'accessKeyId',
      type: 'input',
      default: userConfig.accessKeyId || '',
      message: 'AccessKeyId 不能为空',
      required: true
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      default: userConfig.accessKeySecret || '',
      message: 'AccessKeySecret 不能为空',
      required: true
    },
    {
      name: 'bucket',
      type: 'input',
      default: userConfig.bucket || '',
      message: 'Bucket 不能为空',
      required: true
    },
    {
      name: 'zone',
      type: 'input',
      alias: '区域',
      default: userConfig.area || '',
      message: '区域代码不能为空',
      required: true
    },
    {
      name: 'path',
      type: 'input',
      alias: '存储路径',
      message: 'blog',
      default: userConfig.path || '',
      required: false
    },
    {
      name: 'customUrl',
      type: 'input',
      alias: '私有云网址',
      message: 'https://qingstor.com',
      default: userConfig.customUrl || '',
      required: false
    }
  ]
  return config
}

export = (ctx: picgo) => {
  const register = () => {
    ctx.helper.uploader.register('qingstor-uploader', {
      handle,
      name: '青云 QingStor ',
      config: config
    })
  }
  return {
    uploader: 'qingstor-uploader',
    register
  }
}
