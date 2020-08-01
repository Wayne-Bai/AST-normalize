var path = require('path');
var lib = require(path.join(__dirname, 'lib'));
var lutil = require('lutil');

exports.proxy = function(auth, req, res) {

  // ensure method parameter for api, always required
  var queryParams = req.query;
  if (!queryParams.method) {
    return res.json(lutil.jsonErr("method is a required parameter"), 500);
  }

  // make the api call
  lib.apiCall('GET', auth, queryParams, false, function(error, body, response) {

    // if error is the expired error from yahoo
    if (error) {
      return res.json(lutil.jsonErr(error), 500);
    }

    Object.keys(response.headers).forEach(function(header) {
      res.header(header, response.headers[header]);
    });
    res.send(body, response.statusCode);
  });
};