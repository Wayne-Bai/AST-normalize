/**
 * Created by ken.xu on 14-2-14.
 */
var crypto = require('crypto')
var fs = require('fs')
var path = require('path')
var mime = require('mime')
var onFinished = require('finished')
var readDir = require('fs-readdir-recursive')
var debug = require('debug')('koa-static-cache')

module.exports = function staticCache(dir, options, files) {
    if (typeof dir !== 'string')
        throw TypeError('Dir must be a defined string')

    options = options || {}
    files = files || options.files || Object.create(null)

    readDir(dir).forEach(function (name) {

        /**
         * change by ken
         * for 304 bugfix
         * //debug for windows
         */
        name = name.replace(/\\/g,'/');


        var pathname = '/' + name
        var obj = files[pathname] = {}
        var filename = obj.path = path.join(dir, name)
        var stats = fs.statSync(filename)
        var buffer = fs.readFileSync(filename)

        obj.cacheControl = options.cacheControl
        obj.maxAge = options.maxAge || 0
        obj.type = obj.mime = mime.lookup(pathname)
        obj.mtime = stats.mtime.toUTCString()
        obj.length = stats.size
        obj.md5 = crypto.createHash('md5').update(buffer).digest('base64')

        debug('file: ' + JSON.stringify(obj, null, 2))

        if (options.buffer)
            obj.buffer = buffer

        buffer = null
    })

    if (options.alias) {
        Object.keys(options.alias).forEach(function (key) {
            var value = options.alias[key]

            if (files[value]) {
                files[key] = files[value]

                debug('aliasing ' + value + ' as ' + key)
            }
        })
    }
    return function* staticCache(next) {

        var file = files[this.path]
        if (!file)
            return yield* next

        switch (this.method) {
            case 'HEAD':
            case 'GET':
                this.status = 200
                this.response.lastModified = file.mtime
                this.response.etag = file.md5


                this.type = file.type
                this.length = file.length
                //this.set('Cache-Control', file.cacheControl || 'public, max-age=' + file.maxAge)
                /**
                 * change by ken
                 * for 304 bugfix
                 */
                this.header['cache-control'] = file.cacheControl || 'public, max-age=' + file.maxAge;
                if (this.fresh)
                    return this.status = 304

                this.set('Content-MD5', file.md5)
                if (this.method === 'HEAD')
                    return

                if (file.buffer) {
                    this.body = file.buffer
                } else {
                    var stream = this.body = fs.createReadStream(file.path)
                    stream.on('error', this.onerror)
                    onFinished(this, stream.destroy.bind(stream))
                }

                return
            case 'OPTIONS':
                this.status = 204
                this.set('Allow', 'HEAD,GET,OPTIONS')
                return
            default:
                this.status = 405
                this.set('Allow', 'HEAD,GET,OPTIONS')
                return
        }
    }
}
