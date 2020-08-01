var fs = require('fs')
  , util = require('util')
  , path = require('path')
  , colors = require('colors')
  , childProcess = require('child_process')

  , clone = function (config, callback) {
      var exists = fs.existsSync(config.bootstrapSrc)
        , cmd = exists
            ? 'git pull origin master'
            : 'git clone --depth 1 ' + config.bootstrapGit + ' ' + config.bootstrapSrc
        , opts = exists ? { cwd: config.bootstrapSrc } : {}

      console.log((exists
        ? 'Pulling latest boostrap from ' + config.bootstrapGit + ' to ' + config.bootstrapSrc + '...'
        : 'Cloning bootstrap from ' + config.bootstrapGit + ' to ' + config.bootstrapSrc + '...'
      ).green)

      childProcess.exec(cmd, opts, function (error, stdout, stderr) {
        util.print(stdout.replace(/^(?!$)/gm, '>  ').yellow)
        util.print(stderr.replace(/^(?!$)/gm, '>> ').yellow)
        callback(error ? ('exec error: ' + error) : null)
      })
    }

module.exports.clone = clone
