/*
*
* Copyright (C) 2011, Singly, Inc.
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

var instagram = require('./lib.js');
var _ = require('underscore');

exports.sync = function(pi, cb) {
  pi.data = {};
  var base = 'photo:' + pi.auth.pid + '/media';
  var arg = {};

  if (pi.config.since) arg.min_timestamp = pi.config.since;
  if (pi.config.mediaNext) arg.uri = pi.config.mediaNext;

  instagram.getMedia(pi, arg, function(err, ret) {
    if(!ret) return cb(err);
    pi.config.mediaNext = ret.nextUrl;
    pi.data[base] = ret.posts;
    _.extend(pi.config, _.pick(ret, 'since', 'pagingSince', 'nextRun'));
    // if first time syncing, return special '2' to prioritize syncing
    if (pi.config.nextRun === -1) {
      pi.config.nextRun = (pi.config.firstSync) ? -1 : 2;
    }
    else { // when done paging flag
      if(!pi.config.firstSync) pi.config.firstSync = Date.now();
    }
    cb(err, pi);
  });
};
