
var filewalker = require('./filewalker').filewalker,
    fs = require('fs'),
    util = require('util'),
    dox = require('dox')


function getmodules( root, options, done ){
  var modules

  modules = []

  filewalker(root, options, function( err, dir, filename, next ) {
    var namespace
    namespace = dir.split('/')
    modules.push({
      namespace: namespace,
      filename: filename
    })
    next()
  }, function() {
    done( modules )
  })  
}

function generateNamespacedDocs( root, modules ) {
  var parsed

  parsed = {}

  modules.forEach(function( module ) {
    var last, modulepath, modulesource, doxobj

    last = parsed

    module.namespace.forEach(function( namepart ) {
      if( !last[namepart] )
        last[ namepart ] = {}
      last = last[ namepart ]
    })

    if( !last.modules )
      last.modules = []

    modulepath = __dirname + '/../' + module.namespace.join('/') + '/' + module.filename
    modulesource = fs.readFileSync( modulepath, 'utf8' )
    doxobj = dox.parseComments( modulesource, {raw: true} )

    last.modules.push({
      name: module.filename,
      dox: doxobj
    })
  })

  return parsed
}

getmodules('cerebral', {
  ignore: 'vendor'
},
function( modules ) {
  var docs, json

  docs = generateNamespacedDocs( 'cerebral', modules )
  json = JSON.stringify( docs )
  
  fs.writeFileSync(__dirname + '/../docs/documentation.json', json, 'utf8')

})
