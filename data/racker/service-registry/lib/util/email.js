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

var querystring = require('querystring');

var request = require('rackspace-shared-utils/lib/request').request;
var settings = require('./settings');
var misc = require('rackspace-shared-utils/lib/misc');

/**
 * Send an email using Mailgun's REST API.
 *
 * @param {String} address Recipient email address.
 * @param {String} subject Email subject.
 * @param {String} body Email body.
 * @param {Object} options Additional options, for specifying tags, variables, etc...
 *                  right now it takes 'variables', 'headers' (k/v) and 'tags' as
 *                  a list of strings.
 * @param {Function} callback A callback fired with (err, result).
 */
exports.sendEmail = function(address, subject, body, options, callback) {
  options = options || {};
  options.headers = options.headers || {};
  options.apiUrl = options.apiUrl || settings.MAILGUN_API_URL;
  options.domain = options.domain || settings.MAILGUN_DOMAIN;
  options.apiKey = options.apiKey || settings.MAILGUN_API_KEY;
  options.fromAddress = options.fromAddress || settings.MAILGUN_FROM_ADDRESS;
  options.testMode = options.testMode;

  var url = options.apiUrl + options.domain + '/messages', bodyObj, k, httpOptions;

  httpOptions = {
    'expected_status_codes': [200],
    'return_response': true,
    'parse_json': true,
    'username': 'api',
    'password': options.apiKey,
    'headers': {'Content-Type': 'application/x-www-form-urlencoded'}
  };

  bodyObj = {
    'to': address,
    'subject': subject,
    'from': options.fromAddress
  };

  if (options.isHTML) {
    bodyObj.html = body;
  } else {
    bodyObj.text = body;
  }

  for (k in options.headers) {
    if (options.headers.hasOwnProperty(k)) {
      bodyObj['h:' + k] = options.headers[k];
    }
  }

  if (options.testMode) {
    bodyObj['o:testmode'] = true;
  }

  if (options.variables) {
    for (k in options.variables) {
      if (options.variables.hasOwnProperty(k)) {
        bodyObj['v:' + k] = options.variables[k];
      }
    }
  }

  if (options.tags) {
    bodyObj['o:tag'] = options.tags;
  }

  body = querystring.stringify(bodyObj);

  request(url, 'POST', body, httpOptions, callback);
};
