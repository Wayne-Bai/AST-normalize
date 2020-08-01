'use strict';

var apn = require('apn');
var log = require('../log');

function addEventHandlers(connection) {
  connection.on('connected', function() {
    log.info('Connected to APNs');
  });

  connection.on('timeout', function () {
    log.info('Connection Timeout');
  });

  connection.on('disconnected', function() {
    log.info('Disconnected from APNs');
  });

  connection.on('transmitted', function(notification, device) {
    log.info('Notification transmitted to:', device.token.toString('hex'));
  });

  connection.on('cacheTooSmall', function(sizeDifference) {
    log.info('Cache too small, approximately', sizeDifference, 'APN notifications will be lost');
  });

  connection.on('error', log.error);

  connection.on('transmissionError', function(errCode, notification, device) {
    log.error('Notification caused error:', errCode, 'for device', device, notification);
  });

  connection.on('socketError', log.error);
}

exports.getSender = function(config) {
  var options = config.ios;
  var apnConn = new apn.Connection(options);

  addEventHandlers(apnConn);

  return function(deviceToken, payload, callback) {
    if (!payload || !payload.message) {
      return callback(new Error('APN payload should include message field'));
    } else if (deviceToken === 'mock') {
      return callback(null, {});
    }

    var device = new apn.Device(deviceToken);
    var alert = new apn.Notification();

    alert.expiry = Math.floor(Date.now() / 1000) + config.settings.timeoutInSeconds;
    alert.alert = payload.message;
    alert.payload = payload;

    if (options.badge !== false) {
      alert.badge = 1;
    }

    apnConn.pushNotification(alert, device);

    // APN responses come via events on the APN connection
    return callback(null, {});
  };
};
