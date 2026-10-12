import { LocaleTexts, QingStorError } from '../typings'

/**
 * All errors of qingstor server returns.
 * Translated for every language PicGo ships with.
 */
export const ERRORS: Record<string, LocaleTexts> = {
  'config_not_found': {
    'zh-CN': '找不到青云 QingStor 图床配置文件',
    'zh-TW': '找不到青雲 QingStor 圖床設定檔',
    'en': 'QingStor uploader config not found'
  },
  'missing_access_key_id': {
    'zh-CN': '请先配置 AccessKeyId',
    'zh-TW': '請先設定 AccessKeyId',
    'en': 'Please configure AccessKeyId first'
  },
  'missing_access_key_secret': {
    'zh-CN': '请先配置 AccessKeySecret',
    'zh-TW': '請先設定 AccessKeySecret',
    'en': 'Please configure AccessKeySecret first'
  },
  'missing_bucket': {
    'zh-CN': '请先配置 Bucket 名称',
    'zh-TW': '請先設定 Bucket 名稱',
    'en': 'Please configure the bucket name first'
  },
  'missing_zone': {
    'zh-CN': '请先配置区域(zone)',
    'zh-TW': '請先設定區域(zone)',
    'en': 'Please configure the region (zone) first'
  },
  'empty_image': {
    'zh-CN': '图片内容为空，无法上传',
    'zh-TW': '圖片內容為空，無法上傳',
    'en': 'The image data is empty, cannot upload'
  },
  'invalid_access_key_id': {
    'zh-CN': 'access key 不正确',
    'zh-TW': 'access key 不正確',
    'en': 'Invalid access key'
  },
  'invalid_range': {
    'zh-CN': '请求头 Range 不符合规则',
    'zh-TW': '請求標頭 Range 不符合規則',
    'en': 'Invalid Range header'
  },
  'request_expired': {
    'zh-CN': '请检查本地时间是否正确',
    'zh-TW': '請檢查本機時間是否正確',
    'en': 'Please check that your system time is correct'
  },
  'signature_not_matched': {
    'zh-CN': '请求的签名不匹配',
    'zh-TW': '請求的簽章不符',
    'en': 'Request signature does not match'
  },
  'invalid_argument': {
    'zh-CN': '请求中的参数值非法',
    'zh-TW': '請求中的參數值不合法',
    'en': 'Invalid argument in the request'
  },
  'bad_digest': {
    'zh-CN': 'Content-MD5 有误',
    'zh-TW': 'Content-MD5 有誤',
    'en': 'Invalid Content-MD5'
  },
  'permission_denied': {
    'zh-CN': '没有权限执行此次请求',
    'zh-TW': '沒有權限執行此次請求',
    'en': 'Permission denied for this request'
  },
  'bucket_already_exists': {
    'zh-CN': '创建的 bucket 已存在',
    'zh-TW': '建立的 bucket 已存在',
    'en': 'The bucket already exists'
  },
  'bucket_not_exists': {
    'zh-CN': '访问的 bucket 不存在',
    'zh-TW': '存取的 bucket 不存在',
    'en': 'The bucket does not exist'
  },
  'object_not_exists': {
    'zh-CN': '访问的 object 不存在',
    'zh-TW': '存取的 object 不存在',
    'en': 'The object does not exist'
  },
  'invalid_bucket_name': {
    'zh-CN': '创建的 bucket 名称非法或重名',
    'zh-TW': '建立的 bucket 名稱不合法或重複',
    'en': 'Invalid or duplicated bucket name'
  },
  'too_many_buckets': {
    'zh-CN': '创建的 bucket 超出限额',
    'zh-TW': '建立的 bucket 超出配額',
    'en': 'Bucket quota exceeded'
  },
  'bucket_not_empty': {
    'zh-CN': '删除的 bucket 非空',
    'zh-TW': '刪除的 bucket 非空',
    'en': 'The bucket is not empty'
  },
  'bucket_not_active': {
    'zh-CN': '访问的 bucket 不是活跃状态',
    'zh-TW': '存取的 bucket 不是活躍狀態',
    'en': 'The bucket is not active'
  },
  'lease_not_ready': {
    'zh-CN': 'bucket 租赁信息未准备好',
    'zh-TW': 'bucket 租賃資訊尚未就緒',
    'en': 'Bucket lease is not ready'
  },
  'method_not_allowed': {
    'zh-CN': '请求方法不被允许',
    'zh-TW': '請求方法不被允許',
    'en': 'Request method not allowed'
  },
  'invalid_request': {
    'zh-CN': '请求中的消息体不符合规定',
    'zh-TW': '請求中的訊息內容不符合規定',
    'en': 'Invalid request body'
  },
  'invalid_location': {
    'zh-CN': '请求的区域不存在',
    'zh-TW': '請求的區域不存在',
    'en': 'The requested region does not exist'
  },
  'max_requests_exceeded': {
    'zh-CN': '请求创建和删除 bucket 过于频繁',
    'zh-TW': '建立與刪除 bucket 過於頻繁',
    'en': 'Too many bucket create/delete requests'
  },
  'precondition_failed': {
    'zh-CN': '请求的 Header 中某些先决条件不满足',
    'zh-TW': '請求標頭中的部分前置條件未滿足',
    'en': 'Request preconditions not met'
  },
  'invalid_object_state': {
    'zh-CN': 'object 目前的状态不能接收此次操作',
    'zh-TW': 'object 目前的狀態無法接受此次操作',
    'en': 'The object is in a state that rejects this operation'
  },
  'invalid_object_name': {
    'zh-CN': 'object 名称不符合规定',
    'zh-TW': 'object 名稱不符合規定',
    'en': 'Invalid object name'
  },
  'entity_too_small': {
    'zh-CN': 'object 数据过小',
    'zh-TW': 'object 資料過小',
    'en': 'Object data is too small'
  },
  'entity_too_large': {
    'zh-CN': 'object 数据超出最大限制 5GB',
    'zh-TW': 'object 資料超出 5GB 上限',
    'en': 'Object data exceeds the 5GB limit'
  },
  'max_parts_exceeded': {
    'zh-CN': '分块数超出系统最大数量 1000',
    'zh-TW': '分塊數超出系統上限 1000',
    'en': 'Too many parts (max 1000)'
  },
  'upload_not_exists': {
    'zh-CN': 'upload id 不存在',
    'zh-TW': 'upload id 不存在',
    'en': 'Upload id does not exist'
  },
  'account_problem': {
    'zh-CN': '账号异常，请提工单与青云联系',
    'zh-TW': '帳號異常，請提交工單與青雲聯繫',
    'en': 'Account problem, please contact QingCloud support'
  },
  'delinquent_account': {
    'zh-CN': '账号欠费',
    'zh-TW': '帳號欠費',
    'en': 'Account is in arrears'
  },
  'invalid_json': {
    'zh-CN': '请求消息体的 json 格式错误',
    'zh-TW': '請求訊息的 json 格式錯誤',
    'en': 'Invalid JSON in the request body'
  },
  'access_denied': {
    'zh-CN': '请求被拒绝',
    'zh-TW': '請求被拒絕',
    'en': 'Request denied'
  },
  'incomplete_body': {
    'zh-CN': '请求消息体不完整',
    'zh-TW': '請求訊息不完整',
    'en': 'Incomplete request body'
  },
  'form_policy_violated': {
    'zh-CN': '表单内容与策略不相符',
    'zh-TW': '表單內容與策略不符',
    'en': 'Form content violates the policy'
  },
  'cname_error': {
    'zh-CN': 'CNAME 设置错误',
    'zh-TW': 'CNAME 設定錯誤',
    'en': 'CNAME is misconfigured'
  },
  'too_many_objects': {
    'zh-CN': '操作包含的 object 数量太大',
    'zh-TW': '操作包含的 object 數量過多',
    'en': 'Too many objects in the operation'
  },
  'internal_error': {
    'zh-CN': '对象存储系统内部错误',
    'zh-TW': '物件儲存系統內部錯誤',
    'en': 'QingStor internal error'
  },
  'service_unavailable': {
    'zh-CN': '对象存储系统临时不可用',
    'zh-TW': '物件儲存系統暫時無法使用',
    'en': 'QingStor is temporarily unavailable'
  }
}

/**
 * Errors thrown by the client (not by QingStor), e.g. network problems and
 * the request timeout set by the plugin. Translated as well.
 */
export const NETWORK_ERRORS: Record<string, LocaleTexts> = {
  'ECONNABORTED': {
    'zh-CN': '上传超时，请检查网络后重试',
    'zh-TW': '上傳逾時，請檢查網路後重試',
    'en': 'Upload timed out, please check your network and retry'
  },
  'ETIMEDOUT': {
    'zh-CN': '上传超时，请检查网络后重试',
    'zh-TW': '上傳逾時，請檢查網路後重試',
    'en': 'Upload timed out, please check your network and retry'
  },
  'ENOTFOUND': {
    'zh-CN': '无法连接到青云服务，请检查区域(zone)和自定义网址是否正确',
    'zh-TW': '無法連線至青雲服務，請檢查區域(zone)與自訂網址是否正確',
    'en': 'Cannot reach QingStor, please check the region (zone) and custom URL'
  },
  'ECONNREFUSED': {
    'zh-CN': '无法连接到青云服务，请检查网络或自定义网址',
    'zh-TW': '無法連線至青雲服務，請檢查網路或自訂網址',
    'en': 'Cannot reach QingStor, please check your network or custom URL'
  },
  'ECONNRESET': {
    'zh-CN': '连接被重置，请稍后重试',
    'zh-TW': '連線被重設，請稍後重試',
    'en': 'Connection reset, please try again later'
  },
  'ERR_CANCELED': {
    'zh-CN': '上传已取消',
    'zh-TW': '上傳已取消',
    'en': 'Upload cancelled'
  }
}

export const CONFIG_NOT_FOUND_ERROR: QingStorError = {
  code: 'config_not_found'
}
