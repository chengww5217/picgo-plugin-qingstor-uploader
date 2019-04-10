import picgo from 'picgo'
import { PluginConfig } from 'picgo/dist/utils/interfaces'
import crypto from 'crypto'

const ERRORS = {
  'invalid_access_key_id': 'access key 不正确',
  'invalid_range': '请求头 Range 不符合规则',
  'request_expired': '请检查本地时间是否正确',
  'signature_not_matched': '请求的签名不匹配',
  'invalid_argument': '请求中的参数值非法',
  'bad_digest': 'Content-MD5 有误',
  'permission_denied': '没有权限执行此次请求',
  'bucket_already_exists': '创建的 bucket 已存在',
  'bucket_not_exists': '访问的 bucket 不存在',
  'object_not_exists': '访问的 object 不存在',
  'invalid_bucket_name': '创建的 bucket 名称非法或重名',
  'too_many_buckets': '创建的 bucket 超出限额',
  'bucket_not_empty': '删除的 bucket 非空',
  'bucket_not_active': '访问的 bucket 不是活跃状态',
  'lease_not_ready': 'bucket 租赁信息未准备好',
  'method_not_allowed': '请求方法不被允许',
  'invalid_request': '请求中的消息体不符合规定',
  'invalid_location': '请求的区域不存在',
  'max_requests_exceeded': '请求创建和删除 bucket 过于频繁',
  'precondition_failed': '请求的 Header 中某些先决条件不满足',
  'invalid_object_state': 'object 目前的状态不能接收此次操作',
  'invalid_object_name': 'object 名称不符合规定',
  'entity_too_small': '没有权限执行此次请求',
  'entity_too_large': 'object 数据超出最大限制 5GB',
  'max_parts_exceeded': '分块数超出系统最大数量 1000',
  'upload_not_exists': 'upload id 不存在',
  'account_problem': '账号异常，请提工单与青云联系',
  'delinquent_account': '账号欠费',
  'invalid_json': '请求消息体的 json 格式错误',
  'access_denied': '请求被拒绝',
  'incomplete_body': '请求消息体不完整',
  'form_policy_violated': '表单内容与策略不相符',
  'cname_error': 'CNAME 设置错误',
  'too_many_objects': '操作包含的 object 数量太大',
  'internal_error': '对象存储系统内部错误',
  'service_unavailable': '对象存储系统临时不可用'
}

// generate QingStor signature
const generateSignature = (options: any, fileName: string): string => {
  const date = new Date().toUTCString()
  const path = generatePath(options.path)
  const strToSign = `PUT\n\n\n${date}\n/${options.bucket}/${encodeURI(path)}/${encodeURI(fileName)}`

  const signature = crypto.createHmac('sha256', options.accessKeySecret).update(strToSign).digest('base64')
  return `QS ${options.accessKeyId}:${signature}`
}

// Generate path
const generatePath = (path: string): string => {
  if (path && path.endsWith('/')) {
    path = path.substring(0, path.length - 1)
  }
  return path
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
    url: `${url.protocol}://${options.zone}.${url.host}/${options.bucket}/${encodeURI(generatePath(options.path))}/${encodeURI(fileName)}`,
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
    const path = generatePath(qingstorOptions.path)
    for (let i in imgList) {
      if (!imgList.hasOwnProperty(i)) continue
      const signature = generateSignature(qingstorOptions, imgList[i].fileName)
      let image = imgList[i].buffer
      if (!image && imgList[i].base64Image) {
        image = Buffer.from(imgList[i].base64Image, 'base64')
      }
      const options = postOptions(qingstorOptions, imgList[i].fileName, signature, image)
      const body = await ctx.Request.request(options)
      if (body.statusCode === 200 || body.statusCode === 201) {
        delete imgList[i].base64Image
        delete imgList[i].buffer
        const url = getHost(customUrl)
        imgList[i].imgUrl = `${url.protocol}://${qingstorOptions.zone}.${url.host}/${qingstorOptions.bucket}/${encodeURI(path)}/${imgList[i].fileName}`
      }
    }
    return ctx
  } catch (err) {
    const code = JSON.parse(err.error).code
    let message
    if (code) {
      message = ERRORS[code] ? ERRORS[code] : code
    } else {
      message = '请检查配置项或网络情况'
    }
    ctx.emit('notification', {
      title: '上传失败！',
      body: message
    })
  }
}

const config = (ctx: picgo): PluginConfig[] => {
  let userConfig = ctx.getConfig('picBed.qingstor-uploader')
  if (!userConfig) {
    userConfig = {}
  }
  return [
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
      message: 'blog/',
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
