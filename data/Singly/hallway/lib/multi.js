var urllib = require('url');
var querystring = require('querystring');

var request = require('request');
var async = require('async');

var lconfig = require('lconfig');
var lutil = require('lutil');

// issue multiple queries in one
module.exports.get = function(req, res) {
  var urls = req.param('urls');
  var debug = lutil.isTrue(req.param('debug'));
  if (!urls) return res.jsonErr('missing required parameter urls', 400);
  urls = urls.split(',');
  if (urls.length === 0) return res.jsonErr('invalid urls value:', 400);
  if (urls.length > lconfig.multiLimit) {
    return res.jsonErr('limited to ' + lconfig.multiCount + ' urls (want ' +
                       'more? email simon@singly.com)', 400);
  }

  // issue them all in parallel, and then collect the results, indexed by the
  // passed in url
  var response = {};
  async.forEach(urls, function(thisURL, cbEach) {
    var parsed = urllib.parse(thisURL);
    if (parsed.href === '') {
      response[thisURL] = { error: 'invalid url' };
      return cbEach();
    }
    if (parsed.pathname.indexOf('/multi') > -1 &&
        parsed.pathname.indexOf('/multi') < 4) {
      response[thisURL] = { error: 'cannot make /multi requests from /multi' };
      return cbEach();
    }
    // make sure all calls are to us!
    var localURL = urllib.format({
      protocol: 'http',
      hostname: 'localhost',
      port: lconfig.lockerPort,
      pathname: parsed.pathname,
      query: querystring.parse(parsed.query)
    });
    var start = Date.now();
    request.get({uri:localURL, json:true, followRedirect: false},
      function(err, resp, body) {
      var thisResp = { body: body };
      if (debug) {
        thisResp.elapsedTime = Date.now() - start;
        thisResp.parsedPath = parsed.path;
      }
      if (resp) thisResp.statusCode = resp.statusCode;
      if (err) thisResp.error = err;
      response[thisURL] = thisResp;
      cbEach();
    });
  }, function(err) {
    res.json(response);
  });
};
