require('colors')
require('node-env-file')('.env')

var Hapi = require('hapi')
var Good = require('good')
var path = require('path')
var url  = require('url')

var server = new Hapi.Server(process.env.PORT)

server.views({
  engines: {
    html: require('swig')
  },
  path: path.resolve(process.cwd(), 'public')
})

// Static assets are forwared through to Webpack
server.route(require('./proxies/assets'));

// Isomorphism
server.route({
  method: 'GET',
  path: '/{p*}',
  handler: require('./react')
})

server.pack.register(Good, function (err) {
  if (err) {
    throw err
  }

  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri)
  })
})

// Run Webpack Dev Server in tandem
if (process.env.NODE_ENV === 'development') {
  require('./webpack')
}
