var lconfig = require('lconfig');
var fs = require('fs');
var acl = require('acl');
var logger = require('logger').logger('apiKeys');

var apikeys = {};

if (lconfig.apikeysPath) {
  apikeys = JSON.parse(fs.readFileSync(lconfig.apikeysPath));
}

// return Singly's keys for a given service
exports.getDefaultKeys = function (service) {
  return apikeys[service];
};

// return api keys from an app or globally for a given service
exports.getKeys = function (service, appID, callback) {
  acl.getApp(appID, function (err, app) {
    if (err) {
      // if it's not a valid appID we shouldn't be falling back
      logger.warn('failed to get keys for ', service, appID, err);

      return callback();
    }

    if (app && app.apikeys && app.apikeys[service]) {
      return callback(app.apikeys[service]);
    }

    // fallback
    callback(apikeys[service]);
  });
};

exports.hasOwnKeys = function (app, service) {
  // If the app has any keys
  if (app && app.apikeys) {
    // If keys exists for the service for both the app and Singly
    if (app.apikeys[service] && apikeys[service]) {
      // Return whether the app's keys differ from Singly's keys
      return app.apikeys[service].appKey !== apikeys[service].appKey;
    } else {
      // Return true if keys don't exist for Singly (because they will exist
      // for the app)
      return apikeys[service] === undefined &&
        app.apikeys[service] !== undefined;
    }
  } else {
    return false;
  }
};
