var path = require('path')
  , fs = require('fs')

  , mkdir = function (dir, callback) {
      fs.exists(dir, function (exists) {
        if (exists)
          return callback()

        mkdir(path.dirname(dir), function (err) {
          if (err)
            return callback(err)
          fs.mkdir(dir, callback)
        })
      })
    }

module.exports.mkdir = mkdir
