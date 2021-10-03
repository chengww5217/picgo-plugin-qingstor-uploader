import { Host, Options, Protocol, QingStorError } from '../typings'
import crypto from 'crypto'
import request from 'request-promise-native'
import picgo from 'picgo'
import { ERRORS } from './error'

/**
 * Generate signature of qingstor.
 * @param options {Options} PicGo options, AKA infos user entered.
 * @param fileName {string} The upload image's name, AKA object key in oss.
 * @return {string} The generated signature.
 */
export function generateSignature (options: Options, fileName: string): string {
  const date = new Date().toUTCString()
  const path = generatePath(options.path)
  const strToSign = `PUT\n\n\n${date}\n/${options.bucket}${path}/${encodeURI(fileName)}`

  const signature = crypto.createHmac('sha256', options.accessKeySecret).update(strToSign).digest('base64')
  return `QS ${options.accessKeyId}:${signature}`
}

/**
 * Generate the upload path.
 * @param path {string} User entered path.
 * @return {string} the encoded path.
 */
export function generatePath (path: string): string {
  if (path) {
    if (path.endsWith('/')) {
      path = path.substring(0, path.length - 1)
    }
    path = '/' + encodeURI(path)
  }
  return path || ''
}

const QINGSTOR_HOST = 'qingstor.com'
const HTTP_PROTOCOL = 'http'
const HTTP_PREFIX = HTTP_PROTOCOL + '://'
const HTTPS_PROTOCOL = 'https'
const HTTPS_PREFIX = HTTPS_PROTOCOL + '://'

/**
 * Get the request host.
 * @param customUrl {string} Custom url user entered.
 * @return {Host} The Host, which contains protocol and host.
 */
export function getHost (customUrl: string): Host {
  let protocol: Protocol = HTTPS_PROTOCOL
  let host = QINGSTOR_HOST
  if (customUrl) {
    if (customUrl.startsWith(HTTP_PREFIX)) {
      protocol = HTTP_PROTOCOL
      host = customUrl.substring(HTTP_PREFIX.length)
    } else if (customUrl.startsWith(HTTPS_PREFIX)) {
      host = customUrl.substring(HTTPS_PREFIX.length)
    } else {
      host = customUrl
    }
  }
  return { protocol, host }
}

/**
 * Get the upload options.
 * @param options {Options} User entered infos.
 * @param fileName {string} The file's name.
 * @param signature {string} The signature for upload.
 * @param image {Buffer} The image file's buffer.
 * @return {typeof request} The request info.
 */
export function uploadOptions (options: Options, fileName: string, signature: string, image: Buffer): typeof request {
  const url = getHost(options.customUrl)
  let path = generatePath(options.path)
  return {
    method: 'PUT',
    url: `${url.protocol}://${options.zone}.${url.host}/${options.bucket}${path}/${encodeURI(fileName)}`,
    headers: {
      Host: `${options.zone}.${url.host}`,
      Authorization: signature,
      Date: new Date().toUTCString()
    },
    body: image,
    resolveWithFullResponse: true
  }
}

/**
 * Handle the request error and notify the user with the message.
 * @param ctx {picgo} The context to show the notification.
 * @param err {QingStorError} The request error.
 */
export function handleError (ctx: picgo, err: QingStorError) {
  ctx.log.error('Qingstor uploader error: ', JSON.stringify(err))
  let message: string
  try {
    const error = err.error
    const type = typeof error
    let code: string
    if (type === 'string') {
      code = JSON.parse(error as string).code
    } else {
      code = (error as {code: string}).code
    }
    if (code) {
      message = ERRORS[code]
      if (!message) {
        message = code
      }
    } else {
      message = '请检查配置项或网络情况'
    }
  } catch {
    message = '请检查配置项或网络情况'
  }
  ctx.emit('notification', {
    title: '上传失败！',
    body: message
  })
}
