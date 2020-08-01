/*
 *
 * Copyright (C) 2013, Singly Inc.
 * All rights reserved.
 *
 * Please see the LICENSE file for more information.
 *
 */


var path = require('path');
var tw = require(path.join(__dirname, 'lib.js'));

exports.sync = function(pi, cb) {
  tw.syncDirectMessages('sent', pi, cb);
};
