var request = require('request');

exports.sync = function(pi, cb) {
  if (pi.auth.profile === undefined) {
    // we have to catch the token here in the first run
    pi.auth.profile = pi.auth.token.user;
    pi.auth.pid = pi.auth.token.user.id+'@yammer';
    var base = 'contact:'+pi.auth.pid+'/self';
    var data = {};
    data[base] = pi.auth.user;
    cb(null, {auth: pi.auth, data: data});
  }
  else {
    // all subsequent times, just update self
    var url = "https://www.yammer.com/api/v1/users/" + pi.auth.token.user.id + ".json?access_token=" + pi.auth.token.access_token.token;
    request.get({uri: url, json: true}, function(err, resp, body) {
      if(err || !body) return cb(err);
      pi.auth.profile = body; // map to shared profile
      pi.auth.pid = body.id+'@yammer'; // profile id
      var base = 'contact:'+pi.auth.pid+'/self';
      pi.data = {};
      pi.data[base] = [body];
      cb(err, pi);
    });
  }
};