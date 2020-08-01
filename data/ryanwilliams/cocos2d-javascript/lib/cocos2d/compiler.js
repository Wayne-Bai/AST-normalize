'use strict'

var jah  = require('jah')
  , T    = jah.Template
  , path = require('path')
  , fs   = require('fs')

function Compiler (configFile) {
    jah.Compiler.call(this, configFile)
}

Compiler.prototype = Object.create(jah.Compiler.prototype)

Compiler.prototype.scriptHTML = function () {
    var tag = new T('<script src="${filename}" type="text/javascript"></script>')

    return tag.substitute({ filename: path.join(this.config.output, 'init.js') })
}

Compiler.prototype.build = function () {
    jah.Compiler.prototype.build.call(this)

    // Write init script
    var scriptsArray = this.lastPackages.map(function (x) { return path.join(this.config.output, x) }.bind(this))
      , scriptsJSON = JSON.stringify(scriptsArray)

    var initTemp = new T(fs.readFileSync(path.join(__dirname, 'app_init.js.template')).toString())
    fs.writeFileSync(path.join(this.codeBuildDir, 'init.js'), initTemp.substitute({ scriptArray: scriptsJSON, assetPath: this.config.assetPath }), 'utf8')
}

exports.Compiler = Compiler
