var log = require('logmagic').local('lib.admin_api.middleware.authentication');

var httpUtil = require('../../util/http');

exports.attach = function attach(apiKey) {
  return function addAuthentictionMiddleware(req, res, next) {
    var key = req.headers['x-api-key'];

    if (!key || key !== apiKey) {
      log.info('Invalid API key provided', {'ip': req.socket.remoteAddress});
      httpUtil.returnError(res, 401, 'Invalid or missing API key');
      return;
    }

    next();
  };
};
