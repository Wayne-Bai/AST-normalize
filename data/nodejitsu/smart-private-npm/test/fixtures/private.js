var http = require('http')
  , url = require('url')
  , common = require('./common')

exports.start = function(cb) {
  exports.server = http.createServer(handle)
                       .on('error', cb)
                       .listen(common.private.port, cb)
}

exports.stop = function(cb) {
  exports.server.on('close', cb)
  exports.server.close()
}

function handle(req, res) {
  var u = common.url(req.url)
  switch (u) {
    case '/priv-basic-ok':
    case '/priv-wl-ok-get':
    case '/priv-wl-ok-put':
    case '/wl-ok-put-priv':
    case '/_session':
    case '/priv-basic-ok/0.0.1':
    case '/-/jsonp/jsonp_blah':
    case '/-/all/since':
    case '/-/rss':
    case '/-/rss/package_blah':
    case '/-/all':
    case '/-/all/-/jsonp/jsonp_blah':
    case '/-/short':
    case '/-/scripts':
    case '/-/by-field':
    case '/-/fields':
    case '/-/needbuild':
    case '/-/prebuilt':
    case '/-/nonlocal':
    case '/-/_view/all':
    case '/-/_list/all':
    case '/-/_show/all':
      pkgOk(req, res)
      break
    case '/priv-basic-error':
      pkgError(req, res)
      break
    case '/priv-basic-notfound':
    default:
      pkgNotFound(req, res)
      break
  }
}

function pkgOk(req, res) {
  common.json(res, 200, {
    server: 'private'
  })
}

function pkgNotFound(req, res) {
  common.json(res, 404, {
    server: 'private',
    message: 'not_found'
  })
}

function pkgError(req, res) {
  common.json(res, 400, {
    server: 'private'
  })
}
