module.exports = function(server) {
  return function(req, res, next) {
    // CORS
    // allow only self
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:' + server.config.port)
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, DELETE')
    if (req.method == 'OPTIONS')
      return res.writeHead(204), res.end()

    // Access token
    if (req.url == '/access.json') {
      var accessSecret = server.createAccessKey({ allow: null }) // allow all
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(200)
      var accessToken = server.options.signObjHmac(accessSecret, {
        role: 'client',
        ts: Date.now(),
        keyId: server.options.hash(accessSecret)
      })
      return res.end(JSON.stringify(accessToken))
    }

    next()
  }
}