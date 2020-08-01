var url = require('url');
var request = require('request');

exports.proxy = function(auth, req, res) {
  var uri = url.parse('https://api.github.com' + req.url);
  uri.query = req.query;
  uri.query.access_token = auth.accessToken;
  // trying to mirror everything needed from orig req
  var arg = {method: req.method, headers:{"User-Agent":"singly.com"}};
  arg.uri = url.format(uri);
  if (req.headers['content-type']) { // post or put only?
    arg.headers['content-type'] = req.headers['content-type'];
    arg.body = req.body;
  }
  arg.json = true;
  request(arg).pipe(res);
};
