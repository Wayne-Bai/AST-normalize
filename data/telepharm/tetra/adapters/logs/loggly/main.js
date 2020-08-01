var config = require('./../../../libs/config');
var loggly = require('loggly');
// Initialize client
var client = loggly.createClient({
  token: config.service.logs.token,
  subdomain: config.service.logs.subdomain,
  auth: {
    username: config.service.logs.auth.username,
    password: config.service.logs.auth.password
  },
  tags: config.service.logs.tags
});

// Save the log
var save = function (obj) {
  client.log(obj, [config.service.name]);
};

// ###
// MIDDLEWARE
// ###

module.exports = function (req, res, next) {

  var send;
  var end;

  // Set start time
  if (!req._startTime) {
    req._startTime = new Date();
  }

  // Process request send
  send = res.send;
  res.send = function (_status, _body) {
    res.send = send;
    if (_body) {
      return res.send(_status, _body);
    } else {
      return res.send(_status);
    }
  };

  // Process request end
  end = res.end;
  res.end = function (c, e) {
    var ip, len, obj;
    res.end = end;
    res.end(c, e);
    if (req.ip) {
      ip = req.ip;
    } else if (req.socket && req.socket.socket) {
      ip = req.socket.socket.remoteAddress;
    }
    len = parseInt(res.getHeader('Content-Length') || '0', 10) / 1024;
    // Create obj
    obj = {
      at: req._startTime,
      duration: (new Date()) - req._startTime,
      status: res.statusCode,
      ip: ip,
      path: req.path || req.originalUrl || req.url,
      method: req.method,
      respKb: Math.round(len * 10) / 10,
      headers: (req.headers) ? req.headers : null,
      body: (req.body) ? req.body : {},
      qs: (req.query) ? req.query : {},
      params: (req.params) ? req.params : {}
    };

    // Save to log
    save(obj);
  };

  return next();
};
