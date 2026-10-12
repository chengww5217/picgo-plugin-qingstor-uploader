const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const { describe, it } = require('node:test')

const {
  generatePath,
  getHost,
  generateSignature,
  uploadOptions,
  validateOptions,
  handleError,
  buildObjectUrl,
  checkConnectivity,
  normalizeOptions,
  deleteObjectRequest,
} = require('../dist/utils/index.js')
const { config } = require('../dist/utils/config.js')
const plugin = require('../dist/index.js')

const options = {
  accessKeyId: 'AK',
  accessKeySecret: 'SK',
  bucket: 'bkt',
  zone: 'pek3b',
  path: '',
  customUrl: '',
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
}

/**
 * Recompute the signature the way QingStor does, using a given Date header.
 */
function signAsQingStor(date, { options: overrides = {}, fileName = 'a.png', extname = '.png' } = {}) {
  const opts = { ...options, ...overrides }
  const path = generatePath(opts.path)
  const strToSign = `PUT\n\n${contentTypes[extname] ?? ''}\n${date}\n/${opts.bucket}${path}/${encodeURI(fileName)}`
  const signature = crypto.createHmac('sha256', opts.accessKeySecret).update(strToSign).digest('base64')
  return `QS ${opts.accessKeyId}:${signature}`
}

/**
 * Make every `new Date()` return a moment one second later than the previous
 * one, so two separate calls can never produce the same timestamp.
 * Used to catch the signature/Date divergence regression.
 */
function withAdvancingClock(fn) {
  const RealDate = Date
  let ticks = 0
  class FakeDate extends RealDate {
    constructor(...args) {
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
function createCtx(config, output = []) {
  const requests = []
  const notifications = []
  let uploader
  let guiMenu
  const listeners = {}
  const ctx = {
    getConfig: () => config,
    output,
    request: async requestOptions => {
      requests.push(requestOptions)
    },
    log: { error: () => {} },
    helper: {
      uploader: {
        register: (id, handler) => {
          uploader = handler
        },
      },
    },
    emit: (name, payload) => {
      notifications.push(payload)
    },
    on: (name, handler) => {
      listeners[name] = handler
    },
  }
  const instance = plugin(ctx)
  instance.register()
  guiMenu = instance.guiMenu
  return {
    ctx,
    requests,
    notifications,
    remove: files => listeners.remove(files),
    get uploader() {
      return uploader
    },
    get guiMenu() {
      return guiMenu
    },
  }
}

describe('generatePath', () => {
  const cases = [
    ['', ''],
    ['/', ''],
    ['blog', '/blog'],
    ['blog/', '/blog'],
    ['a b/', '/a%20b'],
    ['博客/', '/%E5%8D%9A%E5%AE%A2'],
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

describe('buildObjectUrl', () => {
  it('按 bucket/zone/路径拼出公开地址', () => {
    assert.equal(buildObjectUrl(options, 'a.png'), 'https://bkt.pek3b.qingstor.com/a.png')
  })

  it('包含编码后的文件名与自定义路径', () => {
    assert.equal(
      buildObjectUrl({ ...options, path: 'blog/' }, 'a b.png'),
      'https://bkt.pek3b.qingstor.com/blog/a%20b.png',
    )
  })

  it('跟随自定义域名', () => {
    assert.equal(
      buildObjectUrl({ ...options, customUrl: 'https://qingstor.example.com' }, 'a.png'),
      'https://bkt.pek3b.qingstor.example.com/a.png',
    )
  })
})

describe('checkConnectivity', () => {
  it('收到任意 HTTP 响应即视为可达', async () => {
    const ctx = { request: async () => ({ status: 403 }) }
    assert.equal(await checkConnectivity(ctx, options), true)
  })

  it('只有网络层失败（无响应）才算不可达', async () => {
    const ctx = {
      request: async () => {
        throw { code: 'ENOTFOUND' }
      },
    }
    assert.equal(await checkConnectivity(ctx, options), false)
  })

  it('4xx 之类的响应异常仍然算可达', async () => {
    const ctx = {
      request: async () => {
        throw { response: { status: 403 } }
      },
    }
    assert.equal(await checkConnectivity(ctx, options), true)
  })

  it('使用区域与自定义网址拼出探测地址', async () => {
    const calls = []
    const ctx = {
      request: async requestOptions => {
        calls.push(requestOptions)
        return {}
      },
    }
    await checkConnectivity(ctx, { ...options, customUrl: 'qingstor.example.com' })
    assert.equal(calls[0].method, 'HEAD')
    assert.equal(calls[0].url, 'https://pek3b.qingstor.example.com/bkt')
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
    assert.match(request.headers['User-Agent'], /^picgo_plugin_qingstor\/\d+\.\d+\.\d+/)
    assert.equal(request.headers['Content-Type'], 'image/png')
  })

  it('User-Agent 带上插件版本号', () => {
    const { version } = require('../package.json')
    assert.equal(build().headers['User-Agent'], `picgo_plugin_qingstor/${version}`)
  })

  for (const [extname, contentType] of Object.entries(contentTypes)) {
    it(`为 ${extname} 推断 Content-Type 为 ${contentType}`, () => {
      const request = build({}, `a${extname}`, extname)
      assert.equal(request.headers['Content-Type'], contentType)
    })
  }

  it('非图片文件显式移除 Content-Type（不参与签名），避免 axios 注入默认值', () => {
    const request = build({}, 'status', '')
    assert.equal(request.headers['Content-Type'], null)
    assert.equal(
      request.headers.Authorization,
      signAsQingStor(request.headers.Date, { fileName: 'status', extname: '' }),
    )
  })

  it('把图片内容放进 data', () => {
    assert.equal(build().data, image)
  })
})

describe('deleteObjectRequest', () => {
  const request = deleteObjectRequest(options, 'https://bkt.pek3b.qingstor.com/blog/a%20b.png')

  it('根据公开地址反推对象 key，发出 DELETE 请求', () => {
    assert.equal(request.method, 'DELETE')
    assert.equal(request.url, 'https://pek3b.qingstor.com/bkt/blog/a%20b.png')
    assert.equal(request.headers['User-Agent'], `picgo_plugin_qingstor/${require('../package.json').version}`)
  })

  it('签名串为 DELETE + 空 Content-MD5/Content-Type + 资源路径', () => {
    const canonical = '/bkt/blog/a%20b.png'
    const expected = `QS AK:${crypto
      .createHmac('sha256', options.accessKeySecret)
      .update(`DELETE\n\n\n${request.headers.Date}\n${canonical}`)
      .digest('base64')}`
    assert.equal(request.headers.Authorization, expected)
  })

  it('跟随自定义域名与协议', () => {
    const custom = deleteObjectRequest(
      { ...options, customUrl: 'http://qingstor.example.com' },
      'http://bkt.pek3b.qingstor.example.com/blog/a.png',
    )
    assert.equal(custom.url, 'http://pek3b.qingstor.example.com/bkt/blog/a.png')
  })
})

describe('normalizeOptions', () => {
  it('裁剪所有字符串字段的首尾空格', () => {
    const out = normalizeOptions({
      accessKeyId: ' AK ',
      accessKeySecret: ' SK ',
      bucket: ' bkt ',
      zone: ' pek3b ',
      path: ' blog/ ',
      customUrl: ' https://qingstor.example.com ',
      deleteRemote: true,
    })
    assert.deepEqual(out, {
      accessKeyId: 'AK',
      accessKeySecret: 'SK',
      bucket: 'bkt',
      zone: 'pek3b',
      path: 'blog/',
      customUrl: 'https://qingstor.example.com',
      deleteRemote: true,
    })
  })

  it('缺少配置时所有字段为 undefined', () => {
    const out = normalizeOptions(undefined)
    for (const key of ['accessKeyId', 'accessKeySecret', 'bucket', 'zone', 'path', 'customUrl', 'deleteRemote']) {
      assert.equal(out[key], undefined)
    }
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

describe('config', () => {
  const build = userConfig => config({ getConfig: () => userConfig })
  const field = (fields, name) => fields.find(item => item.name === name)

  it('区域是自由输入，默认回填已存值', () => {
    const zone = field(build({ zone: 'my-zone' }), 'zone')
    assert.equal(zone.type, 'input')
    assert.equal(zone.default, 'my-zone')
    assert.equal(zone.required, true)
  })

  it('全新安装默认区域为空字符串', () => {
    assert.equal(field(build(undefined), 'zone').default, '')
  })

  it('同步删除是 confirm 开关，默认关闭', () => {
    const off = field(build(undefined), 'deleteRemote')
    assert.equal(off.type, 'confirm')
    assert.equal(off.default, false)
    assert.equal(field(build({ deleteRemote: true }), 'deleteRemote').default, true)
  })

  it('每个字段都带有 alias 与 tips', () => {
    for (const item of build({})) {
      assert.ok(item.alias, `${item.name} 缺少 alias`)
      assert.ok(item.tips, `${item.name} 缺少 tips`)
    }
  })
})

describe('handleError', () => {
  const notify = (err, i18n) => {
    const notifications = []
    handleError({ i18n, log: { error: () => {} }, emit: (name, payload) => notifications.push(payload) }, err)
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
    const i18n = {
      translate: key => ({ UPLOAD_FAILED: 'Upload failed', CHECK_SETTINGS_AND_NETWORK: 'Check network' })[key] ?? key,
    }
    const { title, body } = notify({}, i18n)
    assert.equal(title, 'Upload failed')
    assert.equal(body, 'Check network')
  })

  it('i18n 缺少该 key 时回退到中文文案，不把 key 显示给用户', () => {
    const { title } = notify({}, { translate: key => key })
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

  it('同时写入剪贴板地址 url', async () => {
    const output = [{ fileName: 'a.png', extname: '.png', buffer: image }]
    const { ctx, uploader } = createCtx(options, output)
    await uploader.handle(ctx)

    assert.equal(output[0].url, 'https://bkt.pek3b.qingstor.com/a.png')
  })

  it('图片既无 buffer 也无 base64 时给出提示', async () => {
    const output = [{ fileName: 'a.png', extname: '.png' }]
    const { ctx, notifications, uploader } = createCtx(options, output)
    await uploader.handle(ctx)

    assert.equal(output[0].imgUrl, undefined)
    assert.equal(notifications[0].body, '图片内容为空，无法上传')
  })

  it('非预设区域直接按 zone 值拼接地址', async () => {
    const output = [{ fileName: 'a.png', extname: '.png', buffer: image }]
    const { ctx, requests, uploader } = createCtx({ ...options, zone: 'my-zone' }, output)
    await uploader.handle(ctx)

    assert.equal(requests[0].url, 'https://my-zone.qingstor.com/bkt/a.png')
    assert.equal(output[0].imgUrl, 'https://bkt.my-zone.qingstor.com/a.png')
  })

  it('地址与上传地址使用同一套编码与路径', async () => {
    const output = [{ fileName: 'a b.png', extname: '.png', buffer: image }]
    const { ctx, requests, uploader } = createCtx({ ...options, path: 'blog/' }, output)
    await uploader.handle(ctx)

    assert.equal(requests[0].url, 'https://pek3b.qingstor.com/bkt/blog/a%20b.png')
    assert.equal(output[0].imgUrl, 'https://bkt.pek3b.qingstor.com/blog/a%20b.png')
  })

  it('配置里多余的首尾空格会被裁剪，避免 signature_not_matched', async () => {
    const output = [{ fileName: 'status', extname: '', buffer: image }]
    const { ctx, requests, uploader } = createCtx({ ...options, bucket: ' bkt ', path: ' blog ' }, output)
    await uploader.handle(ctx)

    assert.equal(requests[0].url, 'https://pek3b.qingstor.com/bkt/blog/status')
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
    ctx.request = async () => {
      throw { response: { body: { code: 'permission_denied' } } }
    }
    await uploader.handle(ctx)

    assert.equal(notifications[0].body, '没有权限执行此次请求')
  })

  it('多张图片各自使用一致的 Date 签名', async () => {
    const output = [
      { fileName: 'a.png', extname: '.png', buffer: image },
      { fileName: 'b.png', extname: '.png', buffer: image },
    ]
    const { ctx, requests, uploader } = createCtx(options, output)
    await uploader.handle(ctx)

    assert.equal(requests.length, 2)
    for (const [index, request] of requests.entries()) {
      assert.equal(
        request.headers.Authorization,
        signAsQingStor(request.headers.Date, { fileName: output[index].fileName }),
      )
    }
  })

  it('并发上传多张图片，不互相等待', async () => {
    const output = [
      { fileName: 'a.png', extname: '.png', buffer: image },
      { fileName: 'b.png', extname: '.png', buffer: image },
    ]
    const { ctx, uploader } = createCtx(options, output)
    const pending = []
    ctx.request = () =>
      new Promise(resolve => {
        pending.push(resolve)
      })

    const handled = uploader.handle(ctx)
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(pending.length, 2, '两个请求应当同时发出')

    pending.forEach(resolve => resolve())
    await handled
  })

  it('部分图片失败时，成功的图片仍然写入地址，失败的给出提示', async () => {
    const output = [
      { fileName: 'a.png', extname: '.png', buffer: image },
      { fileName: 'b.png', extname: '.png', buffer: image },
    ]
    const { ctx, notifications, uploader } = createCtx(options, output)
    ctx.request = async requestOptions => {
      if (requestOptions.url.includes('b.png')) {
        throw { response: { body: { code: 'bucket_not_exists' } } }
      }
    }
    await uploader.handle(ctx)

    assert.equal(output[0].imgUrl, 'https://bkt.pek3b.qingstor.com/a.png')
    assert.equal(output[1].imgUrl, undefined)
    assert.equal(notifications[0].body, '访问的 bucket 不存在')
  })
})

describe('guiMenu', () => {
  const run = async (config, request) => {
    const boxes = []
    const { ctx, guiMenu } = createCtx(config)
    if (request) ctx.request = request
    const item = guiMenu(ctx)[0]
    await item.handle(ctx, {
      showMessageBox: async options => {
        boxes.push(options)
        return { result: 0, checkboxChecked: false }
      },
    })
    return boxes
  }

  it('在插件菜单里提供配置检查入口', () => {
    const { ctx, guiMenu } = createCtx(options)
    assert.equal(guiMenu(ctx)[0].label, '检查配置与连接')
  })

  it('未配置时提示先完成配置', async () => {
    const boxes = await run(undefined)
    assert.equal(boxes[0].type, 'warning')
    assert.match(boxes[0].message, /还没有配置/)
  })

  it('必填项缺失时提示缺失的字段', async () => {
    const boxes = await run({ ...options, bucket: '' })
    assert.equal(boxes[0].type, 'error')
    assert.equal(boxes[0].message, '请先配置 Bucket 名称')
  })

  it('配置完整且可连接时提示成功', async () => {
    const boxes = await run(options)
    assert.equal(boxes[0].type, 'info')
    assert.equal(boxes[0].message, '配置完整，已成功连接青云服务')
  })

  it('配置完整但网络不可达时给出警告', async () => {
    const boxes = await run(options, async () => {
      throw { code: 'ENOTFOUND' }
    })
    assert.equal(boxes[0].type, 'warning')
    assert.equal(boxes[0].message, '配置完整，但无法连接青云服务，请检查区域(zone)、自定义网址和网络')
  })
})

describe('remove（同步删除云端对象）', () => {
  const qingstorFile = { type: 'qingstor-uploader', imgUrl: 'https://bkt.pek3b.qingstor.com/blog/a.png' }
  const withSync = { ...options, deleteRemote: true }

  it('开关开启时删除对应对象并通知', async () => {
    const { requests, notifications, remove } = createCtx(withSync)
    await remove([qingstorFile])

    assert.equal(requests.length, 1)
    assert.equal(requests[0].method, 'DELETE')
    assert.equal(requests[0].url, 'https://pek3b.qingstor.com/bkt/blog/a.png')
    assert.equal(notifications[0].body, '已从青云 QingStor 删除 1 个对象')
  })

  it('开关关闭时不删除', async () => {
    const { requests, notifications, remove } = createCtx(options)
    await remove([qingstorFile])

    assert.equal(requests.length, 0)
    assert.equal(notifications.length, 0)
  })

  it('缺少配置时不报错也不删除', async () => {
    const { requests, remove } = createCtx(undefined)
    await remove([qingstorFile])

    assert.equal(requests.length, 0)
  })

  it('忽略非本图床的条目', async () => {
    const { requests, remove } = createCtx(withSync)
    await remove([{ type: 'tcyun', imgUrl: 'https://x/y.png' }])

    assert.equal(requests.length, 0)
  })

  it('部分删除失败时给出汇总通知', async () => {
    const { ctx, requests, notifications, remove } = createCtx(withSync)
    ctx.request = async requestOptions => {
      if (requestOptions.url.includes('b.png')) throw { code: 'permission_denied' }
      requests.push(requestOptions)
    }
    await remove([qingstorFile, { type: 'qingstor-uploader', imgUrl: 'https://bkt.pek3b.qingstor.com/blog/b.png' }])

    assert.equal(requests.length, 1)
    assert.equal(notifications[0].body, '同步删除完成：成功 1 个，失败 1 个，详情见日志')
  })
})
