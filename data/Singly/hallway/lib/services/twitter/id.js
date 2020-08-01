exports.sync = function(pi, cb) {
  var tc = require(__dirname+'/twitter_client.js')(pi.auth.consumerKey, pi.auth.consumerSecret);
  var query = {};
  query.token = pi.auth.token;
  var path = pi.type;
  if(path == 'contact') {
    path = 'users';
    query.user_id = pi.id;
  }
  if(path == 'tweet') {
    path = 'statuses';
    query.id = pi.id;
  }
  var p = tc.apiCall('GET', '/'+path+'/show.json', query, cb);
};
