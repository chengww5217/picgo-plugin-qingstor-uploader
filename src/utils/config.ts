import { IPicGo, IPluginConfig } from 'picgo'
import { translate } from '../i18n'
import { normalizeOptions } from './index'
import { Options } from '../typings'

export const config = (ctx: IPicGo): IPluginConfig[] => {
  const userConfig = normalizeOptions(ctx.getConfig<Options>('picBed.qingstor-uploader'))
  return [
    {
      name: 'accessKeyId',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_ACCESS_KEY_ID', 'AccessKeyId'),
      message: translate(ctx, 'QINGSTOR_MSG_ACCESS_KEY_ID', '请输入 AccessKeyId'),
      tips: translate(ctx, 'QINGSTOR_TIPS_ACCESS_KEY_ID', '在青云控制台「API 密钥」页面创建并获取'),
      default: userConfig.accessKeyId || '',
      required: true
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      alias: translate(ctx, 'QINGSTOR_ALIAS_ACCESS_KEY_SECRET', 'AccessKeySecret'),
      message: translate(ctx, 'QINGSTOR_MSG_ACCESS_KEY_SECRET', '请输入 AccessKeySecret'),
      tips: translate(ctx, 'QINGSTOR_TIPS_ACCESS_KEY_SECRET', '与 AccessKeyId 配对使用，请妥善保管，不要泄露'),
      default: userConfig.accessKeySecret || '',
      required: true
    },
    {
      name: 'bucket',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_BUCKET', 'Bucket 名称'),
      message: translate(ctx, 'QINGSTOR_MSG_BUCKET', '请输入 Bucket 名称'),
      tips: translate(ctx, 'QINGSTOR_TIPS_BUCKET', 'Bucket 需要提前创建，名称只支持小写字母、数字和中划线（-）'),
      default: userConfig.bucket || '',
      required: true
    },
    {
      name: 'zone',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_ZONE', '区域'),
      message: translate(ctx, 'QINGSTOR_MSG_ZONE', '请输入区域代码，例如 pek3b'),
      tips: translate(ctx, 'QINGSTOR_TIPS_ZONE', '青云公有云常见区域：pek3a、pek3b、sh1a、gd2；私有云或其他区域请直接填写实际值'),
      default: userConfig.zone || '',
      required: true
    },
    {
      name: 'path',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_PATH', '存储路径'),
      message: 'blog/',
      tips: translate(ctx, 'QINGSTOR_TIPS_PATH', '图片会存放到 Bucket 下的这个路径，留空表示根目录'),
      default: userConfig.path || '',
      required: false
    },
    {
      name: 'customUrl',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_CUSTOM_URL', '自定义网址'),
      message: 'https://qingstor.com',
      tips: translate(ctx, 'QINGSTOR_TIPS_CUSTOM_URL', '仅私有云或自定义域名时填写，例如 https://qingstor.example.com'),
      default: userConfig.customUrl || '',
      required: false
    }
  ]
}
