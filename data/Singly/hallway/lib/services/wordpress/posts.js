/*
*
* Copyright (C) 2011, Singly, Inc.
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

var request = require('request');

exports.sync = function(pi, cb) {
  var after = pi.config.postsAfter||946684800000;
  // have to add 1sec on since they're inclusive
  request.get({uri:'https://public-api.wordpress.com/rest/v1/sites/'+pi.auth.token.blog_id+'/posts/?number=100&order=ASC&order_by=modified&after='+(new Date(after+1000).toISOString()), headers:{authorization:'Bearer '+pi.auth.token.access_token}, json:true}, function(err, resp, js){
    if(err) return cb(err);
    if(resp.statusCode !== 200 || !js || !Array.isArray(js.posts)) {
      return cb(resp.statusCode+': '+JSON.stringify(js));
    }
    var data = {};
    js.posts.forEach(function(post){
      var mod = new Date(post.modified).getTime();
      if(mod > after) after = mod;
    });
    var config = {postsAfter:after};
    if(js.posts.length > 1) config.nextRun = -1;
    data['post:'+pi.auth.pid+'/posts'] = js.posts;
    cb(null, {data:data, config:config});
  });
};
