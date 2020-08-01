/* the external library basically forwards oauth requests to an external server */
/* the local libary runs its own oauth server and is set up to be used with the NPS active directory */
/* the setting is a true/false value in the config.json file */

module.exports = function(config) {
  var oauth = require(config.oauth && config.oauth.external ? './external' : './local')(config);
  return [{
    'name': 'Add Active Directory User',
    'description': 'Adds an active directory user to the database',
    'method': 'POST',
    'path': '/add_active_directory_user',
    'process': function(req, res) {
      if (oauth.addUser) {
        oauth.addUser(req.body, function(error, data) {
          if (error) {
            res.status(error.statusCode || 500);
            res.send(error);
          } else {
            res.send(data);
          }
        });
      } else {
        res.status(405);
        res.send('Method Not Allowed');
      }
    }
  }, {
    'name': 'Request Token',
    'description': 'Gets a request token from the OAuth provider and passes that information back to the calling code.',
    'method': 'POST',
    'path': '/request_token',
    'process': function(req, res) {
      oauth.requestToken(function(error, token, tokenSecret) {
        if (error) {
          res.status(error.statusCode || 500);
          res.send(error);
        } else {
          res.send(['oauth_token=', token, '&oauth_token_secret=', tokenSecret].join(''));
        }
      });
    }
  }, {
    'name': 'Authorize',
    'description': 'Forwards user to the OAuth provider site for login and token exchange',
    'method': 'GET',
    'path': '/authorize',
    'process': function(req, res) {
      oauth.authorize(req, res);
    }
  }, {
    'name': 'Access Token',
    'description': 'Requests the oauth_token and oauth_token_secret from the OAuth provider',
    'method': 'POST',
    'path': '/access_token',
    'process': function(req, res) {
      oauth.accessToken(req.headers.authorization, function(error, oauthAccessToken, oauthAccessTokenSecret, username, userId) {
        if (error) {
          res.status(error.statusCode || 500);
          res.send(error);
        } else {
          res.send([
            'oauth_token=', oauthAccessToken,
            '&oauth_token_secret=', oauthAccessTokenSecret,
            '&username=', username,
            '&userId=', userId
          ].join(''));
        }
      });
    }
  }];
};
