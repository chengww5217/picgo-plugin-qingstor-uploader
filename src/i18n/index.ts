import { IPicGo } from 'picgo'
import { Language, LocaleTexts } from '../typings'
import { ERRORS, NETWORK_ERRORS } from '../utils/error'

/** Every language PicGo ships with. */
const LANGUAGES: Language[] = ['zh-CN', 'zh-TW', 'en', 'ja', 'ko']

/**
 * User facing texts owned by this plugin (config form, GUI menu).
 * Error texts live in `utils/error.ts` and are merged in below.
 */
const UI: Record<string, LocaleTexts> = {
  QINGSTOR_ALIAS_ACCESS_KEY_ID: {
    'zh-CN': 'AccessKeyId',
    'zh-TW': 'AccessKeyId',
    en: 'AccessKeyId',
    ja: 'AccessKeyId',
    ko: 'AccessKeyId',
  },
  QINGSTOR_ALIAS_ACCESS_KEY_SECRET: {
    'zh-CN': 'AccessKeySecret',
    'zh-TW': 'AccessKeySecret',
    en: 'AccessKeySecret',
    ja: 'AccessKeySecret',
    ko: 'AccessKeySecret',
  },
  QINGSTOR_ALIAS_BUCKET: {
    'zh-CN': 'Bucket 名称',
    'zh-TW': 'Bucket 名稱',
    en: 'Bucket',
    ja: 'Bucket 名',
    ko: 'Bucket 이름',
  },
  QINGSTOR_ALIAS_ZONE: {
    'zh-CN': '区域',
    'zh-TW': '區域',
    en: 'Zone',
    ja: 'リージョン',
    ko: '리전',
  },
  QINGSTOR_ALIAS_PATH: {
    'zh-CN': '存储路径',
    'zh-TW': '儲存路徑',
    en: 'Storage path',
    ja: '保存パス',
    ko: '저장 경로',
  },
  QINGSTOR_ALIAS_ENDPOINT: {
    'zh-CN': '对象存储域名',
    'zh-TW': '物件儲存網域',
    en: 'Endpoint',
    ja: 'エンドポイント',
    ko: '엔드포인트',
  },
  QINGSTOR_MSG_ACCESS_KEY_ID: {
    'zh-CN': '请输入 AccessKeyId',
    'zh-TW': '請輸入 AccessKeyId',
    en: 'Enter your AccessKeyId',
    ja: 'AccessKeyId を入力',
    ko: 'AccessKeyId를 입력하세요',
  },
  QINGSTOR_MSG_ACCESS_KEY_SECRET: {
    'zh-CN': '请输入 AccessKeySecret',
    'zh-TW': '請輸入 AccessKeySecret',
    en: 'Enter your AccessKeySecret',
    ja: 'AccessKeySecret を入力',
    ko: 'AccessKeySecret를 입력하세요',
  },
  QINGSTOR_MSG_BUCKET: {
    'zh-CN': '请输入 Bucket 名称',
    'zh-TW': '請輸入 Bucket 名稱',
    en: 'Enter the bucket name',
    ja: 'Bucket 名を入力',
    ko: 'Bucket 이름을 입력하세요',
  },
  QINGSTOR_MSG_ZONE: {
    'zh-CN': '请输入区域代码，例如 pek3b',
    'zh-TW': '請輸入區域代碼，例如 pek3b',
    en: 'Enter the zone id, e.g. pek3b',
    ja: 'リージョンコードを入力（例: pek3b）',
    ko: '리전 코드를 입력하세요 (예: pek3b)',
  },
  QINGSTOR_TIPS_ACCESS_KEY_ID: {
    'zh-CN': '在青云控制台「API 密钥」页面创建并获取',
    'zh-TW': '在青雲主控台「API 金鑰」頁面建立並取得',
    en: 'Create and copy it from the "API Keys" page of the QingCloud console',
    ja: '青雲コンソールの「API キー」ページで作成して取得します',
    ko: 'QingCloud 콘솔의 "API 키" 페이지에서 생성해 복사하세요',
  },
  QINGSTOR_TIPS_ACCESS_KEY_SECRET: {
    'zh-CN': '与 AccessKeyId 配对使用，请妥善保管，不要泄露',
    'zh-TW': '與 AccessKeyId 配對使用，請妥善保管，請勿洩漏',
    en: 'Paired with AccessKeyId. Keep it secret.',
    ja: 'AccessKeyId とペアで使用します。厳重に保管し、漏洩しないでください',
    ko: 'AccessKeyId와 함께 사용됩니다. 안전하게 보관하세요',
  },
  QINGSTOR_TIPS_BUCKET: {
    'zh-CN': 'Bucket 需要提前创建，名称只支持小写字母、数字和中划线（-）',
    'zh-TW': 'Bucket 需事先建立，名稱僅支援小寫字母、數字與連字號（-）',
    en: 'The bucket must already exist. Its name allows only lowercase letters, digits and hyphens (-).',
    ja: 'Bucket は事前に作成してください。名前は小文字・数字・ハイフン（-）のみ使用できます',
    ko: 'Bucket은 미리 생성해야 하며, 이름은 소문자·숫자·하이픈(-)만 사용할 수 있습니다',
  },
  QINGSTOR_TIPS_ZONE: {
    'zh-CN': '青云公有云常见区域：pek3a、pek3b、sh1a、gd2；私有云或其他区域请填写实际区域',
    'zh-TW': '青雲公有雲常見區域：pek3a、pek3b、sh1a、gd2；私有雲或其他區域請填寫實際區域',
    en: 'Common QingCloud zones: pek3a, pek3b, sh1a, gd2. For private cloud or other regions, enter the actual zone.',
    ja: '青雲パブリッククラウドの一般的なリージョン：pek3a、pek3b、sh1a、gd2；プライベートクラウドなどは実際のリージョンを入力してください',
    ko: 'QingCloud 퍼블릭 클라우드의 일반 리전: pek3a, pek3b, sh1a, gd2. 프라이빗 클라우드 등은 실제 리전을 입력하세요',
  },
  QINGSTOR_TIPS_PATH: {
    'zh-CN': '图片会存放到 Bucket 下的这个路径，留空表示根目录',
    'zh-TW': '圖片會存放到 Bucket 下的此路徑，留空表示根目錄',
    en: 'Images are stored under this path in the bucket. Leave empty for the root.',
    ja: '画像は Bucket 内のこのパスに保存されます。空欄の場合はルートディレクトリです',
    ko: '이미지는 Bucket 내 이 경로에 저장됩니다. 비워 두면 루트 디렉터리입니다',
  },
  QINGSTOR_TIPS_ENDPOINT: {
    'zh-CN':
      '默认 https://qingstor.com；也可用 https://qsstor.com；私有云请填写自定义地址，例如 https://qingstor.example.com',
    'zh-TW':
      '預設 https://qingstor.com；也可用 https://qsstor.com；私有雲請填寫自訂位址，例如 https://qingstor.example.com',
    en: 'Default https://qingstor.com; https://qsstor.com is also supported; for private cloud, enter your own address, e.g. https://qingstor.example.com',
    ja: '既定は https://qingstor.com；https://qsstor.com も使用できます；プライベートクラウドは独自のアドレスを入力してください（例: https://qingstor.example.com）',
    ko: '기본값은 https://qingstor.com이며 https://qsstor.com도 사용할 수 있습니다. 프라이빗 클라우드는 자체 주소를 입력하세요 (예: https://qingstor.example.com)',
  },
  QINGSTOR_MENU_CHECK_CONFIG: {
    'zh-CN': '检查配置与连接',
    'zh-TW': '檢查設定與連線',
    en: 'Check config & connection',
    ja: '設定と接続を確認',
    ko: '설정 및 연결 확인',
  },
  QINGSTOR_CHECK_TITLE: {
    'zh-CN': '青云 QingStor',
    'zh-TW': '青雲 QingStor',
    en: 'QingStor',
    ja: '青雲 QingStor',
    ko: 'QingStor',
  },
  QINGSTOR_CHECK_NO_CONFIG: {
    'zh-CN': '还没有配置青云 QingStor 图床，请先在图床设置里完成配置',
    'zh-TW': '尚未設定青雲 QingStor 圖床，請先在圖床設定中完成設定',
    en: 'QingStor is not configured yet. Please finish the configuration first.',
    ja: '青雲 QingStor がまだ設定されていません。先に画像ホスティング設定を完了してください',
    ko: 'QingStor가 아직 설정되지 않았습니다. 먼저 이미지 호스팅 설정을 완료해 주세요',
  },
  QINGSTOR_CHECK_CONNECT_OK: {
    'zh-CN': '配置完整，已成功连接青云服务',
    'zh-TW': '設定完整，已成功連線青雲服務',
    en: 'Configuration is complete and QingStor is reachable',
    ja: '設定は完全で、青雲サービスに接続できました',
    ko: '설정이 완료되었고 QingStor에 연결되었습니다',
  },
  QINGSTOR_CHECK_CONNECT_FAIL: {
    'zh-CN': '配置完整，但无法连接青云服务，请检查区域(zone)、对象存储域名和网络',
    'zh-TW': '設定完整，但無法連線青雲服務，請檢查區域(zone)、物件儲存網域與網路',
    en: 'Configuration is complete, but QingStor is unreachable. Please check the zone, endpoint and network.',
    ja: '設定は完全ですが、青雲サービスに接続できません。リージョン(zone)、エンドポイント、ネットワークを確認してください',
    ko: '설정은 완료되었지만 QingStor에 연결할 수 없습니다. 리전(zone), 엔드포인트, 네트워크를 확인해 주세요',
  },
  QINGSTOR_ALIAS_DELETE_REMOTE: {
    'zh-CN': '同步删除云端对象',
    'zh-TW': '同步刪除雲端物件',
    en: 'Sync delete objects',
    ja: 'オブジェクトも同時に削除',
    ko: '오브젝트 동시 삭제',
  },
  QINGSTOR_MSG_DELETE_REMOTE: {
    'zh-CN': '删除相册图片时，是否同步删除对象存储中的对象？',
    'zh-TW': '刪除相簿圖片時，是否同步刪除物件儲存中的物件？',
    en: 'Also delete the object from the object storage when deleting an album image?',
    ja: 'アルバムの画像を削除するとき、オブジェクトストレージのオブジェクトも削除しますか？',
    ko: '앨범 이미지를 삭제할 때 오브젝트 스토리지의 오브젝트도 함께 삭제할까요?',
  },
  QINGSTOR_TIPS_DELETE_REMOTE: {
    'zh-CN': '开启后，从相册删除青云 QingStor 的图片时会一并删除对象存储中的对象；关闭则只删除相册记录',
    'zh-TW': '開啟後，從相簿刪除青雲 QingStor 的圖片時會一併刪除物件儲存中的物件；關閉則只刪除相簿記錄',
    en: 'When on, deleting a QingStor image from the album also deletes the object from the storage. When off, only the album entry is removed.',
    ja: 'オンにすると、アルバムから青雲 QingStor の画像を削除する際にオブジェクトストレージのオブジェクトも削除します。オフの場合はアルバムの項目のみ削除します',
    ko: '켜면 앨범에서 QingStor 이미지를 삭제할 때 오브젝트 스토리지의 오브젝트도 함께 삭제합니다. 끄면 앨범 항목만 삭제됩니다',
  },
  QINGSTOR_DELETE_SUCCESS: {
    'zh-CN': '已从青云 QingStor 删除 ${count} 个对象',
    'zh-TW': '已從青雲 QingStor 刪除 ${count} 個物件',
    en: 'Deleted ${count} object(s) from QingStor',
    ja: '青雲 QingStor から ${count} 個のオブジェクトを削除しました',
    ko: 'QingStor에서 오브젝트 ${count}개를 삭제했습니다',
  },
  QINGSTOR_DELETE_PARTIAL: {
    'zh-CN': '同步删除完成：成功 ${success} 个，失败 ${failed} 个，详情见日志',
    'zh-TW': '同步刪除完成：成功 ${success} 個，失敗 ${failed} 個，詳情見日誌',
    en: 'Sync delete finished: ${success} succeeded, ${failed} failed. See the log for details.',
    ja: '同期削除が完了しました：成功 ${success} 件、失敗 ${failed} 件。詳細はログを確認してください',
    ko: '동시 삭제 완료: 성공 ${success}개, 실패 ${failed}개. 자세한 내용은 로그를 확인하세요',
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
 * Chinese fallback for the PicGo built-in keys this plugin uses, so a missing
 * translation never leaks a raw key. Owned strings live in `UI`/`ERRORS` above.
 */
const BUILTIN_FALLBACKS: Record<string, string> = {
  UPLOAD_FAILED: '上传失败！',
  CHECK_SETTINGS_AND_NETWORK: '请检查配置项或网络情况',
}

/** zh-CN text for every key this plugin may translate, used as a last resort. */
const FALLBACKS: Record<string, string> = { ...buildLocales('zh-CN'), ...BUILTIN_FALLBACKS }

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

function fillArgs(text: string, args?: Record<string, string | number>): string {
  if (!args) return text
  return text.replace(/\$\{(\w+)\}/g, (match, name) => (name in args ? String(args[name]) : match))
}

/**
 * Translate an i18n key, replacing `${name}` placeholders from `args`.
 * Falls back to the plugin's zh-CN text when i18n is unavailable or the
 * current language has no entry, so a raw key is never shown to the user.
 * @param ctx {IPicGo} The context holding the i18n manager.
 * @param key {string} The i18n key.
 * @param args {Record<string, string | number>} Values for `${name}` placeholders.
 * @return {string} The translated message.
 */
export function translate(ctx: IPicGo, key: string, args?: Record<string, string | number>): string {
  let i18nArgs: Record<string, string> | undefined
  if (args) {
    i18nArgs = {}
    for (const [name, value] of Object.entries(args)) i18nArgs[name] = String(value)
  }
  const message = ctx?.i18n?.translate(key, i18nArgs)
  if (message && message !== key) return message
  return fillArgs(FALLBACKS[key] ?? key, args)
}

/**
 * Resolve a QingStor or network error code into a localized message.
 * @param ctx {IPicGo} The context holding the i18n manager.
 * @param {string} code The error code.
 * @return {string | undefined} The message, or undefined for an unknown code.
 */
export function translateError(ctx: IPicGo, code: string): string | undefined {
  if (ERRORS[code]) return translate(ctx, `QINGSTOR_ERR_${code.toUpperCase()}`)
  if (NETWORK_ERRORS[code]) return translate(ctx, `QINGSTOR_NET_${code.toUpperCase()}`)
  return undefined
}
