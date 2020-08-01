/*
 *
 * Copyright (C) 2013, Singly Inc.
 * All rights reserved.
 *
 * Please see the LICENSE file for more information.
 *
 */

var path = require('path');
var twitter = require(path.join(__dirname, 'lib.js'));

exports.sync = function(pi, cb) {
  return twitter.contactSync('followers', pi, cb);
};
