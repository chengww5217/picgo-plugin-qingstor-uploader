## picgo-plugin-qingstor-uploader

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

![](./src/screenshots/screenshot.png)

### Configuration

|Parameter Name|Type|Description|Required|
|:--:|:--:|:--:|:--:|
|accessKeyId|input|AccessKeyId|true|
|accessKeySecret|password|AccessKeySecret|true|
|bucket|input|Bucket Name|true|
|zone|input|Zone|true|
|path|input|Default storage path when upload|false|
|customUrl|input|Private cloud website(eg: https://qingstor.com )|false|

