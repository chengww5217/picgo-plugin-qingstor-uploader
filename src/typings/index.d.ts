export interface Options {
  accessKeyId?: string,
  accessKeySecret?: string,
  bucket?: string,
  zone?: string,
  path?: string,
  customUrl?: string,
}

/** Languages PicGo ships with. */
export type Language = 'zh-CN' | 'zh-TW' | 'en'

/** One user facing text, translated for every supported language. */
export type LocaleTexts = Record<Language, string>

export type Protocol = 'http' | 'https'

export interface Host {
  protocol: Protocol,
  host: string
}

export interface SignatureInfo {
  /** The value of the Authorization header. */
  signature: string,
  /**
   * The date used to compute the signature.
   * It MUST be sent as the request's Date header as well,
   * otherwise QingStor rejects the request with signature_not_matched.
   */
  date: string
}

export interface QingStorError {
  error?: string;
  code?: string;
  response?: {
    body?: {
      code?: string
    }
  }
}
