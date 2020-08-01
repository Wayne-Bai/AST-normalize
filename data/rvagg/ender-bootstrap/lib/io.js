var fs = require('fs')
  , path = require('path')
  , util = require('./util')
  , async = require('async')

  , readScript = function (config, package, file, callback) {
      if (!/^_/.test(package)) {
        callback = file
        file = config.bootstrapSrc + '/js/bootstrap-' + package + '.js'
      }

      fs.readFile(
          file
        , function (error, contents) {
          if (error)
            return callback(error)

          callback(null, {
              package: package
            , script: String(contents)
          })
        }
      )
    }

  , writeScript = function (config, file, data, callback) {
      if (/^_/.test(data.package)) {
        return async.waterfall([
            util.mkdir.bind(null, path.dirname(file))
          , fs.writeFile.bind(null, file, data.script, 'UTF-8')
        ], callback)
      } else {
        callback = data
        data = file

        var dir = config.outdir.replace('{package}', data.package)
          , scriptFile = dir + '/' + data.package + '.js'
          , jsonFile = dir + '/package.json'

        async.waterfall([
            util.mkdir.bind(null, dir)
          , fs.writeFile.bind(null, scriptFile, data.script, 'UTF-8')
          , fs.writeFile.bind(null, jsonFile, JSON.stringify(data.json, null, 2), 'UTF-8')
        ], callback)
      }
    }

module.exports = {
    readScript: readScript
  , writeScript: writeScript
}
