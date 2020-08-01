/*
*
* Copyright (C) 2011, Singly, Inc.
* All rights reserved.
*
* Please see the LICENSE file for more information.
*
*/

var qs = require('querystring');
var OAlib = require('oauth').OAuth;

exports.getPage = function (pi, endpoint, type, perPage, params, callback) {
  var config = pi.config || {};
  var auth = pi.auth;

  var oa = new OAlib('http://www.flickr.com/services/oauth/request_token',
    'http://www.flickr.com/services/oauth/access_token',
    pi.auth.consumerKey,
    pi.auth.consumerSecret,
    '1.0',
    null,
    'HMAC-SHA1',
    null,
    {
      'Accept': '*/*',
      'Connection': 'close'
    }
  );

  //var client = new Flickr(auth.consumerKey, auth.consumerSecret);
  if (!config[endpoint]) config[endpoint] = {};
  if (!config[endpoint].lastPage) config[endpoint].lastPage = 0;

  var thisPage = config[endpoint].lastPage + 1;
  params.auth_token = auth.token;
  params.per_page = perPage;
  params.page = thisPage;

  params.api_key = pi.auth.consumerKey;
  params.format = 'json';
  params.nojsoncallback = '1';
  params.method = endpoint;

  var type_s = type + 's';

  oa.getProtectedResource(
    'http://api.flickr.com/services/rest/?' + qs.stringify(params),
    'GET', pi.auth.token, pi.auth.tokenSecret,
    function (err, data, response) {
      if (err) {
        console.error('Network Error: ', err);
        return callback(err);
      }

      var json = JSON.parse(data);
      var page;
      var pages;

      if (json.stat && json.stat === "fail") return callback(json.message);

      try {
        page = parseInt(json[type_s].page, 10);
        pages = parseInt(json[type_s].pages, 10);
      } catch (E) {
        console.error("Error processing json: %s from %s", E, response);
        return callback("Error processing the json");
      }

      //whoa whoa whoa, bad news bears, page should never be greater than pages
      if (page > pages) {
        // seems like there is a possiblity of pages === 0 if there are no
        // photos
        config[endpoint].lastPage = 0;
        config[endpoint].totalPages = -1;
        if (pages !== 0) {
          console.error(
            'Flickr error, page > total pages: page ==',
            json[type_s].page, ', pages ==', json[type_s].pages
          );
        }
      } else if (page === pages) { // last page
        config[endpoint].lastPage = 0;
        config[endpoint].totalPages = -1;
      } else { // still paging
        config[endpoint].lastPage = page;
        config[endpoint].totalPages = pages;
        config.nextRun = -1;
      }
      callback(null, config, json[type_s][type]);
    }
  );
};

// Flickr reports datetaken as a string in the user's timezone,
// but dateupload as seconds since epoch GMT.
// See: https://secure.flickr.com/services/api/misc.dates.html
exports.dateTaken = function (photo, offset) {
  if (!photo.datetaken) {
    return;
  }

  var timeStr = photo.datetaken + (offset || 'Z');

  return Date.parse(timeStr);
};

exports.dateUploaded = function (photo) {
  return parseInt(photo.dateupload || photo.dateuploaded, 10) * 1000; // to milliseconds
};

exports.setTime = function (photo, offset) {
  photo.at = exports.dateTaken(photo, offset) || exports.dateUploaded(photo);
};
