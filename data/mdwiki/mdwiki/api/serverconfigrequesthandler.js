'use strict';

var serverConfig = require('../config/config.json');

module.exports = function (req, res) {
  var json = JSON.stringify(serverConfig);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', json.length);
  res.status(200);
  res.end(json);
};
