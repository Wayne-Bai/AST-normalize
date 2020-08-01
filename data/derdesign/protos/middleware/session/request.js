
/* Session Request methods */

var app = protos.app,
    util = require('util'),
    http = require('http'),
    IncomingMessage = http.IncomingMessage;

IncomingMessage.prototype.__saveSession = null;

IncomingMessage.prototype.noSessionRegenerate = function() {
  this.__noSessionRegenerate = true;
}

/**
  Saves the session if it has changed

  @param {function} callback
  @private
*/

IncomingMessage.prototype.saveSessionState = function(callback) {
  var expires;

  if (! app.supports.session) {
    callback.call(app);
    return;
  }

  var self = this,
      session = this.session,
      multi = app.session.storage.multi(),
      sessId = this.getCookie(app.session.config.sessCookie);

  // Calculate expires
  if (session.user != null) {
    expires = (session.pers ? app.session.config.permanentExpires : app.session.config.temporaryExpires);
  } else {
    expires = app.session.config.guestExpires;
  }
  
  // Set defaultExpires if expires is zero
  if (!expires) expires = app.session.config.defaultExpires;

  multi.setHash(sessId, session);

  for (var key in this.__origSessionState) {
    if (session[key] == null) multi.deleteFromHash(sessId, key);
  }

  multi.expire(sessId, expires);

  multi.exec(function(err, replies) {
    if (err) {
      app.serverError(self.response, util.format("Unable to save session state: %s" + err.toString()));
    } else {
      callback.call(self, app);
    }
  });
}

/**
  Checks if the session has changed

  @returns {boolean}
  @private
*/

IncomingMessage.prototype.sessionChanged = function() {
  if (!app.supports.session) return false;
  var curSessionJson = JSON.stringify(this.session);
  return (this.hasCookie(app.session.config.sessCookie)
  && curSessionJson !== this.__jsonSession
  && curSessionJson !== '{}');
}
