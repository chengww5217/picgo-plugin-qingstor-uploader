## picgo-plugin-qingstor-uploader

[![Downloads](https://img.shields.io/npm/dm/picgo-plugin-qingstor-uploader.svg?color=brightgreen)](https://npmcharts.com/compare/picgo-plugin-qingstor-uploader?minimal=true)
[![Version](https://img.shields.io/npm/v/picgo-plugin-qingstor-uploader.svg?color=brightgreen)](https://www.npmjs.com/package/picgo-plugin-qingstor-uploader)
[![License](https://img.shields.io/badge/license-mit-brightgreen.svg)](https://github.com/chengww5217/picgo-plugin-qingstor-uploader/blob/master/License)

English | [简体中文](./README-zh_CN.md)

A plugin for [PicGo](https://github.com/Molunerfinn/PicGo) with the addition of the [QingStor](https://www.qingcloud.com/products/objectstorage/) image hosting.

### Installation

- Online Installation

  1. Open the details window of [PicGo](https://github.com/Molunerfinn/PicGo), select **Plugin Settings**, and search **qingstor-uploader** for installation.
  2. Then restart the application.

- Offline Installation

  1. Clone the repository
  2. Open the details window of [PicGo](https://github.com/Molunerfinn/PicGo), select **Plugin Settings**, and click the icon below.
  ![](screenshots/picgo-offline-install.png)
  3. Select the folder you cloned the repository to.
  4. Restart the application.

### Screenshots

![](screenshots/screenshot.png)

### Configuration

|Parameter Name|Type|Description|Required|
|:--:|:--:|:--:|:--:|
|accessKeyId|input|AccessKeyId, create/copy it from the QingCloud console "API Keys" page|true|
|accessKeySecret|password|Paired with AccessKeyId, keep it secret|true|
|bucket|input|Bucket name. Create it first; only lowercase letters, digits and hyphens (-) are allowed|true|
|zone|input|Zone id, e.g. `pek3b`. Common QingCloud zones: `pek3a`、`pek3b`、`sh1a`、`gd2`. For private cloud or other regions, type the actual value|true|
|path|input|Storage path inside the bucket, leave empty for the root directory|false|
|endpoint|input|Object storage endpoint. Default `https://qingstor.com`; `https://qsstor.com` is also supported; private cloud can enter its own address|true|
|deleteRemote|confirm|Delete the matching object from QingStor when an image is removed from the album|false|

In the PicGo app, each field also has a localized label and a tooltip (zh-CN / zh-TW / en). You can verify the config and the connection from the plugin menu ("Check config & connection").

The endpoint defaults to the official QingCloud one: `https://<bucket>.<zone>.qingstor.com` (`https://qingstor.com`). `https://qsstor.com` is also supported; for private cloud, set the Endpoint field to your own address.

### Sync delete

Turn on the **"Sync delete cloud object"** switch in the plugin settings to also delete the matching object from QingStor whenever you delete an image from the PicGo album. The result is reported with a notification. When the switch is off (the default), deleting from the album only removes the album entry. The object key is derived from the image URL, so it keeps working even after you change the storage path.

