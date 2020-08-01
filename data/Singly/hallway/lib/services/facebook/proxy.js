var url = require('url');
var request = require('request');
var querystring = require('querystring');

exports.proxy = function(auth, req, res) {
  var uri = url.parse('https://graph.facebook.com' + req.url);
  // we need to parse the qs ourselves here because facebook open graph POSTing
  // requires  query params with key of the form 'image[0][url]' and express
  // gets a bit too cute and parses that stuff out into subobjects
  var qs = req.originalUrl;
  qs = qs.substring(qs.indexOf('?')+1);
  qs = querystring.parse(qs);
  uri.query = qs;
  uri.query.access_token = auth.accessToken;

  // Mirror everything needed from the original requesdt
  var arg = {method:req.method};
  arg.uri = url.format(uri);
  if(req.headers['content-type']) {
    req.headers = {'content-type':req.headers['content-type']};
    if (req.headers['content-type'].indexOf('form') > 0) {
      arg.form = req.body;
    } else if (req.headers['content-type'].indexOf('json') > 0) {
      arg.json = req.body;
    } else {
      arg.body = req.body;
    }
  }
  request(arg).pipe(res);
};
