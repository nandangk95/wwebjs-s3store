# wwebjs-s3store
An S3 Store plugin for the whatsapp-web.js library! 

Use S3 to save your WhatsApp MultiDevice session on a AWS S3.

## Quick Links

* [Guide / Getting Started](https://wwebjs.dev/guide/authentication.html) _(work in progress)_
* [GitHub](https://github.com/nandangk95/wwebjs-s3store)
* [npm](https://www.npmjs.com/package/wwebjs-s3store)

## Installation

The module is now available on npm! `npm i wwebjs-s3store`

## Example usage

```js
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { S3Store } = require('wwebjs-s3store');
const { S3Client } = require("@aws-sdk/client-s3");

const client = new Client({
    authStrategy: new RemoteAuth({
        store: new S3Store({
            s3client: new S3Client({})
        }),
        backupSyncIntervalMs: 60000
    })
});

client.initialize();
```
