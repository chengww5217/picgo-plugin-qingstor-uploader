const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { describe, it } = require('node:test')

const {
  generatePath,
  getHost,
  generateSignature,
  uploadOptions,
  validateOptions,
  handleError
} = require('../dist/utils/index.js')
const plugin = require('../dist/index.js')

const options = {
  accessKeyId: 'AK',
  accessKeySecret: 'SK',
  bucket: 'bkt',
  zone: 'pek3b',
  path: '',
  customUrl: ''
}
const image = Buffer.from('image data')

const contentTypes = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.unknown': 'application/octet-stream'
}

/**
 * Recompute the signature the way QingStor does, using a given Date header.
 */
function signAsQingStor (date, { options: overrides = {}, fileName = 'a.png', extname = '.png' } = {}) {
  const opts = { ...options, ...overrides }
  const path = generatePath(opts.path)
  const strToSign = `PUT\n\n${contentTypes[extname]}\n${date}\n/${opts.bucket}${path}/${encodeURI(fileName)}`
  const signature = crypto.createHmac('sha256', opts.accessKeySecret).update(strToSign).digest('base64')
  return `QS ${opts.accessKeyId}:${signature}`
}

/**
 * Make every `new Date()` return a moment one second later than the previous
 * one, so two separate calls can never produce the same timestamp.
 * Used to catch the signature/Date divergence regression.
 */
function withAdvancingClock (fn) {
  const RealDate = Date
  let ticks = 0
  class FakeDate extends RealDate {
    constructor (...args) {
      super(...(args.length ? args : [RealDate.now() + (ticks += 1000)]))
    }
  }
  global.Date = FakeDate
  try {
    return fn()
  } finally {
    global.Date = RealDate
  }
}

/**
 * Build a fake PicGo context, and register the plugin on it.
 */
function createCtx (config, output = []) {
  const requests = []
  const notifications = []
  let uploader
  const ctx = {
    getConfig: () => config,
    output,
    request: async (requestOptions) => { requests.push(requestOptions) },
    log: { error: () => {} },
    helper: { uploader: { register: (id, handler) => { uploader = handler } } },
    emit: (name, payload) => { notifications.push(payload) }
  }
  plugin(ctx).register()
  return { ctx, requests, notifications, get uploader () { return uploader } }
}

describe('generatePath', () => {
  const cases = [
    ['', ''],
    ['/', ''],
    ['blog', '/blog'],
    ['blog/', '/blog'],
    ['a b/', '/a%20b'],
    ['博客/', '/%E5%8D%9A%E5%AE%A2']
  ]
  for (const [input, expected] of cases) {
    it(`将 ${JSON.stringify(input)} 转为 ${JSON.stringify(expected)}`, () => {
      assert.equal(generatePath(input), expected)
    })
  }
})

describe('getHost', () => {
  it('默认使用 https 与青云域名', () => {
    assert.deepEqual(getHost(''), { protocol: 'https', host: 'qingstor.com' })
  })

  it('支持自定义域名', () => {
    assert.deepEqual(getHost('qingstor.example.com'), { protocol: 'https', host: 'qingstor.example.com' })
  })

  it('保留显式的 http 协议', () => {
    assert.deepEqual(getHost('http://qingstor.example.com'), { protocol: 'http', host: 'qingstor.example.com' })
  })

  it('保留显式的 https 协议', () => {
    assert.deepEqual(getHost('https://qingstor.example.com'), { protocol: 'https', host: 'qingstor.example.com' })
  })
})

describe('generateSignature', () => {
  it('返回 QS 前缀的签名', () => {
    const { signature, date } = generateSignature(options, 'a.png', '.png')
    assert.match(signature, /^QS AK:[A-Za-z0-9+/=]{44}$/)
    assert.match(date, /GMT$/)
  })

  it('签名与返回的 date 一致（QingStor 会用请求头的 Date 复算）', () => {
    const { signature, date } = generateSignature(options, 'a.png', '.png')
    assert.equal(signature, signAsQingStor(date))
  })

  it('存储路径参与签名', () => {
    const { signature, date } = generateSignature({ ...options, path: 'blog/' }, 'a.png', '.png')
    assert.equal(signature, signAsQingStor(date, { options: { path: 'blog/' } }))
  })

  it('扩展名决定签名中的 Content-Type', () => {
    const { signature, date } = generateSignature(options, 'a.webp', '.webp')
    assert.equal(signature, signAsQingStor(date, { fileName: 'a.webp', extname: '.webp' }))
  })
})

describe('uploadOptions', () => {
  const build = (overrides = {}, fileName = 'a.png', extname = '.png') => {
    const opts = { ...options, ...overrides }
    const { signature, date } = generateSignature(opts, fileName, extname)
    return uploadOptions(opts, fileName, signature, image, extname, date)
  }

  it('按区域拼出上传地址', () => {
    const request = build()
    assert.equal(request.method, 'PUT')
    assert.equal(request.url, 'https://pek3b.qingstor.com/bkt/a.png')
  })

  it('地址包含 bucket、路径与编码后的文件名', () => {
    const request = build({ bucket: 'bucket-1', path: 'blog/' }, 'a b.png', '.png')
    assert.equal(request.url, 'https://pek3b.qingstor.com/bucket-1/blog/a%20b.png')
  })

  it('跟随自定义域名与协议', () => {
    const request = build({ customUrl: 'http://qingstor.example.com' })
    assert.equal(request.url, 'http://pek3b.qingstor.example.com/bkt/a.png')
  })

  it('请求头的 Date 就是签名用的 date（跨秒回归）', () => {
    // 假时钟保证每次取当前时间都会 +1s：若 uploadOptions 内部又取了一次时间，
    // 请求头 Date 就会与签名所用的时间不同，服务器会判为 signature_not_matched
    const request = withAdvancingClock(() => build())
    assert.equal(request.headers.Authorization, signAsQingStor(request.headers.Date))
  })

  it('带 30 秒超时', () => {
    assert.equal(build().timeout, 30000)
  })

  it('带上必要的请求头', () => {
    const request = build()
    assert.equal(request.headers.Authorization.startsWith('QS AK:'), true)
    assert.equal(request.headers['User-Agent'], 'picgo_plugin_qingstor')
    assert.equal(request.headers['Content-Type'], 'image/png')
  })

  for (const [extname, contentType] of Object.entries(contentTypes)) {
    it(`为 ${extname} 推断 Content-Type 为 ${contentType}`, () => {
      const request = build({}, `a${extname}`, extname)
      assert.equal(request.headers['Content-Type'], contentType)
    })
  }

  it('把图片内容放进 data', () => {
    assert.equal(build().data, image)
  })
})

describe('validateOptions', () => {
  it('完整配置通过校验', () => {
    assert.equal(validateOptions(options), '')
  })

  for (const field of ['accessKeyId', 'accessKeySecret', 'bucket', 'zone']) {
    it(`缺少 ${field} 时返回对应错误码`, () => {
      assert.notEqual(validateOptions({ ...options, [field]: '' }), '')
    })
  }

  it('空配置返回 accessKeyId 相关的错误码', () => {
    assert.equal(validateOptions({}), 'missing_access_key_id')
  })
})

describe('handleError', () => {
  const notify = (err, i18n) => {
    const notifications = []
    handleError(
      { i18n, log: { error: () => {} }, emit: (name, payload) => notifications.push(payload) },
      err
    )
    return notifications[0]
  }

  it('把青云返回的错误码映射为中文', () => {
    const { body } = notify({ error: '{"code":"signature_not_matched"}' })
    assert.equal(body, '请求的签名不匹配')
  })

  it('支持嵌套在 response.body 中的错误码', () => {
    const { body } = notify({ response: { body: { code: 'bucket_not_exists' } } })
    assert.equal(body, '访问的 bucket 不存在')
  })

  it('用插件自身的错误码提示缺少配置', () => {
    const { body } = notify({ code: 'config_not_found' })
    assert.equal(body, '找不到青云 QingStor 图床配置文件')
  })

  it('网络类错误码有友好文案', () => {
    const { body } = notify({ code: 'ECONNABORTED' })
    assert.equal(body, '上传超时，请检查网络后重试')
  })

  it('原样展示非 JSON 的纯文本错误', () => {
    const { body } = notify({ error: '这是一个纯文本错误' })
    assert.equal(body, '这是一个纯文本错误')
  })

  it('未知错误码展示原始错误码，便于排查', () => {
    const { body } = notify({ code: 'something_new' })
    assert.equal(body, 'something_new')
  })

  it('没有任何错误信息时给出兜底提示', () => {
    const { body } = notify({})
    assert.equal(body, '请检查配置项或网络情况')
  })

  it('使用 PicGo 内置的 i18n 文案', () => {
    const i18n = { translate: (key) => ({ UPLOAD_FAILED: 'Upload failed', CHECK_SETTINGS_AND_NETWORK: 'Check network' }[key] ?? key) }
    const { title, body } = notify({}, i18n)
    assert.equal(title, 'Upload failed')
    assert.equal(body, 'Check network')
  })

  it('i18n 缺少该 key 时回退到中文文案，不把 key 显示给用户', () => {
    const { title } = notify({}, { translate: (key) => key })
    assert.equal(title, '上传失败！')
  })
})

describe('plugin', () => {
  it('注册 qingstor-uploader 图床', () => {
    const { uploader } = createCtx(options)
    assert.equal(uploader.name, '青云 QingStor')
    assert.equal(typeof uploader.handle, 'function')
    assert.equal(typeof uploader.config, 'function')
  })

  it('上传成功后写入图片地址并清理内存数据', async () => {
    const output = [{ fileName: 'a.png', extname: '.png', buffer: image, base64Image: 'x' }]
    const { ctx, requests, uploader } = createCtx(options, output)
    await uploader.handle(ctx)

    assert.equal(requests.length, 1)
    assert.equal(output[0].imgUrl, 'https://bkt.pek3b.qingstor.com/a.png')
    assert.equal(output[0].buffer, undefined)
    assert.equal(output[0].base64Image, undefined)
  })

  it('地址与上传地址使用同一套编码与路径', async () => {
    const output = [{ fileName: 'a b.png', extname: '.png', buffer: image }]
    const { ctx, requests, uploader } = createCtx({ ...options, path: 'blog/' }, output)
    await uploader.handle(ctx)

    assert.equal(requests[0].url, 'https://pek3b.qingstor.com/bkt/blog/a%20b.png')
    assert.equal(output[0].imgUrl, 'https://bkt.pek3b.qingstor.com/blog/a%20b.png')
  })

  it('没有配置时提示找不到配置文件', async () => {
    const { ctx, notifications, uploader } = createCtx(undefined)
    await uploader.handle(ctx)

    assert.equal(notifications.length, 1)
    assert.equal(notifications[0].body, '找不到青云 QingStor 图床配置文件')
  })

  it('必填项缺失时提示具体缺哪个字段', async () => {
    const { ctx, notifications, uploader } = createCtx({ ...options, zone: '' })
    await uploader.handle(ctx)

    assert.equal(notifications[0].body, '请先配置区域(zone)')
  })

  it('上传失败时提示错误原因', async () => {
    const output = [{ fileName: 'a.png', extname: '.png', buffer: image }]
    const { ctx, notifications, uploader } = createCtx(options, output)
    ctx.request = async () => { throw { response: { body: { code: 'permission_denied' } } } }
    await uploader.handle(ctx)

    assert.equal(notifications[0].body, '没有权限执行此次请求')
  })

  it('多张图片各自使用一致的 Date 签名', async () => {
    const output = [
      { fileName: 'a.png', extname: '.png', buffer: image },
      { fileName: 'b.png', extname: '.png', buffer: image }
    ]
    const { ctx, requests, uploader } = createCtx(options, output)
    await uploader.handle(ctx)

    assert.equal(requests.length, 2)
    for (const [index, request] of requests.entries()) {
      assert.equal(request.headers.Authorization, signAsQingStor(request.headers.Date, { fileName: output[index].fileName }))
    }
  })
})
