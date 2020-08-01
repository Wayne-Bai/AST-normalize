var async = require('async');
var request = require('request');

// I'm not in love w/ the experiment here to do two in one and how
// arg/type/types/etc is used, but it works for now

exports.sync = function(processInfo, cb) {
  var arg = {};
  arg.types = {
    following: [],
    followers: []
  };
  arg.headers = {
    "Authorization":"OAuth " + processInfo.auth.accessToken,
    "Connection":"keep-alive"
  };
  async.forEach(Object.keys(arg.types), function(type, cb2) {
    getType(type, arg, cb2);
  }, function(err){
    var data = {};
    data['user:' + processInfo.auth.pid + '/followers'] = arg.types.followers;
    data['user:' + processInfo.auth.pid + '/following'] = arg.types.following;
    cb(err, {data : data});
  });
};

function getType(type, arg, cb) {
  request.get({
    url:"https://api.stocktwits.com/api/2/graph/" + type + ".json?limit=500",
    json:true,
    headers:arg.headers
  }, function(err, resp, body) {
    if(err || !body || !Array.isArray(body.users)) return cb(err);
    // TODO: pagination, not quite sure how it works yet
    arg.types[type] = body.users;
    cb();
  });
}
