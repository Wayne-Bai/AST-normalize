var request = require('request');
var fs = require('fs');
var path = require('path');
var util = require('util');

var URL = 'https://api.chain.com';
var PEM = fs.readFileSync(path.join(__dirname, './chain.pem'));

module.exports = HttpUtility;

function HttpUtility(c) {
  if(c.auth == null) {
    c.auth = "GUEST-TOKEN";
  };
  this.auth = c.auth;

  if (c.url == null) {
    c.url = URL;
  };
  this.url = c.url;
}

HttpUtility.prototype.makeRequest = function(method, path, body, options, cb) {
  var usingJson = false;
  var r = {
    strictSSL: true,
    cert: PEM,
    auth: this.auth,
    method: method,
    uri: this.url + path
  };
  if(body != null) {
    usingJson = true;
    r['json'] = body;
  }
  if(options != null) {
    r['qs'] = options;
  }
  request(r, function(err, resp, body) {
    if (Math.floor(resp.statusCode / 100) != 2) {
      err = body;
    }
    if(usingJson) {
      cb(err, body);
    } else {
      cb(err, JSON.parse(body));
    }
  });
};

HttpUtility.prototype.post = function(path, body, cb) {
  this.makeRequest('POST', path, body, null, cb);
};

HttpUtility.prototype.delete = function(path, cb) {
  this.makeRequest('DELETE', path, null, null, cb);
};

HttpUtility.prototype.get = function(path, options, cb) {
  if (typeof(options) == 'function') {
    cb = options;
    options = null;
  }

  this.makeRequest('GET', path, null, options, cb);
}
