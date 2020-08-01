/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!child_process'
], function (intern, registerSuite, assert, cp) {
  'use strict';

  var suite = {
    name: 'configuration'
  };

  // This test cannot be run remotely like the other tests in tests/server. So,
  // if production, just skip these tests (register a suite with no tests).
  if (intern.config.fxaProduction) {
    registerSuite(suite);
    return;
  }

  function spawnServer (cb) {

    var proc = cp.spawn('./scripts/run_locally.js', [], {
      env: {
        PATH: process.env.PATH,
        PORT: '3040',
        HTTP_PORT: '3090',
        I18N_SUPPORTED_LANGUAGES: 'en,blah'
      }
    });

    var errData = '';

    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', function (data) {
      errData += data;
    });

    proc.on('error', function (err) {
      cb(err);
    });

    proc.on('exit', function (/*code*/) {
      cb(null, errData);
    });

  }

  suite['#test incompatible locale lists 2'] = function () {
    var dfd = this.async(10000);

    spawnServer(dfd.callback(function (err, data) {
      assert.isNull(err);
      assert.ok(data.indexOf('Configuration error: (blah) is missing from the default list of supportedLanguages') >= 0, data);

      dfd.resolve();
    }, dfd.reject.bind(dfd)));
  };

  registerSuite(suite);
});
