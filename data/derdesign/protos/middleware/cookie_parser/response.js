
/* Cookie Parser » Response extensions */

var app = protos.app,
    http = require('http'),
    slice = Array.prototype.slice,
    OutgoingMessage = http.OutgoingMessage;

/**
  Sets a cookie

  @param {string} name
  @param {string} value
  @param {object} opts
  @public
 */

OutgoingMessage.prototype.setCookie = function(name, val, opts) {
  var pairs, removeCookie,
      request = this.request;

  app._loadCookies(request);

  if (opts == null) opts = {};
  pairs = [name + "=" + (encodeURIComponent(val))];
  removeCookie = (typeof opts.expires == 'number') && opts.expires < 0;
  if (opts.domain == null) opts.domain = app.cookieDomain || app.hostname;
  if (opts.domain == 'localhost') opts.domain = null;
  if (opts.path == null) opts.path = '/';

  opts.expires = (typeof opts.expires == 'number' && opts.expires)
  ? new Date(Date.now() + (opts.expires*1000))
  : null;
  
  if (opts.domain != null) pairs.push("domain=" + opts.domain);
  pairs.push("path=" + opts.path);
  if (opts.expires != null) pairs.push("expires=" + (opts.expires.toUTCString()));
  if (opts.httpOnly) pairs.push('httpOnly');
  if (opts.secure) pairs.push('secure');
  if (!removeCookie) request.cookies[name.toLowerCase()] = val;
  
  return this.__setCookie.push(pairs.join('; '));
}

/**
  Removes a cookie

  @param {string} cookie
  @public
 */

OutgoingMessage.prototype.removeCookie = function(name) {
  if (this.request.cookies == null) app._loadCookies(this.request);
  this.setCookie(name, null, {expires: -3600});
  delete this.request.cookies[name.toLowerCase()];
}

/**
  Removes several cookies

  @param {array} cookies
  @public
 */

OutgoingMessage.prototype.removeCookies = function() {
  var names = slice.call(arguments, 0);
  for (var i=0; i< names.length; i++) {
    this.removeCookie(names[i]);
  }
}

/**
  Checks if cookie exists

  @param {string} cookie
  @return {boolean}
  @public
 */

OutgoingMessage.prototype.hasCookie = function(cookie) {
  return this.request.hasCookie(cookie);
}

/**
  Gets a cookie value

  @param {string} cookie
  @returns {string}
  @public
 */

OutgoingMessage.prototype.getCookie = function(cookie) {
  return this.request.getCookie(cookie);
}
