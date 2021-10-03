export interface Options {
  accessKeyId: string,
  accessKeySecret: string,
  bucket: string,
  zone: string,
  path?: string,
  customUrl?: string,
}

export type Protocol = 'http' | 'https'

export interface Host {
  protocol: Protocol,
  host: string
}

export interface QingStorError {
  error: string | {code: string}
}
