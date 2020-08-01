var url = require('url');
var request = require('request');

exports.proxy = function(auth, req, res) {
  var uri = url.parse('https://api.soundcloud.com' + req.url);

  uri.query = req.query;
  uri.query.oauth_token = auth.accessToken;

  // Trying to mirror everything needed from the original request
  var arg = { method: req.method };

  arg.uri = url.format(uri);

  if (req.headers['content-type']) {
    // POST or PUT only?
    req.headers = {
      'content-type': req.headers['content-type']
    };

    arg.body = req.body;
  }

  arg.json = true;

  request(arg).pipe(res);
};
