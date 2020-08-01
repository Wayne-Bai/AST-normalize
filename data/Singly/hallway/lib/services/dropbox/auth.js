var OAlib = require('oauth').OAuth;
var request = require('request');
var serializer = require('serializer');
var url = require('url');

module.exports = {
  handler : function (callback, apiKeys, done, req, res) {
    var OA = new OAlib(
      'https://api.dropbox.com/1/oauth/request_token',
      'https://api.dropbox.com/1/oauth/access_token',
      apiKeys.appKey,
      apiKeys.appSecret,
      '1.0',
      callback,
      'HMAC-SHA1',
      null,
      {'Accept': '*/*', 'Connection': 'close'}
    );
    var qs = url.parse(req.url, true).query;
    var serialize = serializer.createSecureSerializer(apiKeys.appSecret, apiKeys.appSecret);

    // second phase, post-user-authorization
    var sess;
    if (req.cookies && req.cookies.linkedin_client) {
      try {
        sess = serialize.parse(req.cookies.linkedin_client);
      } catch(E) {}
    }

    if (qs && qs.oauth_token && sess && sess.token_secret) {
      OA.getOAuthAccessToken(
        qs.oauth_token,
        sess.token_secret,
        qs.oauth_verifier,
        function (error, oauth_token, oauth_token_secret, additionalParameters) {
          if (error || !oauth_token) {
            return done(new Error("oauth failed to get access token"));
          }
          done(null, {
              consumerKey : apiKeys.appKey,
              consumerSecret : apiKeys.appSecret,
              token : oauth_token,
              tokenSecret: oauth_token_secret
          });
        }
      );
      return;
    }

    // first phase, initiate user authorization
    OA.getOAuthRequestToken({
      oauth_callback: callback
    }, function (error, oauth_token, oauth_token_secret, oauth_authorize_url, additionalParameters) {
      if (error) return res.end("failed to get token: " + error);

      res.cookie('linkedin_client',
        serialize.stringify({token_secret:oauth_token_secret}),
        {path: '/', httpOnly: false}
      ); // stash the secret

      res.redirect('https://www.dropbox.com/1/oauth/authorize?oauth_callback=' +
                   callback +'&oauth_token=' + oauth_token);
    });
  }
};
