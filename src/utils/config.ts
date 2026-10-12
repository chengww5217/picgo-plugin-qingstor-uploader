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
      alias: translate(ctx, 'QINGSTOR_ALIAS_ACCESS_KEY_ID'),
      message: translate(ctx, 'QINGSTOR_MSG_ACCESS_KEY_ID'),
      tips: translate(ctx, 'QINGSTOR_TIPS_ACCESS_KEY_ID'),
      default: userConfig.accessKeyId || '',
      required: true,
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      alias: translate(ctx, 'QINGSTOR_ALIAS_ACCESS_KEY_SECRET'),
      message: translate(ctx, 'QINGSTOR_MSG_ACCESS_KEY_SECRET'),
      tips: translate(ctx, 'QINGSTOR_TIPS_ACCESS_KEY_SECRET'),
      default: userConfig.accessKeySecret || '',
      required: true,
    },
    {
      name: 'bucket',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_BUCKET'),
      message: translate(ctx, 'QINGSTOR_MSG_BUCKET'),
      tips: translate(ctx, 'QINGSTOR_TIPS_BUCKET'),
      default: userConfig.bucket || '',
      required: true,
    },
    {
      name: 'zone',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_ZONE'),
      message: translate(ctx, 'QINGSTOR_MSG_ZONE'),
      tips: translate(ctx, 'QINGSTOR_TIPS_ZONE'),
      default: userConfig.zone || '',
      required: true,
    },
    {
      name: 'path',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_PATH'),
      message: 'blog/',
      tips: translate(ctx, 'QINGSTOR_TIPS_PATH'),
      default: userConfig.path || '',
      required: false,
    },
    {
      name: 'customUrl',
      type: 'input',
      alias: translate(ctx, 'QINGSTOR_ALIAS_CUSTOM_URL'),
      message: 'https://qingstor.com',
      tips: translate(ctx, 'QINGSTOR_TIPS_CUSTOM_URL'),
      default: userConfig.customUrl || '',
      required: false,
    },
    {
      name: 'deleteRemote',
      type: 'confirm',
      alias: translate(ctx, 'QINGSTOR_ALIAS_DELETE_REMOTE'),
      message: translate(ctx, 'QINGSTOR_MSG_DELETE_REMOTE'),
      tips: translate(ctx, 'QINGSTOR_TIPS_DELETE_REMOTE'),
      default: userConfig.deleteRemote === true,
      required: false,
    },
  ]
}
