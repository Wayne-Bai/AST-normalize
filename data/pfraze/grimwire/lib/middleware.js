// Common Middleware
// =================
var html = require('./html.js');
var config = require('./config');
var db = require('./db');
var sessions = require('./sessions');

// Authenticate either the session cookie or the app access token
// - adds response.locals.session on success
module.exports.authenticate = function(req, res, next) {
	// Helper to send 401
	var authFail = function() {
		if (req.accepts('html')) {
			res.send(401, (config.allow_signup) ? html.login_or_signup : html.login);
		} else {
			res.send(401);
		}
	};

	// Get session id from cookie or auth header (the latter is for x-domain)
	var sessionId = req.session;
	if (typeof sessionId != 'string' && req.headers.authorization && req.headers.authorization.indexOf('Bearer') === 0) {
		// Skip 'Bearer '
		var token = req.headers.authorization.slice(7);
		// Token format is 'username:session_id', extract the latter
		if (token) {
			sessionId = token.split(':')[1];
		}
	}
	if (!sessionId) {
		return authFail();
	}

	// Fetch from DB
	sessions.getSession(sessionId, function(err, session) {
		if (err) {
			res.send(500);
			console.error('Failed to get session info from DB', err);
			return;
		}

		// Session exists?
		if (!session) {
			return authFail();
		}

		// Session expired?
		if (session.expires_at < Date.now()) {
			return authFail();
		}

		// Continue
		res.locals.session = session;
		next();
	});
};

module.exports.setCorsHeaders = function(request, response, next) {
	response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*');
	response.setHeader('Access-Control-Allow-Credentials', true);
	response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, HEAD, GET, PUT, PATCH, POST, DELETE, NOTIFY, SUBSCRIBE');
	response.setHeader('Access-Control-Allow-Headers', request.headers['access-control-request-headers'] || 'Accept, Authorization, Connection, Cookie, Content-Type, Content-Length, Host');
	response.setHeader('Access-Control-Expose-Headers', request.headers['access-control-request-headers'] || 'Content-Type, Content-Length, Date, ETag, Last-Modified, Link, Location');
	response.setHeader('Access-Control-Max-Age', 60*60*24); // in seconds
	next();
};