var fitbit = require('fitbit-js');

exports.proxy = function(auth, req, res) {
  var fb = fitbit(auth.consumerKey, auth.consumerSecret);
  req.query.token = {
    oauth_token: auth.token,
    oauth_token_secret: auth.tokenSecret
  };
  fb.apiCall(req.method, req.url, req.query, function(err, resp, data) {
    if(err) return res.json(err, 500);
    res.json(data);
  });
};
