var express = require('express');
var misc = require('rackspace-shared-utils/lib/misc');

exports.PROXY_ERROR_CODE_TO_HTTP_CODE_MAP = {
  'NR-1000': 400,
  'NR-1001': 400,
  'NR-1002': 401,

  'NR-2000': 400,

  'NR-5000': 500
};

exports.getTestHttpServer = function(port, ip, callback) {
  ip = ip || '127.0.0.1';

  var server = express.createServer();
  server.listen(port, ip, function(err) {
    callback(err, server);
  });
};

exports.setupErrorEchoHandlers = function(server) {
  function echoError(req, res) {
    var code, headers;

    if (!req.headers.hasOwnProperty('x-rp-error-code')) {
      res.writeHead(404, {});
      res.end();
      return;
    }

    code = exports.PROXY_ERROR_CODE_TO_HTTP_CODE_MAP[req.headers['x-rp-error-code']];

    headers = misc.merge({}, req.headers);
    delete headers.host;
    delete headers.connection;

    res.writeHead(code, headers);
    res.end(req.headers['x-rp-error-message']);
  }

  server.get('*', echoError);
  server.post('*', echoError);
  server.put('*', echoError);
};
