var gdata = require('gdata-js');

var MAX_RESULTS = 50;
var UPLOAD_URL = 'https://gdata.youtube.com/feeds/api/users/default/uploads';

exports.sync = function (pi, callback) {
  if (!pi.config.startIndex) {
    pi.config.startIndex = 1;
  }

  var params = {
    'v': '2',
    'start-index': pi.config.startIndex,
    'max-results': MAX_RESULTS
  };

  gdata.clientFromAuth(pi.auth).getFeed(UPLOAD_URL, params,
    function (err, result) {
    if (!(result && result.feed) || err || result.error) {
      console.error('youtube BARF! err=', err, ', result=', result);
      return callback(err);
    }

    var responseObj = {
      data: {},
      config: {
        startIndex: pi.config.startIndex
      },
      auth: pi.auth
    };

    responseObj.data['video:' + pi.auth.pid + '/uploads'] = result.feed.entry;

    if (result.feed.entry && result.feed.entry.length > 0) {
      responseObj.config.startIndex += result.feed.entry.length;
      responseObj.config.nextRun = -1;
    } else {
      responseObj.config.startIndex = 1;
      responseObj.config.nextRun = 0;
    }

    return callback(null, responseObj);
  });
};
