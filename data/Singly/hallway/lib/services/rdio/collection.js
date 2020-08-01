/*
 *
 * Copyright (C) 2012, Singly, Inc.
 * All rights reserved.
 *
 * Please see the LICENSE file for more information.
 *
 */

var rdio = require('./lib.js');

exports.sync = function (pi, cb) {
  rdio.getTracksInCollection(pi, function (err, config, tracks) {
    if (err) return cb(err);
    var base = 'track:'+pi.auth.pid+'/collection';
    var data = {};
    data[base] = tracks;
    cb(null, {config: config, data: data});
  });
};
