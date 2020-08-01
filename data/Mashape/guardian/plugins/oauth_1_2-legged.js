var helper = require('./lib/helper');

module.exports = {
  "category": "oauth",
  "type": "1.0a-three-legged",
  "steps": 2,
  "step": {
    // Authorize against service using signed request
    // https://github.com/Mashape/mashape-oauth/blob/master/FLOWS.md#oauth-10a-two-legged
    1: {
      invoke: function (options) {
        var oa = helper.getOAuth(options);
        oa.getOAuthRequestToken(options.parameters || {}, options.next);
      },

      next: function (server, response, next) {
        if (response.error) {
          return helper.handleCallback(server.req.session.data, server, {
            status: 500,

            data: {
              message: 'Could not authenticate with given credentials for request token.',
              data: response.error.data
            }
          });
        }

        server.req.session.data.oauth_token = response.token;
        server.req.session.data.token_secret = response.secret;

        return next();
      }
    },

    2: {
      invoke: function (options) {
        var oa = helper.getOAuth(options);
        var opts = { parameters: options.parameters || {} };

        opts.parameters.oauth_verifier = options.oauth_verifier;
        opts.parameters.oauth_token = options.oauth_token;
        oa.getOAuthAccessToken(opts, options.next);
      },

      next: function (server, response, next) {
        var result;

        if (response.error) {
          return helper.handleCallback(server.req.session.data, server, {
            status: 500,

            data: {
              message: 'Could not determine access_token and secret.',
              data: response.error.data
            }
          });
        }

        result = response.results || {};
        result.access_token = response.token;
        result.access_secret = response.secret;
        next(result);
      }
    }
  },

  "validate": function (opts) {
    if (!opts.requestUrl)
      return "Request URL is required.";

    if (!opts.accessUrl)
      return "Access URL is required.";

    return undefined;
  }
};
