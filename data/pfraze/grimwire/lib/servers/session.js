var express = require('express');
var middleware = require('../middleware.js');
var util = require('../util.js');
var html = require('../html.js');
var bcrypt = require('bcrypt');
var winston = require('winston');

// Session
// =======
module.exports = function() {
	var config = require('../config');
	var server = express();
	var db = require('../db');
	var sessions = require('../sessions');

	// Routes
	// ======

	// Linking
	// -------
	server.all('/', function (req, res, next) {
		// Set links
		res.setHeader('Link', [
			'</>; rel="up via service gwr.io/grimwire"; title="Grimwire Relay"',
			'</session>; rel="self service gwr.io/session"; type="user"',
			'</session/{app}>; rel="service gwr.io/session"; type="app"',
			'</session/{app}?guestof={hostuser}>; rel="service gwr.io/session"; type="guest"'
		].join(', '));
		next();
	});
	server.all('/:app', function (req, res, next) {
		// Set links
		var app = req.params.app;
		var isguest = !!req.query.guestof;
		res.setHeader('Link', [
			'</>; rel="up via service gwr.io/grimwire"; title="Grimwire Relay"',
			'</session>; rel="service gwr.io/session"; type="user"',
			'</session/'+app+'>; rel="' + ((!isguest) ? 'self ' : '' ) + 'service gwr.io/session"; type="app"',
			'</session/'+app+'?guestof={hostuser}>; rel="' + ((isguest) ? 'self ' : '') + 'service gwr.io/session"; type="guest"'
		].join(', '));
		next();
	});

	// Get session info
	// ----------------
	server.head('/', function(req, res) { return res.send(204); });
	server.get('/', getSession, function(req, res, next) {
		// Stop now if no session exists
		if (!res.locals.session) {
			return res.send(401);
		}

		// Content negotiation
		if (!req.accepts('json')) {
			return res.send(406);
		}
		// Send response
		res.json({
			user_id: res.locals.session.user_id,
			avatar: res.locals.session.avatar
		});
	});

	// Start a new session
	// -------------------
	server.post('/',
		function (req, res, next) {
			// Validate inputs
			var errors = validateSessionCreate(req.body);
			if (errors) {
				res.writeHead(422, 'bad entity', {'Content-Type': 'application/json'});
				res.end(JSON.stringify(errors));
				return;
			}

			// Fetch the user
			db.getUser(req.body.id, function(err, user) {
				if (err || !user) {
					res.writeHead(422, 'bad entity', {'Content-Type': 'application/json'});
					res.end(JSON.stringify({errors:{_form:'Invalid username or password.'}}));
					return;
				}
				res.locals.user = user;
				next();
			});
		},
		function (req, res, next) {
			// Check password
			checkPassword(req.body.password, res.locals.user.password, function(err) {
				if (err) {
					res.writeHead(422, 'bad entity', {'Content-Type': 'application/json'});
					res.end(JSON.stringify({errors:{_form:'Invalid username or password.'}}));
					return;
				}
				next();
			});
		},
		function (req, res, next) {
			// Create the session
			sessions.createSession(req.body.id, null, function(err, sessionId) {
				if (err) {
					winston.error('Failed to create session info', { error: err, inputs: [req.body.id], request: util.formatReqForLog(req) });
					res.send(500);
					return;
				}

				// Set new session cookie
				req.session = sessionId;
				res.json({ token: req.body.id + ':' + sessionId });
			});
		}
	);

	// End session
	// -----------
	server.delete('/', getSession, function(req, res) {
		// Stop now if no session exists
		if (!res.locals.session) {
			return res.send(204);
		}
		// Clear session records
		sessions.deleteUserSessions(res.locals.session.user_id, function(err) {
			if (err) {
				winston.error('Failed to delete sessions', { error: err, inputs: [res.locals.session.user_id], request: util.formatReqForLog(req) });
				return res.send(500);
			}

			// Remove the session cookie
			req.session = null;
			res.send(204);
		});
	});

	// Get app access-token interface
	// ------------------------------
	server.head('/:app', function(req, res) { return res.send(204); });
	server.all('/:app', function(req, res, next) {
		if (req.query.guestof) {
			// Make sure the target user exists
			db.getUser(req.query.guestof, function(err, user) {
				if (user) { return next(); }
				// User doesnt exist, let the requester know
				if (req.method == 'GET' && req.accepts('html')) {
					var fail_html = html.guest_auth_hostdne;
					fail_html = fail_html.replace(/\{HOST_USER\}/g, req.query.guestof);
					res.send(fail_html);
				} else {
					res.send(400);
				}
			});
		} else {
			middleware.authenticate(req, res, next);
		}
	});
	server.all('/:app', function(req, res, next) {
		if (req.query.guestof) { return next(); } // Guests dont need active sessions
		// Don't provide for 3rd party apps (must access directly)
		if (res.locals.session.app) {
			return res.send(403);
		}
		next();
	});
	server.get('/:app', function(req, res) {
		// Content negotiation
		if (!req.accepts('html')) {
			return res.send(406);
		}

		// Generate html
		var auth_html;
		if (req.query.guestof) {
			auth_html = html.guest_auth;
			auth_html = auth_html.replace(/\{APP_DOMAIN\}/g, req.params.app);
			auth_html = auth_html.replace(/\{HOST_USER\}/g, req.query.guestof);
		} else {
			auth_html = html.app_auth;
			auth_html = auth_html.replace(/\{APP_DOMAIN\}/g, req.params.app);
			auth_html = auth_html.replace(/\{SESSION_USER\}/g, res.locals.session.user_id);
		}

		// Serve
		res.send(auth_html);
	});

	// Create access-token
	// -------------------
	server.post('/:app', function(req, res) {
		if (!req.query.guestof) {
			// Generate access token
			sessions.createSession(res.locals.session.user_id, req.params.app, function(err, sessionId) {
				if (err) {
					winston.error('Failed to create app session', { error: err, inputs: [res.locals.session.user_id, req.params.app], request: util.formatReqForLog(req) });
					return res.send(500);
				}

				// Respond
				res.send({ token: res.locals.session.user_id + ':' + sessionId });
			});
		} else {
			// Generate access token
			sessions.createGuestSession(req.query.guestof, req.params.app, function(err, sessionId, guestId) {
				if (err) {
					if (err.appRequired) { return res.send(403); }
					if (err.notfound) { return res.send(404); }
					winston.error('Failed to create app session', { error: err, inputs: [req.query.guestof, req.params.app], request: util.formatReqForLog(req) });
					return res.send(500);
				}

				// Respond
				res.send({ token: guestId + ':' + sessionId });
			});

		}
	});


	// Business Logic
	// ==============
	function validateSessionCreate(body) {
		if (!body) {
			return { errors: { _form: 'Request body is required.' } };
		}
		var errors = {};
		if (!body.id) { errors.id = 'Required.'; }
		else if (typeof body.id != 'string') { errors.id = 'Must be a string.'; }
		if (!body.password) { errors.password = 'Required.'; }
		else if (typeof body.password != 'string') { errors.password = 'Must be a string.'; }
		if (Object.keys(errors).length > 0) {
			return { errors: errors };
		}
		return false;
	}
	function checkPassword(plaintext, encrypted, cb) {
		bcrypt.compare(plaintext, encrypted, function(err, success) {
			cb(!success);
		});
	}


	// Middleware
	// ==========
	function getSession(req, res, next) {
		// Load session
		sessions.getSession(req.session, function(err, session) {
			if (err) {
				winston.error('Failed to get session info', { error: err, inputs: [req.session], request: util.formatReqForLog(req) });
				res.send(500);
				return;
			}
			res.locals.session = session;
			next();
		});
	}

	return server;
};