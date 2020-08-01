var request = require('request');

module.exports = {
  statuses: function(data, callback) {
    request.post('https://www.yammer.com/api/v1/messages.json',{
      qs: {
        access_token: data.auth.accessToken.token,
        body: data.body
      }
    }, function(err, response, body) {
      if (typeof(body) === 'string') try {
        body = JSON.parse(body);
      } catch(E) {
        // Wasn't JSON
        err = 'Yammer API did not return JSON.';
      }
      if (err) return callback(null, {error: err});
      callback(null, body);
    });
  }
};
