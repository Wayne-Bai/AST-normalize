var request = require('request');

exports.sync = function(pi, cb) {
  var url = 'https://api.stocktwits.com/api/2/account/verify.json?access_token='+pi.auth.accessToken;
  request.get({url:url, json:true}, function(err, resp, me){
    if(err) return cb(err);
    if(resp.statusCode !== 200 || !me || !me.user || !me.user.id) {
      return cb(resp.statusCode+': '+JSON.stringify(me));
    }
    pi.auth.pid = me.user.id+'@stocktwits';
    pi.auth.profile = me.user;
    var data = {};
    data['user:'+pi.auth.pid+'/self'] = [me.user];
    cb(null, {data:data, auth:pi.auth});
  });
};
