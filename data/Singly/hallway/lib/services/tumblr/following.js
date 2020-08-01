/*
 *
 * Copyright (C) 2011, Singly, Inc.
 * All rights reserved.
 *
 * Please see the LICENSE file for more information.
 *
 */

var tumblr = require('./lib.js');
var path = require('path');

exports.sync = function(pi, cb) {
  pi.tb = require(path.join(__dirname, 'tumblr_client.js'))(pi.auth.consumerKey, pi.auth.consumerSecret);
  var resp = {data: {}};
  var base = 'blog:' + pi.auth.pid + '/following';
  var blogs = resp.data[base] = [];
  tumblr.getFollowing(pi, {}, function(blog){
    blogs.push(blog);
  }, function(err) {
    cb(err, resp);
  });
};
