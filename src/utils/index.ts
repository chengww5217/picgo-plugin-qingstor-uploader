import {Host, Options, Protocol, QingStorError, SignatureInfo} from '../typings'
import crypto from 'crypto'
import {IReqOptionsWithBodyResOnly, IPicGo} from 'picgo'
import { translate, translateError } from '../i18n'

const UserAgent = 'picgo_plugin_qingstor';
/** Timeout of the upload request, in milliseconds. */
const UPLOAD_TIMEOUT = 30000;
/** Timeout of the connectivity check, in milliseconds. */
const CONNECT_TIMEOUT = 8000;

/**
 * Trim every user input so pasted whitespace can't break things.
 * A leading/trailing space in `bucket` (or any field) would otherwise make the
 * signed path differ from the request path and fail with `signature_not_matched`.
 * @param options {Options | undefined} Raw config read from PicGo.
 * @return {Options} A copy with every string field trimmed.
 */
export function normalizeOptions (options?: Options): Options {
  const raw = options ?? {}
  return {
    accessKeyId: raw.accessKeyId?.trim(),
    accessKeySecret: raw.accessKeySecret?.trim(),
    bucket: raw.bucket?.trim(),
    zone: raw.zone?.trim(),
    path: raw.path?.trim(),
    customUrl: raw.customUrl?.trim()
  }
}

/**
 * Check the user's configuration before uploading.
 * Required fields are also validated by PicGo's config form, but a config file
 * edited by hand (or a half-filled one) would otherwise build a request for
 * an invalid url such as https://.qsstor.com/... and fail with a confusing error.
 * @param options {Options} PicGo options, AKA infos user entered.
 * @return {string} The error code, or '' when the configuration is valid.
 */
export function validateOptions (options: Options): string {
  if (!options.accessKeyId) return 'missing_access_key_id'
  if (!options.accessKeySecret) return 'missing_access_key_secret'
  if (!options.bucket) return 'missing_bucket'
  if (!options.zone) return 'missing_zone'
  return ''
}

/**
 * Generate signature of qingstor.
 * @param options {Options} PicGo options, AKA infos user entered.
 * @param fileName {string} The upload image's name, AKA object key in oss.
 * @param extname {string} extname for Content-Type in request headers.
 * @return {SignatureInfo} The signature, and the date it was signed for.
 */
export function generateSignature (options: Options, fileName: string, extname: string): SignatureInfo {
  const date = new Date().toUTCString()
  const path = generatePath(options.path ?? '')
  const strToSign = `PUT\n\n${_getContentType(extname)}\n${date}\n/${options.bucket}${path}/${encodeURI(fileName)}`

  const signature = crypto.createHmac('sha256', options.accessKeySecret ?? '').update(strToSign).digest('base64')
  return { signature: `QS ${options.accessKeyId}:${signature}`, date }
}

/**
 * Generate the upload path.
 * @param path {string} User entered path.
 * @return {string} the encoded path.
 */
export function generatePath (path: string): string {
  if (!path) return ''
  const trimmedPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path
  if (!trimmedPath) return ''
  return '/' + encodeURI(trimmedPath)
}

const QINGSTOR_HOST = 'qsstor.com'
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
 * Build the public url of an uploaded image (bucket as a subdomain).
 * @param options {Options} User entered infos.
 * @param fileName {string} The uploaded image's name.
 * @return {string} The public url.
 */
export function buildObjectUrl (options: Options, fileName: string): string {
  const url = getHost(options.customUrl ?? '')
  const path = generatePath(options.path ?? '')
  return `${url.protocol}://${options.bucket}.${options.zone}.${url.host}${path}/${encodeURI(fileName)}`
}

const imageMime: Record<string, string> = {
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  webp: 'image/webp',
  svg: 'image/svg+xml'
}

function _getContentType(extname: string): string {
  const ext = extname.replace('.', '');
  return imageMime[ext] || 'application/octet-stream';
}

/**
 * Get the upload options.
 * @param options {Options} User entered infos.
 * @param fileName {string} The file's name.
 * @param signature {string} The signature for upload.
 * @param image {Buffer} The image file's buffer.
 * @param extname {string} ext name.
 * @param date {string} The date the signature was computed for.
 * @return {IReqOptionsWithBodyResOnly} The request info.
 */
export function uploadOptions (options: Options, fileName: string, signature: string, image: Buffer, extname: string, date: string): IReqOptionsWithBodyResOnly {
  const url = getHost(options.customUrl ?? '')
  const path = generatePath(options.path ?? '')
  return {
    method: 'PUT',
    url: `${url.protocol}://${options.zone}.${url.host}/${options.bucket}${path}/${encodeURI(fileName)}`,
    timeout: UPLOAD_TIMEOUT,
    headers: {
      Authorization: signature,
      Date: date,
      'User-Agent': UserAgent,
      'Content-Type': _getContentType(extname),
    },
    data: image
  }
}

/**
 * Best-effort reachability check for the configured endpoint.
 * Any HTTP response (even a 4xx) means the host is reachable; only a network
 * level failure (no response at all) is treated as unreachable.
 * @param ctx {IPicGo} The context used to send the request.
 * @param options {Options} User entered infos.
 * @return {Promise<boolean>} Whether QingStor answered.
 */
export async function checkConnectivity (ctx: IPicGo, options: Options): Promise<boolean> {
  const { protocol, host } = getHost(options.customUrl ?? '')
  const requestOptions: IReqOptionsWithBodyResOnly = {
    method: 'HEAD',
    url: `${protocol}://${options.zone}.${host}/${options.bucket}`,
    timeout: CONNECT_TIMEOUT
  }
  try {
    await ctx.request(requestOptions)
    return true
  } catch (err) {
    return Boolean((err as { response?: unknown })?.response)
  }
}

/**
 * Resolve a human readable message from the error.
 * Both a QingStor error code and a plain text message are supported.
 * @param ctx {IPicGo} The context holding the i18n manager.
 * @param err {QingStorError} The request error.
 * @return {string} The message to show to the user.
 */
function getErrorMessage (ctx: IPicGo, err: QingStorError): string {
  const fallback = translate(ctx, 'CHECK_SETTINGS_AND_NETWORK', '请检查配置项或网络情况')
  const raw = err?.error
  let error: unknown = raw
  if (typeof raw === 'string') {
    try {
      error = JSON.parse(raw)
    } catch {
      // Not a JSON string, the plugin itself passes plain text messages.
      return raw
    }
  }
  const code = (error as QingStorError)?.code ??
    (error as QingStorError)?.response?.body?.code ??
    err?.code ??
    err?.response?.body?.code
  if (!code) return fallback
  return translateError(ctx, code) ?? code
}

/**
 * Handle the request error and notify the user with the message.
 * @param ctx {IPicGo} The context to show the notification.
 * @param err {QingStorError} The request error.
 */
export function handleError (ctx: IPicGo, err: QingStorError) {
  ctx.log.error('Qingstor uploader error: ', JSON.stringify(err))
  ctx.emit('notification', {
    title: translate(ctx, 'UPLOAD_FAILED', '上传失败！'),
    body: getErrorMessage(ctx, err)
  })
}
