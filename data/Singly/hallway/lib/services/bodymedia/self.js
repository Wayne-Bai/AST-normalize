var OAlib = require('oauth').OAuth;

exports.sync = function(pi, cb) {
  var tokenUrl = 'https://api.bodymedia.com/oauth/access_token?api_key=' +
                 pi.auth.consumerKey;

  var OA = new OAlib(
    null, tokenUrl,
    pi.auth.consumerKey, pi.auth.consumerSecret,
    '1.0', null, 'HMAC-SHA1', null, {'Accept': '*/*', 'Connection': 'close'});

  var url = 'http://api.bodymedia.com/v2/json/user/info?api_key=' +
            pi.auth.consumerKey;
  OA.get(url, pi.auth.token, pi.auth.tokenSecret, function(err, body) {
    if(err) return cb(err);

    var me;
    try{
      me = JSON.parse(body);
    } catch(E) {
      return cb(E);
    }

    pi.auth.pid = me.id + '@bodymedia';
    pi.auth.profile = me;
    var data = {};
    data['profile:' + pi.auth.pid + '/self'] = [me];
    cb(null, {data: data, auth: pi.auth});
  });
};
