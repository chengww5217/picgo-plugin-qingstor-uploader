import { QingStorError } from '../typings'

/**
 * All errors of qingstor server returns.
 * Format into Chinese strings.
 */
export const ERRORS = {
  'invalid_access_key_id': 'access key 不正确',
  'invalid_range': '请求头 Range 不符合规则',
  'request_expired': '请检查本地时间是否正确',
  'signature_not_matched': '请求的签名不匹配',
  'invalid_argument': '请求中的参数值非法',
  'bad_digest': 'Content-MD5 有误',
  'permission_denied': '没有权限执行此次请求',
  'bucket_already_exists': '创建的 bucket 已存在',
  'bucket_not_exists': '访问的 bucket 不存在',
  'object_not_exists': '访问的 object 不存在',
  'invalid_bucket_name': '创建的 bucket 名称非法或重名',
  'too_many_buckets': '创建的 bucket 超出限额',
  'bucket_not_empty': '删除的 bucket 非空',
  'bucket_not_active': '访问的 bucket 不是活跃状态',
  'lease_not_ready': 'bucket 租赁信息未准备好',
  'method_not_allowed': '请求方法不被允许',
  'invalid_request': '请求中的消息体不符合规定',
  'invalid_location': '请求的区域不存在',
  'max_requests_exceeded': '请求创建和删除 bucket 过于频繁',
  'precondition_failed': '请求的 Header 中某些先决条件不满足',
  'invalid_object_state': 'object 目前的状态不能接收此次操作',
  'invalid_object_name': 'object 名称不符合规定',
  'entity_too_small': '没有权限执行此次请求',
  'entity_too_large': 'object 数据超出最大限制 5GB',
  'max_parts_exceeded': '分块数超出系统最大数量 1000',
  'upload_not_exists': 'upload id 不存在',
  'account_problem': '账号异常，请提工单与青云联系',
  'delinquent_account': '账号欠费',
  'invalid_json': '请求消息体的 json 格式错误',
  'access_denied': '请求被拒绝',
  'incomplete_body': '请求消息体不完整',
  'form_policy_violated': '表单内容与策略不相符',
  'cname_error': 'CNAME 设置错误',
  'too_many_objects': '操作包含的 object 数量太大',
  'internal_error': '对象存储系统内部错误',
  'service_unavailable': '对象存储系统临时不可用'
}

export const CONFIG_NOT_FOUND_ERROR: QingStorError = {
  error: '{code: "找不到青云 QingStor 图床配置文件"}'
}
