## picgo-plugin-qingstor-uploader

[![下载](https://img.shields.io/npm/dm/picgo-plugin-qingstor-uploader.svg?color=brightgreen)](https://npmcharts.com/compare/picgo-plugin-qingstor-uploader?minimal=true)
[![版本](https://img.shields.io/npm/v/picgo-plugin-qingstor-uploader.svg?color=brightgreen)](https://www.npmjs.com/package/picgo-plugin-qingstor-uploader)
[![许可](https://img.shields.io/badge/license-mit-brightgreen.svg)](https://github.com/chengww5217/picgo-plugin-qingstor-uploader/blob/master/License)

[English](./README.md) | 简体中文

为 [PicGo](https://github.com/Molunerfinn/PicGo) 开发的一款插件，新增了[青云 QingStor](https://www.qingcloud.com/products/qingstor/) 图床。

### 安装

- 在线安装

    打开 [PicGo](https://github.com/Molunerfinn/PicGo) 详细窗口，选择**插件设置**，搜索**qingstor-uploader**安装，然后重启应用即可。

- 离线安装

    克隆该项目，复制项目到 以下目录：
    - Windows: `%APPDATA%\picgo\`
    - Linux: `$XDG_CONFIG_HOME/picgo/` or `~/.config/picgo/`
    - macOS: `~/Library/Application\ Support/picgo/`

    切换到新目录执行 `npm install ./picgo-plugin-qingstor-uploader`，然后重启应用即可。

### 截图

![](screenshots/screenshot.png)

### 配置

|参数名称|类型|描述|是否必须|
|:--:|:--:|:--:|:--:|
|accessKeyId|input|AccessKeyId|true|
|accessKeySecret|password|AccessKeySecret|true|
|bucket|input|Bucket 名称|true|
|zone|input|区域 zone|true|
|path|input|上传时默认存储路径|false|
|customUrl|input|私有云网址（示例：https://qingstor.com ）|false|


