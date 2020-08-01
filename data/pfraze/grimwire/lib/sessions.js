var winston = require('winston');
var crypto = require('crypto');

var config = require('./config');
var db = require('./db');
var streams = require('./streams');

var sessions = { entries: {} };
module.exports = sessions;

// Sessions API
sessions.getSession = function(sessionId, cb) {
	cb(null, sessions.entries[sessionId]);
};
function allocateSessionId(cb) {
	crypto.randomBytes(64, function(err, buf) {
		if (err) { return cb(err); }
		var sessionId = buf.toString('base64');
		if (sessionId in sessions.entries) {
			// try, try again
			winston.info('Generated Session ID collision for '+sessionId+' - trying again.');
			allocateSessionId(cb);
		} else {
			cb(null, sessionId);
		}
	});
}
function allocateGuestUserId(userId) {
	var guestUserId;
	do {
		guestUserId = userId + '-guest'+(Math.round(Math.random()*10000));
	} while (guestUserId in streams.online_users);
	return guestUserId;
}
sessions.createSession = function(userId, app, cb) {
	if (!app) {
		app = null;
	}

	// Get the user
	var user = db.users[userId];
	if (!user) {
		return cb({ notfound: true });
	}

	// Find an available session id
	allocateSessionId(function(err, sessionId) {
		if (err) { return cb(err); }
		// Store
		sessions.entries[sessionId] = {
			id: sessionId,
			user_id: userId,
			guestof: false,
			app: app,
			avatar: user.avatar,
			expires_at: (Date.now() + 1000*60*60*24*7)
		};
		cb(null, sessionId);
	});

};
sessions.createGuestSession = function(hostUserId, app, cb) {
	if (!app) {
		return cb({ appRequired: true });
	}

	// Get the host user
	var hostUser = db.users[hostUserId];
	if (!hostUser) {
		return cb({ notfound: true });
	}

	// Find an available session id
	allocateSessionId(function(err, sessionId) {
		if (err) { return cb(err); }
		// Find an available guest name
		var guestUserId = allocateGuestUserId(hostUserId);
		// Store
		sessions.entries[sessionId] = {
			id: sessionId,
			user_id: guestUserId,
			guestof: hostUserId,
			app: app,
			avatar: 'user_silhouette.png',
			expires_at: (Date.now() + 1000*60*60*24*7)
		};
		cb(null, sessionId, guestUserId);
	});
};
sessions.updateSession = function(sessId, data, cb) {
	if (!(sessId in sessions.entries)) {
		return cb({ notfound: true });
	}
	var session = sessions.entries[sessId];
	if (data.avatar) { session.avatar = data.avatar; }
	cb(null);
};
sessions.deleteUserSessions = function(userId, cb) {
	for (var sid in sessions.entries) {
		if (sessions.entries[sid].userId == userId) {
			delete sessions.entries[sid];
		}
	}
	cb();
};

// Clean out old sessions once an hour
setInterval(function() {
	winston.info('Cleaning expired sessions...');
	var deletions=0, now=Date.now();
	for (var sid in sessions.entries) {
		if (sessions.entries[sid].expires_at < now) {
			delete sessions.entries[sid];
			deletions++;
		}
	}
	winston.info('...Expired sessions cleaned.', { deletions: deletions });
}, 1000*60*60);

