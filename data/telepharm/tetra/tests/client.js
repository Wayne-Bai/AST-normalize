var restify = require('restify');
var config = require('./../libs/config');

module.exports = {

  client: restify.createJsonClient({
    url: 'http://localhost:' + config.service.port,
    version: '*'
  }),

  // Run test
  test: function (request, cb) {

    // BasicAuth
    this.client.basicAuth('admin', 'password123');
    // Request
    switch (request.specs.method) {
    case 'GET':
      this.client.get(request.specs.url, function (err, req, res, data) {
        cb(res, data);
      });
      break;
    case 'POST':
      this.client.post(request.specs.url, request.specs.payload, function (err, req, res, data) {
        cb(res, data);
      });
      break;
    case 'PUT':
      this.client.put(request.specs.url, request.specs.payload, function (err, req, res, data) {
        cb(res, data);
      });
      break;
    case 'DELETE':
      this.client.del(request.specs.url, function (err, req, res) {
        cb(res, false);
      });
      break;
    default:
      cb(500, 'Invalid test request');
    }
  }

};
