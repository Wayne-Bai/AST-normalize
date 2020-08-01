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

var request = require('rackspace-shared-utils/lib/request').request;

var settings = require('../../lib/util/settings');

exports['test_404_response'] = function(test, assert) {
  var options = {'expected_status_codes': [200],
                 'headers': {'X-Auth-Token': 'dev'},
                 'return_response': true,
                 'parse_json': true};

  request('http://127.0.0.1:9000/v1.0/7777/random-url', 'GET', null, options, function(err, res) {
    assert.ok(err);
    assert.equal(err.statusCode, 404);
    assert.match(err.response.body.message, /The page cannot be found/);
    test.finish();
  });
};

exports['test_invalid_content_type'] = function(test, assert) {
  var options = {'expected_status_codes': [200],
                 'headers': {'X-Auth-Token': 'dev', 'Content-Type': 'foo/bar'},
                 'return_response': true,
                 'parse_json': true};

  request('http://127.0.0.1:9000/v1.0/7777/services', 'POST', 'a', options, function(err, res) {
    assert.ok(err);
    assert.equal(err.statusCode, 400);
    assert.match(err.response.body.message, /Unsupported content type: foo\/bar/);
    test.finish();
  });
};

exports['test_invalid_json'] = function(test, assert) {
  var options = {'expected_status_codes': [200],
                 'headers': {'X-Auth-Token': 'dev', 'Content-Type': 'application/json'},
                 'return_response': true,
                 'parse_json': true};

  request('http://127.0.0.1:9000/v1.0/7777/services', 'POST', '{"a": }', options, function(err, res) {
    assert.ok(err);
    assert.equal(err.statusCode, 400);
    assert.match(err.response.body.message, /Failed to parse request body:/);
    test.finish();
  });
};

exports['test_max_body_size'] = function(test, assert) {
  var options = {'expected_status_codes': [200],
                 'headers': {'X-Auth-Token': 'dev'},
                 'return_response': true,
                 'parse_json': true},
      data = new Array(settings.MAX_REQUEST_BODY_SIZE + 2).join('a');

  request('http://127.0.0.1:9000/v1.0/7777/services', 'POST', data, options, function(err, res) {
    assert.ok(err);
    assert.equal(err.statusCode, 413);
    test.finish();
  });
};
