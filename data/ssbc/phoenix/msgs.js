
module.exports = function(server) {
  return function(req, res, next) {
    if (/^\/msg\//.test(req.url)) {
      // restrict the CSP
      res.setHeader('Content-Security-Policy', 'default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data:; connect-src \'none\'; object-src \'none\'; frame-src \'none\'; sandbox allow-same-origin allow-scripts allow-popups')
      var key = req.url.slice(5)
      return server.ssb.get(key, function (err, msg) {
        res.setHeader('Content-Type', 'application/json')

        if (err || !msg) {
          res.writeHead(404)
          res.end('{"error":"Message not found"}')
          return
        }

        res.writeHead(200)
        res.end(JSON.stringify(msg, null, 2))
      })
    }

    next()
  }
}