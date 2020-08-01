var request = require("request");

exports.sync = function(processInfo, cb) {
  var arg = processInfo.auth;
  arg.events = [];
  page(arg, function(err) {
    var data = {};
    data['event:' + processInfo.auth.pid + '/received'] = arg.events;
    cb(err, {data : data});
  });
};

function page(arg, callback) {
  if (!arg.url) {
    arg.url = "https://api.github.com/users/" + arg.profile.login +
              "/received_events?per_page=100&access_token=" + arg.accessToken;
  }
  var api = arg.url;
  if (arg.page) api += "&page=" + arg.page;
  request.get({uri:api, json:true, headers:{"User-Agent":"singly.com"}}, function(err, resp, body) {
    if (err || !body || !Array.isArray(body) || body.length === 0) {
      return callback(err);
    }
    body.forEach(function(e) {
      arg.events.push(e);
    });
    arg.page = (arg.page) ? arg.page + 1 : 2;
    page(arg, callback);
  });
}
