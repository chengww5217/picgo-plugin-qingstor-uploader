## picgo-plugin-qingstor-uploader

[![Downloads](https://img.shields.io/npm/dm/picgo-plugin-qingstor-uploader.svg?color=brightgreen)](https://npmcharts.com/compare/picgo-plugin-qingstor-uploader?minimal=true)
[![Version](https://img.shields.io/npm/v/picgo-plugin-qingstor-uploader.svg?color=brightgreen)](https://www.npmjs.com/package/picgo-plugin-qingstor-uploader)
[![License](https://img.shields.io/badge/license-mit-brightgreen.svg)](https://github.com/chengww5217/picgo-plugin-qingstor-uploader/blob/master/License)

English | [简体中文](./README-zh_CN.md)

A plugin for [PicGo](https://github.com/Molunerfinn/PicGo) with the addition of the [QingStor](https://www.qingcloud.com/products/qingstor/) image hosting.

### Installation

- Online Installation

    Open the details window of [PicGo](https://github.com/Molunerfinn/PicGo), select **Plugin Settings**, and search **qingstor-uploader** for installation.
    Then restart the application.

- Offline Installation

    Clone this project and copy it to the folder below:
    - Windows: `%APPDATA%\picgo\`
    - Linux: `$XDG_CONFIG_HOME/picgo/` or `~/.config/picgo/`
    - macOS: `~/Library/Application\ Support/picgo/`

    Switch to the new directory and run `npm install ./picgo-plugin-qingstor-uploader`.
    Then restart the application.

### Screenshots

![](screenshots/screenshot.png)

### Configuration

|Parameter Name|Type|Description|Required|
|:--:|:--:|:--:|:--:|
|accessKeyId|input|AccessKeyId|true|
|accessKeySecret|password|AccessKeySecret|true|
|bucket|input|Bucket Name|true|
|zone|input|Zone|true|
|path|input|Default storage path when upload|false|
|customUrl|input|Private cloud website(eg: https://qingstor.com )|false|

