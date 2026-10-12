import { IPicGo } from 'picgo'
import { Language, LocaleTexts } from '../typings'
import { ERRORS, NETWORK_ERRORS } from '../utils/error'

/** Every language PicGo ships with. */
const LANGUAGES: Language[] = ['zh-CN', 'zh-TW', 'en']

/**
 * User facing texts owned by this plugin (config form, GUI menu).
 * Error texts live in `utils/error.ts` and are merged in below.
 */
const UI: Record<string, LocaleTexts> = {
  QINGSTOR_ALIAS_ACCESS_KEY_ID: {
    'zh-CN': 'AccessKeyId',
    'zh-TW': 'AccessKeyId',
    en: 'AccessKeyId',
  },
  QINGSTOR_ALIAS_ACCESS_KEY_SECRET: {
    'zh-CN': 'AccessKeySecret',
    'zh-TW': 'AccessKeySecret',
    en: 'AccessKeySecret',
  },
  QINGSTOR_ALIAS_BUCKET: {
    'zh-CN': 'Bucket 名称',
    'zh-TW': 'Bucket 名稱',
    en: 'Bucket',
  },
  QINGSTOR_ALIAS_ZONE: {
    'zh-CN': '区域',
    'zh-TW': '區域',
    en: 'Zone',
  },
  QINGSTOR_ALIAS_PATH: {
    'zh-CN': '存储路径',
    'zh-TW': '儲存路徑',
    en: 'Storage path',
  },
  QINGSTOR_ALIAS_CUSTOM_URL: {
    'zh-CN': '自定义网址',
    'zh-TW': '自訂網址',
    en: 'Custom URL',
  },
  QINGSTOR_MSG_ACCESS_KEY_ID: {
    'zh-CN': '请输入 AccessKeyId',
    'zh-TW': '請輸入 AccessKeyId',
    en: 'Enter your AccessKeyId',
  },
  QINGSTOR_MSG_ACCESS_KEY_SECRET: {
    'zh-CN': '请输入 AccessKeySecret',
    'zh-TW': '請輸入 AccessKeySecret',
    en: 'Enter your AccessKeySecret',
  },
  QINGSTOR_MSG_BUCKET: {
    'zh-CN': '请输入 Bucket 名称',
    'zh-TW': '請輸入 Bucket 名稱',
    en: 'Enter the bucket name',
  },
  QINGSTOR_MSG_ZONE: {
    'zh-CN': '请输入区域代码，例如 pek3b',
    'zh-TW': '請輸入區域代碼，例如 pek3b',
    en: 'Enter the zone id, e.g. pek3b',
  },
  QINGSTOR_TIPS_ACCESS_KEY_ID: {
    'zh-CN': '在青云控制台「API 密钥」页面创建并获取',
    'zh-TW': '在青雲主控台「API 金鑰」頁面建立並取得',
    en: 'Create and copy it from the QingCloud console "API Keys" page',
  },
  QINGSTOR_TIPS_ACCESS_KEY_SECRET: {
    'zh-CN': '与 AccessKeyId 配对使用，请妥善保管，不要泄露',
    'zh-TW': '與 AccessKeyId 配對使用，請妥善保管，請勿洩漏',
    en: 'Used together with AccessKeyId. Keep it secret.',
  },
  QINGSTOR_TIPS_BUCKET: {
    'zh-CN': 'Bucket 需要提前创建，名称只支持小写字母、数字和中划线（-）',
    'zh-TW': 'Bucket 需事先建立，名稱僅支援小寫字母、數字與連字號（-）',
    en: 'Create the bucket first. Names only allow lowercase letters, digits and hyphens (-).',
  },
  QINGSTOR_TIPS_ZONE: {
    'zh-CN': '青云公有云常见区域：pek3a、pek3b、sh1a、gd2；私有云或其他区域请直接填写实际值',
    'zh-TW': '青雲公有雲常見區域：pek3a、pek3b、sh1a、gd2；私有雲或其他區域請直接填寫實際值',
    en: 'Common QingCloud zones: pek3a, pek3b, sh1a, gd2. For private cloud or other regions, type the actual value.',
  },
  QINGSTOR_TIPS_PATH: {
    'zh-CN': '图片会存放到 Bucket 下的这个路径，留空表示根目录',
    'zh-TW': '圖片會存放到 Bucket 下的此路徑，留空表示根目錄',
    en: 'Images are stored under this path in the bucket. Leave empty for the root.',
  },
  QINGSTOR_TIPS_CUSTOM_URL: {
    'zh-CN': '仅私有云或自定义域名时填写，例如 https://qingstor.example.com',
    'zh-TW': '僅私有雲或自訂網域時填寫，例如 https://qingstor.example.com',
    en: 'Only for private cloud or a custom domain, e.g. https://qingstor.example.com',
  },
  QINGSTOR_MENU_CHECK_CONFIG: {
    'zh-CN': '检查配置与连接',
    'zh-TW': '檢查設定與連線',
    en: 'Check config & connection',
  },
  QINGSTOR_CHECK_TITLE: {
    'zh-CN': '青云 QingStor',
    'zh-TW': '青雲 QingStor',
    en: 'QingStor',
  },
  QINGSTOR_CHECK_NO_CONFIG: {
    'zh-CN': '还没有配置青云 QingStor 图床，请先在图床设置里完成配置',
    'zh-TW': '尚未設定青雲 QingStor 圖床，請先在圖床設定中完成設定',
    en: 'QingStor is not configured yet. Please finish the configuration first.',
  },
  QINGSTOR_CHECK_CONFIG_OK: {
    'zh-CN': '配置完整',
    'zh-TW': '設定完整',
    en: 'Configuration is complete',
  },
  QINGSTOR_CHECK_CONNECT_OK: {
    'zh-CN': '配置完整，已成功连接青云服务',
    'zh-TW': '設定完整，已成功連線青雲服務',
    en: 'Configuration is complete and QingStor is reachable',
  },
  QINGSTOR_CHECK_CONNECT_FAIL: {
    'zh-CN': '配置完整，但无法连接青云服务，请检查区域(zone)、自定义网址和网络',
    'zh-TW': '設定完整，但無法連線青雲服務，請檢查區域(zone)、自訂網址與網路',
    en: 'Configuration is complete, but QingStor is unreachable. Please check the zone, custom URL and network.',
  },
}

function buildLocales(language: Language): Record<string, string> {
  const locales: Record<string, string> = {}
  for (const [key, texts] of Object.entries(UI)) {
    locales[key] = texts[language]
  }
  for (const [code, texts] of Object.entries(ERRORS)) {
    locales[`QINGSTOR_ERR_${code.toUpperCase()}`] = texts[language]
  }
  for (const [code, texts] of Object.entries(NETWORK_ERRORS)) {
    locales[`QINGSTOR_NET_${code.toUpperCase()}`] = texts[language]
  }
  return locales
}

/**
 * Register every supported language pack on the PicGo i18n manager.
 * Safe to call on an older PicGo without i18n support.
 * @param ctx {IPicGo} The context holding the i18n manager.
 */
export function registerLocales(ctx: IPicGo): void {
  const i18n = ctx?.i18n
  if (!i18n?.addLocale) return
  for (const language of LANGUAGES) {
    try {
      i18n.addLocale(language, buildLocales(language))
    } catch {
      // Ignore: an older PicGo may not know this language.
    }
  }
}

/**
 * Translate a message, falling back to `fallback` when i18n is unavailable
 * or when the key is unknown (picgo returns the key itself in that case).
 * @param ctx {IPicGo} The context holding the i18n manager.
 * @param key {string} The i18n key.
 * @param fallback {string} Text used when the key can not be translated.
 * @return {string} The translated message.
 */
export function translate(ctx: IPicGo, key: string, fallback: string): string {
  const message = ctx?.i18n?.translate(key)
  return message && message !== key ? message : fallback
}

/**
 * Resolve a QingStor or network error code into a localized message.
 * @param ctx {IPicGo} The context holding the i18n manager.
 * @param code {string} The error code.
 * @return {string | undefined} The message, or undefined for an unknown code.
 */
export function translateError(ctx: IPicGo, code: string): string | undefined {
  if (ERRORS[code]) {
    return translate(ctx, `QINGSTOR_ERR_${code.toUpperCase()}`, ERRORS[code]['zh-CN'])
  }
  if (NETWORK_ERRORS[code]) {
    return translate(ctx, `QINGSTOR_NET_${code.toUpperCase()}`, NETWORK_ERRORS[code]['zh-CN'])
  }
  return undefined
}
