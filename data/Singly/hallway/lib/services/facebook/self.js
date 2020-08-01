/*
*
* Copyright (C) 2011, Singly, Inc.
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

var fb = require('./lib.js');

exports.sync = function(processInfo, cb) {
  fb.getProfile(processInfo.auth, function(err, self){
    if(err) return cb(err);
    // map to shared profile
    processInfo.auth.profile = JSON.parse(JSON.stringify(self));

    // delete this possibly long stuff;
    delete processInfo.auth.profile.favorite_athletes;
    delete processInfo.auth.profile.bio;

    processInfo.auth.pid = self.id+'@facebook'; // profile id
    var base = 'contact:'+processInfo.auth.pid+'/self';
    processInfo.data = {};
    processInfo.data[base] = [self];
    cb(err, processInfo);
  });
};
