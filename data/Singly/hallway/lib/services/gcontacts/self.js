var gdata = require('gdata-js');

var PROFILE_URL = 'https://www.google.com/m8/feeds/contacts/default/full';

exports.sync = function (pi, callback) {
  gdata.clientFromAuth(pi.auth).getFeed(PROFILE_URL, { 'max-results': 0 },
    function (err, result) {
    if (!(result && result.feed) || err || result.error) {
      console.error('google contacts BARF! err=', err, ', result=', result);
      return callback(err);
    }

    // all we have for a profile is the top level stuff
    pi.auth.profile = result.feed;
    pi.auth.pid = encodeURIComponent(result.feed.id.$t) + '@gcontacts';

    var base = 'profile:' + pi.auth.pid + '/self';
    var data = {};

    data[base] = [result.feed];

    callback(null, { auth: pi.auth, data: data });
  });
};
