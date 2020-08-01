var async = require('async')
  , colors = require('colors')
  , io = require('./io')
  , packagejson = require('./packagejson')
  , replacements = require('./replacements')

  , fixDoc = function (config) {
      [ 'jsdoc', 'jsdocapp' ].forEach(function (package) {
        var inFile = config[package + 'in']
          , outFile = config[package + 'out']

        console.log(('Processing ' + outFile + '...').green)
        async.waterfall([
            io.readScript.bind(null, config, '_' + package, inFile)
          , function (data, callback) {
              replacements.adjustScript(config, data)
              callback(null, data)
            }
          , io.writeScript.bind(null, config, outFile)
        ], function (err) {
          if (err)
            console.log(('There was an error processing ' + inFile + ': ' + err).red)
        })
      })
    }

  , adjust = function (config, data, callback) {
      replacements.adjustScript(config, data)
      data.json = packagejson.generateJSON(config, data)
      callback(null, data)
    }

  , handleError = function (package, err) {
      if (err)
        console.log(('There was an error processing ' + package + ': ' + err).red)
    }

  , processPackage = function (config, package) {
      async.waterfall([
          io.readScript.bind(null, config, package)
        , adjust.bind(null, config)
        , io.writeScript.bind(null, config)
      ], handleError.bind(null, package))
    }

module.exports = {
    processPackage: processPackage
  , fixDoc: fixDoc
}
