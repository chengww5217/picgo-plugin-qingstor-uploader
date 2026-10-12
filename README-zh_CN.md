## picgo-plugin-qingstor-uploader

[![下载](https://img.shields.io/npm/dm/picgo-plugin-qingstor-uploader.svg?color=brightgreen)](https://npmcharts.com/compare/picgo-plugin-qingstor-uploader?minimal=true) [![版本](https://img.shields.io/npm/v/picgo-plugin-qingstor-uploader.svg?color=brightgreen)](https://www.npmjs.com/package/picgo-plugin-qingstor-uploader) [![许可](https://img.shields.io/badge/license-mit-brightgreen.svg)](https://github.com/chengww5217/picgo-plugin-qingstor-uploader/blob/master/License)

[English](./README.md) | 简体中文

为 [PicGo](https://github.com/Molunerfinn/PicGo) 提供[青云 QingStor](https://www.qingcloud.com/products/objectstorage/)（青云对象存储）图床支持的插件，把图片上传到 Bucket 并返回下载地址。

### 特性

- 把图片上传到青云 QingStor 的 Bucket。
- 配置项与通知均支持多语言：简体中文 / 繁體中文 / English / 日本語 / 한국어。
- 插件菜单里提供 **「检查配置与连接」**，用于校验配置并测试连通性。
- 可选的 **同步删除**：从 PicGo 相册删除图片时，一并删除对象存储中的对象。

### 安装

1. 打开 PicGo，进入 **插件设置**，搜索 **qingstor**。

   ![](screenshots/plugins.png)

2. 安装并重启 PicGo。

### 截图

![配置](screenshots/config.png)

### 配置

|配置项|类型|说明|必填|
|:--:|:--:|:--:|:--:|
|accessKeyId|input|青云 API 密钥 ID，在控制台 **「API 密钥」** 页面创建并获取|是|
|accessKeySecret|password|与 AccessKeyId 配对使用，请妥善保管|是|
|bucket|input|Bucket 名称，请先在青云控制台创建。只支持小写字母、数字和中划线（-）|是|
|zone|input|区域代码，例如 `pek3b`。常见区域：`pek3a`、`pek3b`、`sh1a`、`gd2`；私有云或其他区域请填写实际值|是|
|path|input|上传时在 Bucket 内的存储路径，留空表示 Bucket 根目录|否|
|endpoint|input|对象存储域名。默认 `https://qingstor.com`，也支持 `https://qsstor.com`；私有云请填写自己的地址|是|
|deleteRemote|confirm|开启后，从相册删除图片时会同步删除对象存储中的对象|否|

配置表单已本地化（简体中文 / 繁體中文 / English / 日本語 / 한국어），上表列出的是配置键。上传后的地址形如 `https://<bucket>.<zone>.<endpoint>`，默认为 `https://<bucket>.<zone>.qingstor.com`。在插件菜单里点击 **「检查配置与连接」** 可校验配置并测试连通性。

### 同步删除

在插件设置里打开 **「同步删除云端对象」**（`deleteRemote`）后，从 PicGo 相册删除青云 QingStor 的图片时，会一并删除对象存储中的对应对象，并用通知反馈结果：单个删除显示文件名，多个删除显示总数。开关默认关闭，此时只删除相册记录。对象 key 由图片地址反推，即使之后修改了 `path` 也能删对。

### 许可

[MIT](./License)
