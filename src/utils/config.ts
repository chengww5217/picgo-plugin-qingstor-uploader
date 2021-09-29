import picgo from 'picgo'
import { PluginConfig } from 'picgo/dist/utils/interfaces'

export const config = (ctx: picgo): PluginConfig[] => {
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
