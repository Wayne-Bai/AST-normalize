var OAlib = require('oauth').OAuth;

exports.sync = require('./lib').genericSync('profile:self', function(pi) {
  return '/user';
}, function(pi) {
  if (!pi.config) {
    pi.config = {};
  }

  return '?action=getbyuserid&userid=' + pi.auth.userId;
}, function(pi, js) {
  var items;
  pi.auth.pid = pi.auth.userId+'@withings';
  if (js.body) {
    items = js.body.users;
  }

  if (!js || !items || items.length === 0) {
    pi.config.nextRun = 0;
    return [];
  }

  return items;
});