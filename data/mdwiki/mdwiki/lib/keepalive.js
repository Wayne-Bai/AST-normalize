'use strict';

var http = require('http'),
    logger = require('./logger');

var callMeEvery5Minutes = 5 * 60 * 1000; // load every 5 minutes

function startKeepAlive(hostname, port) {
  setInterval(function () {
    var options = {
      host: hostname,
      port: port,
      path: '/'
    };
    http.get(options, function (res) {
      res.on('data', function (chunk) {
        logger.info('Successful response from ', hostname);
      });
    }).on('error', function (err) {
      logger.error('Error while calling mdwiki on heroku: ' + err.message);
    });
  }, callMeEvery5Minutes);
}

module.exports = startKeepAlive;