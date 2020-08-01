/*!
 * Copyright 2002 - 2014 Webdetails, a Pentaho company.  All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to  http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or  implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

// Find and inject tests using require
(function() {
  var karma = window.__karma__;

  var tests = [];
  for (var file in karma.files) {
    if ((/test\-js.*\-spec\.js$/).test(file)) {
      console.log(file);
      //tests.push(file.replace(/^\/base\//, 'http://localhost:9876/base/'));
      tests.push(file);
    }
  }

  //requireCfg['baseUrl'] = 'http://localhost:9876/base/';
  requireCfg['baseUrl'] = '/base';
  requirejs.config(requireCfg);

  // Ask Require.js to load all test files and start test run
  require(tests, karma.start);
})();