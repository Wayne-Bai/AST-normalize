var io = require('socket.io-client')
  , Message = require('./message')
  , Principal = require('./principal')
  , request = require('request');

/**
 * A Session represents an authenticated session and subscription connection between a principal and a service.
 *
 * @class Session
 * @namespace nitrogen
 * @param {Object} service The service this session is associated with.
 * @param {Object} principal The principal this session is associated with.
 * @param {Object} accessToken The accessToken to use for authenticating requests with this session.
 * @param {Object} socket The subscription socket to use for realtime updates.
 */

function Session(service, principal, accessToken) {
    var self = this;

    this.service = service;
    this.principal = principal;
    this.accessToken = accessToken;

    this.subscriptionCount = 0;
    this.sessionId = Math.floor(Math.random()*100000000);

    this.heartbeatTimeout = false;
    this.heartbeatReceived = true;
    this.consecutiveHeartbeatFailures = 0;

    this.subscriptions = {};
    this.failureCallback = function() {};

    Session.prototype.log = {};
    Session.prototype.log.debug = function(message) { Session.log(self, "debug", message); };
    Session.prototype.log.info = function(message)  { Session.log(self, "info", message);  };
    Session.prototype.log.warn = function(message)  { Session.log(self, "warn", message);  };
    Session.prototype.log.error = function(message) { Session.log(self, "error", message); };

    this.log.debug('session: created.');
}

Session.HEARTBEAT_DEFAULT_INTERVAL = 5 * 60 * 1000; // ms
Session.MAX_SUBSCRIPTION_RESTARTS = 3;
Session.HEARTBEAT_TIMEOUT = 15 * 1000; // ms

Session.queryStringFromObject = function(obj) {
    var str = [];

    for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));

    return str.join("&");
};


Session.startSession = function(service, principal, accessToken) {
    if (!Session.sessions)
        Session.sessions = {};

    if (!Session.sessions[principal.id]) {
        Session.sessions[principal.id] = new Session(service, principal, accessToken);
    }

    return Session.sessions[principal.id];
};

Session.stopSession = function(session) {
    delete Session.sessions[session.principal.id];
};

/**
 * Stop the session with the service.
 *
 * @method stop
 * @private
 **/

Session.prototype.stop = function() {
    Session.stopSession(this);
    this.failureCallback = null;

    var self = this;
    for (var key in this.subscriptions) {
        this.disconnectSubscription(this.subscriptions[key].id);
    }

    if (this.socket)
        this.socket.disconnect();

    this.socket = null;

    if (this.heartbeat)
        this.heartbeat.stop();

    this.heartbeat = null;
};

Session.prototype.beforeRequest = function(options) {
    if (!options.headers) options.headers = {};
    options.headers.Authorization = "Bearer " + this.accessToken.token;

    var prefix = "?";
    if (options.query) {
        var queryString = JSON.stringify(options.query);
        options.url += prefix + "q=" + encodeURIComponent(queryString);
        delete options.query;

        prefix = "&";
    }

    if (options.queryOptions) {
        var optionsString = JSON.stringify(options.queryOptions);
        options.url += prefix + "options=" + encodeURIComponent(optionsString);
        delete options.queryOptions;
    }
};

Session.prototype.afterRequest = function(err, resp, body, callback) {
    if (resp && resp.statusCode !== 200) {
        if (body && body.error)
            err = body.error;
        else
            err = resp.statusCode;
    }

    if (resp && resp.statusCode === 401) this.signalFailure();

    // If we get an access token update, replace the current access token and continue.
    if (resp && resp.headers && resp.headers['x-n2-set-access-token']) {
        this.accessToken = JSON.parse(resp.headers['x-n2-set-access-token']);
    }

    callback(err, resp, body);
};

Session.prototype.makeRequest = function(options, requestFunc, callback) {
    var self = this;

    this.beforeRequest(options);

    return requestFunc(options, function(err, resp, body) {
        self.afterRequest(err, resp, body, callback);
    });
};

Session.prototype.get = function(options, callback) {
    return this.makeRequest(options, request.get, callback);
};

Session.prototype.post = function(options, callback) {
    return this.makeRequest(options, request.post, callback);
};

Session.prototype.put = function(options, callback) {
    return this.makeRequest(options, request.put, callback);
};

Session.prototype.remove = function(options, callback) {
    return this.makeRequest(options, request.del, callback);
};

/**
 * Clear all of the credentials for a particular principal.
 *
 * @method clearCredentials
 * @private
 * @param {Object} principal The principal to clear credentials for.
 **/

Session.prototype.clearCredentials = function() {
    this.service.clearCredentials(this.principal);
};

/**
 * Connect subscription socket for principal with this accessToken to the service.
 *
 * @method connectSocket
 * @private
 **/

Session.prototype.connectSocket = function() {
    var self = this;
    if (!this.principal || !this.principal.id || !this.accessToken) throw new Error('need both principal and accessToken to connectSocket');

    // we can only share a socket on a per principal basis because otherwise principals can listen in
    // on other principals' events.
    if (!this.socket) {
        this.socket = io.connect(this.service.config.endpoints.subscriptions, {
            query: Session.queryStringFromObject({ auth: this.accessToken.token }),
            'force new connection': true
        });

        this.setupSocketEvents();
        self.startHeartbeat();
    }

    return this.socket;
};

Session.prototype.setupSocketEvents = function() {
    var self = this;

    //this.socket.on('connecting', function() { self.log.debug('session: socket.io connecting'); });

    this.socket.on('connect', function() {
        self.log.debug('session: socket.io connected');
    });

    this.socket.on('disconnect', function() {
        self.log.debug('session: socket.io connection disconnected');
    });

    // this.socket.on('reconnecting', function() { self.log.info('session: socket.io connection reconnecting'); });

    this.socket.on('reconnect', function() {
        if (self.socket) {
            self.log.warn('session: socket.io connection reconnected.  restarting subscriptions: ' + JSON.stringify(self.subscriptions));
            self.restartSubscriptions();
        }
    });
};

/**
 * Disconnect the current subscription connection with the service.
 *
 * @method disconnectSubscription
 * @private
 **/

Session.prototype.disconnectSubscription = function(subscriptionId) {
    if (!this.subscriptions[subscriptionId]) return;

    this.socket.emit('stop', this.subscriptions[subscriptionId]);
    delete this.subscriptions[subscriptionId];
};

/**
 * Connect a subscription with the service.
 *
 * @method disconnectSubscription
 * @private
 **/

Session.prototype.connectSubscription = function(options) {
    this.subscriptions[options.id] = options;
    this.socket.emit('start', options);
};

/**
 * Restart all subscriptions with the service.  Used after a connection disruption.
 *
 * @method restartSubscriptions
 * @private
 **/

Session.prototype.restartSubscriptions = function() {
    for (var key in this.subscriptions) {
        var subscription = this.subscriptions[key];
        this.log.info('restarting subscription: ' + key + ': ' + JSON.stringify(subscription));

        if (this.socket) this.socket.emit('stop', this.subscriptions[subscription.id]);
        this.connectSubscription(this.subscriptions[key]);
    }
};

/**
 * Impersonate the principal with the authorization context of this session.  Used by the Nitrogen service to impersonate principals for agent setup.
 *
 * @method impersonate
 * @private
 * @param {Object} principal The principal to impersonate with this session.
 * @param {Object} callback Callback for the impersonation.
 *   @param {Object} callback.err If the impersonation failed, this will contain the error.
 *   @param {Object} callback.session The session for the impersonated principal with this service.
 *   @param {Object} callback.principal The impersonated principal.
 **/

Session.prototype.impersonate = function(principal, callback) {
    this.service.impersonate(this, principal, callback);
};

// DEPRECIATED
Session.prototype.onAuthFailure = function(callback) {
    this.failureCallback = callback;
};

/**
 * Passed callback function will be called on session failure.
 *
 * @method onFailure
 * @param {Object} principal The principal to impersonate with this session.
 * @param {Function} callback Callback function with signature f(err).
 **/

Session.prototype.onFailure = function(callback) {
    this.failureCallback = callback;
};

Session.prototype.signalFailure = function() {
    var failureCallback = this.failureCallback;

    this.stop();

    if (failureCallback) failureCallback();
};

/**
 * Core subscription event method. Primarily used to subscribe for changes to principals and new messages.
 *
 * @method on
 * @param {Object} options Options for the filter of the messages this subscription should receive: 'type': The type this subscription should receive.  Only 'message' is currently supported. 'filter': The filter to apply to the objects returned from this subscription.  For example { from: '51f2735fda5fcca439000001' } will restrict messages received to only those from this particular principal id.
 * @param {Function} callback Callback function with signature f(objectReceived).
 **/

Session.prototype.on = function(options, callback) {
    if (!options) return callback("Options hash required for subscription");
    if (['message', 'principal'].indexOf(options.type) === -1) return callback("Unknown subscription 'type'");

    // if there is an existing socket connection already, this will be a NOP.
    this.connectSocket();

    this.subscriptionCount += 1;
    options.id = this.principal.id + "_" + this.sessionId + "_" + this.subscriptionCount;

    this.socket.on(options.id, function(obj) {
        if (options.type === 'message')
            return callback(new Message(obj));

        if (options.type === 'principal')
            return callback(new Principal(obj));
    });

    this.connectSubscription(options);
    return options.id;
};

/**
 * Syntax sugar to setup a message subscription.
 *
 * @method onMessage
 * @param {Object} filter The filter to apply to the objects returned from this subscription.  For example { from: '51f2735fda5fcca439000001' } will restrict messages received to only those from this particular principal id.
 * @param {Function} callback Callback function with signature f(messageReceived).
 **/

Session.prototype.onMessage = function(filter, callback) {
    if (typeof filter === 'function') {
        callback = filter;
    }

    var options = {};
    options.filter = filter || {};
    options.type = 'message';
    return this.on(options, callback);
};

/**
 * Syntax sugar to setup a principal subscription.
 *
 * @method onMessage
 * @param {Object} filter The filter to apply to the objects returned from this subscription.  For example { from: '51f2735fda5fcca439000001' } will restrict messages received to only those from this particular principal id.
 * @param {Function} callback Callback function with signature f(messageReceived).
 **/

Session.prototype.onPrincipal = function(filter, callback) {
    if (typeof filter === 'function') {
        callback = filter;
    }

    var options = {};
    options.filter = filter || {};
    options.type = 'principal';
    return this.on(options, callback);
};

Session.log = function(session, severity, message) {
    if (session.service.config.log_levels && session.service.config.log_levels.indexOf(severity) === -1) return;

    var logLifetime = session.service.config.log_lifetime || 24 * 60 * 60000;

    var logMessage = new Message({
        type: 'log',
        ts: new Date(),
        from: session.principal.id,
        body: {
            severity: severity,
            message: message
        },
        index_until: new Date(new Date().getTime() + logLifetime)
    });

    var principalNameOrId = (session.principal.name || session.principal.id);

    var dateFormat = [logMessage.ts.getMonth()+1, logMessage.ts.getDate(), logMessage.ts.getFullYear()];
    var date = dateFormat.join('/');

    console.log(date + " " + logMessage.ts.toLocaleTimeString() + ": " + principalNameOrId + ': ' + severity + ": " + message);

    logMessage.send(session);
};

Session.prototype.heartbeatReceivedCheck = function() {
    if (!this.heartbeatReceived) {
        this.consecutiveHeartbeatFailures += 1;
        this.log.error('heartbeat: not received within timeout: restarting subscriptions (' + this.consecutiveHeartbeatFailures + ' consecutive).');
        if (this.session && this.consecutiveHeartbeatFailures < Heartbeat.MAX_SUBSCRIPTION_RESTARTS) {
            this.stopHeartbeat();
            this.restartSubscriptions();
            this.startHeartbeatInterval();
        } else {
            // too many consecutive heartbeat failures

            this.log.error('heartbeat: too many consecutive failures. signalling session failure.');
            this.signalFailure();
        }
    }
};

Session.prototype.startHeartbeat = function() {
    if (this.heartbeatTimeout) return;
    var self = this;

    this.onMessage({ type: 'heartbeat' }, function(message) {
        // the goal of this is to test realtime connectivity so we don't care whose heartbeat this is.

        self.log.debug('received heartbeat');
        self.heartbeatReceived = true;
        self.consecutiveHeartbeatFailures = 0;
    });

    this.startHeartbeatInterval();
};

Session.prototype.startHeartbeatInterval = function() {
    var self = this;

    this.stopHeartbeat();

    this.log.debug('starting heartbeat interval');

    this.heartbeatTimeout = setInterval(function() {
        self.sendHeartbeat();
    }, Session.HEARTBEAT_DEFAULT_INTERVAL);
};

Session.prototype.sendHeartbeat = function(callback) {
    var self = this;

    this.principal.status(function(err, status) {
        if (err) {
            status = status || {};
            status.error = err;
        }

        var heartbeatIndexUntil = self.service.config.heartbeat_lifetime || 30 * 60 * 1000;

        var message = new Message({
            type: 'heartbeat',
            public: false,
            body: {
                error: !!err,
                status: status
            },
            index_until: new Date(new Date().getTime() + heartbeatIndexUntil)
        });

        setTimeout(function() { self.heartbeatReceivedCheck() }, Session.HEARTBEAT_TIMEOUT);
        self.heartbeatReceived = false;

        self.log.debug('sending heartbeat');
        message.send(self, function(err, message) {
            if (err) {
                self.log.error("failed to send heartbeat: " + err);

                // something is far more wrong than the subscription.
                self.heartbeatReceived = true;
                if (self) self.signalFailure();
            }

            if (callback) return callback(err);
        });
    });
};

Session.prototype.stopHeartbeat = function() {
    if (!this.heartbeatTimeout) return;

    this.log.debug('clearing heartbeat interval');

    clearInterval(this.heartbeatTimeout);
    this.heartbeatTimeout = false;
};

module.exports = Session;
