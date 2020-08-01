/*
*
* Copyright (C) 2011, Singly, Inc.
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

var instagram = require('./lib.js');

exports.sync = function(pi, cb) {
  if (!pi.config) pi.config = {};

  pi.data = {};
  var base = 'contact:' + pi.auth.pid + '/follows';

  var params = {};
  if (pi.config.followsNext) params.uri = pi.config.followsNext;

  instagram.getFollows(pi, params, function(err, ret) {
    if(!ret) return cb(err);
    pi.data[base] = ret.posts;
    pi.config.followsNext = ret.nextUrl;
    if (ret.nextUrl) pi.config.nextRun = -1;
    cb(err, pi);
  });
};
