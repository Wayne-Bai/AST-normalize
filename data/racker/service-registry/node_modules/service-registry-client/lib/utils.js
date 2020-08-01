/**
 *  Copyright 2013 Rackspace
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

var KeystoneClient = require('keystone-client').KeystoneClient;

/**
 * Default auth API urls.
 */
var DEFAULT_AUTH_URLS = {
  'us': 'https://identity.api.rackspacecloud.com/v2.0',
  'uk': 'https://lon.identity.api.rackspacecloud.com/v2.0'
};

/**
 * Return specified auth URL or a default auth URL for region is options.authUrl
 * is not provided.
 */
exports.getAuthUrl = function(options, region) {
  var result;

  if (options.authUrl) {
    result = options.authUrl;
  }
  else {
    if (!DEFAULT_AUTH_URLS.hasOwnProperty(region)) {
      throw new Error('Invalid region: ' + region);
    }

    result = DEFAULT_AUTH_URLS[region];
  }

  return result;
};


/**
 * Factory method for KeystoneClient which also sets up a logger.
 *
 * @param {String} authUrl Keystone endpoint url.
 * @param {Object} options Options object passed to the client.
 * @param {Function} logFunc Log function.
 */
exports.getKeystoneClient = function(authUrl, options, logFunc) {
  var client = new KeystoneClient(authUrl, options);

  client.on('log', function(level, msg, obj) {
    logFunc[level](msg, obj);
  });

  return client;
};
