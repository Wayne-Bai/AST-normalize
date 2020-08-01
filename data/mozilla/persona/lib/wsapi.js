/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// an abstraction that implements all of the cookie handling, CSRF protection,
// etc of the wsapi.  This module also routes request to the approriate handlers
// underneath wsapi/
//
// each handler under wsapi/ supports the following exports:
//   exports.process - function(req, res) - process a request
//   exports.writes_db - must be true if the processing causes a database write
//   exports.method - either 'get' or 'post'
//   exports.authed - whether the wsapi requires authentication
//   exports.args - an array of arguments that should be verified
//   exports.i18n - boolean, does this operation display user facing strings

const
sessions = require('client-sessions'),
express = require('express'),
secrets = require('./secrets'),
config = require('./configuration'),
logger = require('./logging/logging.js').logger,
httputils = require('./httputils.js'),
forward = require('./http_forward.js').forward,
url = require('url'),
fs = require('fs'),
path = require('path'),
validate = require('./validate'),
version = require('./version.js'),
bcrypt = require('./bcrypt'),
i18n = require('i18n-abide'),
i18n_check = require('./i18n_client_check'),
db = require('./db'),
http = require('http'),
https = require('https');

var abide = i18n.abide({
  supported_languages: config.get('supported_languages'),
  default_lang: config.get('default_lang'),
  translation_directory: config.get('translation_directory'),
  disable_locale_check: config.get('disable_locale_check')
});

i18n_check();

const COOKIE_SECRET = secrets.hydrateSecret('browserid_cookie', config.get('var_path'));
var COOKIE_KEY = 'browserid_state';

// to support testing of browserid, we'll add a hash fragment to the cookie name for
// sites other than login.persona.org.  This is to address a bug in IE, see issue #296
if (config.get('public_url').indexOf('https://login.persona.org') !== 0) {
  const crypto = require('crypto');
  var hash = crypto.createHash('md5');
  hash.update(config.get('public_url'));
  COOKIE_KEY += "_" + hash.digest('hex').slice(0, 6);
}

const WSAPI_PREFIX = '/wsapi';

logger.info('session cookie name is: ' + COOKIE_KEY);

function clearAuthenticatedUser(session) {
  session.reset(['csrf']);
}

function isAuthed(req, requiredLevel) {
  if (req.session && req.session.userid && req.session.auth_level) {
    // 'password' authentication allows access to all apis.
    // 'assertion' authentication, grants access to only those apis
    // that don't require 'password'
    if (requiredLevel === 'assertion' || req.session.auth_level === 'password') {
      return true;
    }
  }
  return false;
}

function bcryptPassword(password, cb) {
  var startTime = new Date();
  bcrypt.encrypt(config.get('bcrypt_work_factor'), password, function() {
    var reqTime = new Date() - startTime;
    logger.info('bcrypt.encrypt_time', reqTime);
    cb.apply(null, arguments);
  });
}

function authenticateSession(options, cb) {
  var session = options.session;
  var uid = options.uid;
  var level = options.level;
  var duration_ms = options.duration_ms;
  var unverified = options.unverified;

  // The caller should provide the timestamp when the password was
  // last reset when it's available.  When provided, this avoids a database
  // read.  This prevents us from performing a write against mysql master
  // followed by a read against mysql slaves a couple ms later.  This
  // pattern would put a rediculously tight consistency requirement on
  // our database deployment.
  //
  // See issue #3309 for more context
  var lastReset = options.lastPasswordReset;

  if (['assertion', 'password'].indexOf(level) === -1)
    cb(new Error("invalid authentication level: " + level));

  function withPasswordReset(err, lastPasswordReset) {
    if (err)
      return cb(err);
    if (lastPasswordReset === undefined)
      return cb(new Error("authenticateSession called with undefined lastPasswordReset"));
    // if the user is *already* authenticated as this uid with an equal or
    // better level of auth, let's not lower them.  Issue #1049
    if (session.userid === uid && session.auth_level === 'password' &&
        session.auth_level !== level) {
      logger.info("not resetting cookies to 'assertion' authenticate a user who is already password authenticated");
    } else {
      if (duration_ms) {
        session.setDuration(duration_ms);
      }
      session.userid = uid;
      session.auth_level = level;
      session.lastPasswordReset = lastPasswordReset;
      session.unverified = unverified;
    }
    cb(null);
  }

  // if the client provided last reset timestamp, use that.  otherwise,
  // hit the database.
  if (typeof lastReset === 'number') {
    process.nextTick(function() {
      withPasswordReset(null, lastReset);
    });
  } else {
    db.lastPasswordReset(uid, withPasswordReset);
  }
}

function checkCSRF(req, resp, next) {
  // only on POSTs
  if (req.method !== "POST")
    return next();

  // there must be a session
  if (req.session === undefined || typeof req.session.csrf !== 'string') {
    logger.warn("POST calls to /wsapi require a cookie to be sent, this user may have cookies disabled");
    return httputils.forbidden(resp, "no cookie");
  }

  // and the token must match what is sent in the post body
  if (!req.body || !req.session || !req.session.csrf || req.body.csrf !== req.session.csrf) {
    // if any of these things are false, then we'll block the request
    var b = req.body ? req.body.csrf : "<none>";
    var s = req.session ? req.session.csrf : "<none>";
    logger.warn("CSRF validation failure, token mismatch. got:" + b + " want:" + s);
    return httputils.badRequest(resp, "CSRF violation");
  }

  // all good
  next();
}

function checkCodeVersion(req, resp, next) {
  version(function(expectedCodeVersion) {
    var requestedCodeVersion = req.headers['browserid-git-sha'];

    if (requestedCodeVersion !== expectedCodeVersion) {
      logger.warn("Code version mis-match: " + req.url + " expected: " + expectedCodeVersion + " received: " + requestedCodeVersion);

      logger.warn("wsapi_code_mismatch." + req.url);
    }

    next();
  });
}

function checkExpiredSession(req, resp, next) {
  // all requests (both GET and POST) must have a session
  if (req.session === undefined) {
    logger.warn("calls to /wsapi require a cookie to be sent, this user may have cookies disabled");
    return httputils.forbidden(resp, "no cookie");
  }
  if (!req.session.userid) {
    // not yet authenticated, so nothing to expire, avoid the DB fetch
    return next();
  }
  db.lastPasswordReset(req.session.userid, function(err, token) {
    if (err) return databaseDown(resp, err);
    // if token is 0 (or undefined), they haven't changed their password
    // since the server was updated to use lastPasswordResets. Allow the
    // session to pass, otherwise the server upgrade would gratuitously
    // expire innocent sessions.
    if (token && token !== req.session.lastPasswordReset) {
      logger.warn("expired cookie (password changed since issued)");
      req.session.reset();
    }
    next();
  });
}

function langContext(req) {
  return {
    lang: req.lang,
    locale: req.locale,
    gettext: req.gettext,
    ngettext: req.ngettext,
    format: req.format
  };
}

function databaseDown(res, err) {
  // For CEF, this is logged by the caller so params from the http
  // request can be recorded.
  logger.warn('database is down, cannot process request: ' + err);
  httputils.serviceUnavailable(res, "database unavailable");
}

function operationFromURL (path) {
  var purl = url.parse(path);
  return purl.pathname.substr(1); // drop leading slash
}

var APIs;
function allAPIs () {
  if (APIs) return APIs;

  APIs = {};

  fs.readdirSync(path.join(__dirname, 'wsapi')).forEach(function (f) {
    // skip files that don't have a .js suffix or start with a dot
    if (f.length <= 3 || f.substr(-3) !== '.js' || f.substr(0,1) === '.') return;
    var operation = f.substr(0, f.length - 3);

    var api = require(path.join(__dirname, 'wsapi', f));
    APIs[operation] = api;
  });

  return APIs;
}

// common functions exported, for use by different api calls
exports.clearAuthenticatedUser = clearAuthenticatedUser;
exports.isAuthed = isAuthed;
exports.bcryptPassword = bcryptPassword;
exports.authenticateSession = authenticateSession;
exports.forwardWritesTo = undefined;
exports.langContext = langContext;
exports.databaseDown = databaseDown;

// Explicitly forward a request over HTTP to the dbwriter.  This
// is only useful in a process that is not the dbwriter.
exports.requestToDBWriter = function(opts, cb) {
  if (!exports.forwardWritesTo) {
    throw new Error("cannot forward request to dbwriter, I don't know her"+
                    "url");
  }

  if (!opts) opts = {};
  if (!opts.headers) opts.headers = {};
  if (opts.body) {
    opts.headers['Content-Length'] = opts.body.length;
  }
  opts.method = (opts.method || "get").toUpperCase();

  var m = exports.forwardWritesTo.scheme === 'http' ? http : https;
  var req = m.request({
    host: exports.forwardWritesTo.host,
    port: exports.forwardWritesTo.port,
    path: opts.path,
    method: opts.method || "GET",
    headers: opts.headers,
    rejectUnauthorized: true,
    agent: false
  }, function(res) {
    var respBody = "";
    res.on('data', function(chunk) {
      respBody += chunk;
    });
    res.on('end', function() {
      try {
        if (res.statusCode !== 200) throw "non-200 response: " + res.statusCode;
        cb(null, {
          headers: res.headers,
          body: JSON.parse(respBody)
        });
        cb = null;
      } catch(e) {
        if (cb) cb(e);
        cb = null;
      }
    });
  }).on('error', function(e) {
    if (cb) cb(e);
    cb = null;
  });
  if (opts.body) {
    req.write(opts.body);
  }
  req.end();
};

exports.setup = function(options, app) {
  // If externally we're serving content over SSL we can enable things
  // like strict transport security and change the way cookies are set
  const overSSL = (config.get('scheme') === 'https');

  // stash our forward-to url so different wsapi handlers can use it
  exports.forwardWritesTo = options.forward_writes;


  // cookie sessions are only applied to calls to /wsapi
  // as all other resources can be aggressively cached
  // by layers higher up based on cache control headers.
  // the fallout is that all code that interacts with sessions
  // should be under /wsapi
  app.use(WSAPI_PREFIX, function(req, resp, next) {
    // explicitly disallow caching on all /wsapi calls (issue #294)
    resp.setHeader('Cache-Control', 'no-cache, max-age=0');

    const operation = operationFromURL(req.url);

    // count the number of WSAPI operation
    logger.info("wsapi." + operation);

    // check to see if the api is known here, before spending more time with
    // the request.
    if (!wsapis.hasOwnProperty(operation) ||
        wsapis[operation].method.toLowerCase() !== req.method.toLowerCase())
    {
      // if the fake verification api is enabled (for load testing),
      // then let this request fall through
      if (operation !== 'fake_verification' || !process.env.BROWSERID_FAKE_VERIFICATION)
        return httputils.badRequest(resp, "no such api");
    }

    next();
  });

  app.use(WSAPI_PREFIX, express.cookieParser());
  app.use(WSAPI_PREFIX, express.bodyParser());

  var cookieOpts = {
    path: '/wsapi',
    httpOnly: true,
    maxAge: config.get('authentication_duration_ms')
  };

  if (overSSL) cookieOpts.secureProxy = true;

  app.use(WSAPI_PREFIX, sessions({
    secret: COOKIE_SECRET,
    requestKey: 'session',
    cookieName: COOKIE_KEY,
    duration: config.get('authentication_duration_ms'),
    cookie: cookieOpts
  }));
  app.use(WSAPI_PREFIX, checkExpiredSession);
  app.use(WSAPI_PREFIX, checkCSRF);

  // load all of the APIs supported by this process
  var wsapis = { };

  function describeOperation(name, op) {
    var str = "  " + name + " (";
    str += op.method.toUpperCase() + " - ";
    str += (op.authed ? "" : "not ") + "authed";
    if (op.args) {
      var keys = Array.isArray(op.args) ? op.args : Object.keys(op.args);
      str += " - " + keys.join(", ");
    }
    if (op.internal) str += ' - internal';
    str += ")";
    logger.debug(str);
  }

  var all = allAPIs();
  Object.keys(all).forEach(function (operation) {
    try {
      var api = all[operation];

      // - don't register read apis if we are configured as a writer,
      // with the exception of ping which tests database connection health.
      // - don't register write apis if we are not configured as a writer
      if ((options.only_write_apis && !api.writes_db && operation !== 'ping') ||
          (!options.only_write_apis && api.writes_db))
            return;

      wsapis[operation] = api;

      // set up the argument validator
      if (api.args) {
        wsapis[operation].validate = validate(api.args);
      } else {
        wsapis[operation].validate = function(req,res,next) { next(); };
      }

    } catch(e) {
      var msg = "error registering " + operation + " api: " + e;
      logger.error(msg);
      throw msg;
    }
  });

  // debug output - all supported apis
  logger.debug("WSAPIs:");
  Object.keys(wsapis).forEach(function(api) {
    describeOperation(api, wsapis[api]);
  });

  app.use(WSAPI_PREFIX, function wsapiMiddleware(req, resp, next) {
    const operation = operationFromURL(req.url);

    // the fake_verification wsapi is implemented elsewhere.
    if (operation === 'fake_verification') return next();

    // at this point, we *know* 'operation' is valid API, give checks performed
    // above

    // does the request require authentication?
    if (wsapis[operation].authed && !isAuthed(req, wsapis[operation].authed)) {
      return httputils.badRequest(resp, "requires authentication");
    }

    // validate the arguments of the request
    wsapis[operation].validate(req, resp, function() {
      if (wsapis[operation].i18n) {
        abide(req, resp, function () {
          wsapis[operation].process(req, resp);
        });
      } else {
        wsapis[operation].process(req, resp);
      }
    });
  });
};


exports.routeSetup = function (app, options) {
  var wsapis = allAPIs();

  app.use(WSAPI_PREFIX, checkCodeVersion);

  app.use(WSAPI_PREFIX, function(req, resp, next) {
    var operation = operationFromURL(req.url);
    
    // not a WSAPI request
    if (!operation) return next();

    var api = wsapis[operation];

    // check to see if the api is known here, before spending more time with
    // the request.
    if (!wsapis.hasOwnProperty(operation) ||
        api.method.toLowerCase() !== req.method.toLowerCase()) {
      // if the fake verification api is enabled (for load testing),
      // then let this request fall through
      if (operation !== 'fake_verification' || !process.env.BROWSERID_FAKE_VERIFICATION)
        return httputils.badRequest(resp, "no such api");
    }

    if (api.internal) {
        return httputils.notFound(resp);
    }

    var destination_path = WSAPI_PREFIX + req.url;
    var destination_url = (api.writes_db ? 
        options.write_url : options.read_url) + destination_path;

    var cb = function() {
      forward(
        destination_url, req, resp,
        function(err) {
          if (err) {
            logger.error("error forwarding request:", err);
          }
        });
    };
    return express.bodyParser()(req, resp, cb);

  });
};
