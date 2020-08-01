var crypto = require('crypto')
  , request = require('request');

/**
 * @class Principal
 * Test
**/

function Principal(json) {
    this.updateAttributes(json);

    if (!this.nickname) this.nickname = 'default';
}

/**
 * A Principal in Nitrogen represents entities with authentication privileges in Nitrogen.  Applications, devices,
 * and services are all examples of principals.
 **/

Principal.DEVICE_SECRET_BYTES = 128;

/**
 * @method authenticate
 * @async
 *
 * Authenticate this principal with the service.  The mechanism used to authenticate depends on
 * the type of principal. For users, an email and password is used.  For all other principals,
 * public key auth will be used.
 *
 * @param {Object} config The config for the Nitrogen service to auth against.
 * @param {Function} callback Callback function of the form f(err, principal, accessToken).
 **/

Principal.prototype.authenticate = function(config, callback) {
    var self = this;

    var authBody = { type: this.type, id: this.id };
    var headers = {};

    if (this.is('user')) {
        authBody.email = this.email;
        authBody.password = this.password;
    } else {
        authBody.secret = this.secret;
    }

    var path;
    if (this.is('user')) {
        path = "/user/auth";
    } else {
        path = "/secret/auth";
    }

    request.post({ url: config.endpoints.principals + path, headers: headers, json: authBody }, function(err, resp, body) {
        if (err) return callback(err);
        if (resp.statusCode !== 200) {
            return callback(JSON.stringify(body.error) || resp.statusCode);
        }

        self.updateAttributes(body.principal);

        return callback(null, self, body.accessToken);
    });
};

/**
 * Fetch an accessToken for the passed principal.
 *
 * @method accessTokenFor
 * @async
 * @param {Object} session The session with a Nitrogen service to make this request under.
 * @param {Object} options Options for the access token: 'expires': the date this access token should expire.
 * @param {Function} callback Callback function of the form f(err, messages).
 **/

Principal.accessTokenFor = function(session, principalId, options, callback) {
    if (!session) return callback('no session passed to Principal.accessTokenFor');
    if (!callback || typeof(callback) !== 'function') return callback('no callback passed to to Principal.accessTokenFor.');

    var accessTokenUrl = session.service.config.endpoints.principals + "/accesstoken";

    options.principal_id = principalId;

    session.post({
        url: accessTokenUrl,
        json: options
    }, function(err, resp, body) {
        if (err) return callback(err);

        callback(null, body.accessToken);
    });
};

/**
 * Create a new principal with the service.  For user principal types, this principal must have a email, password, and
 * name.
 *
 * @method create
 * @async
 * @param {Object} config The config data for the Nitrogen service.
 * @param {Function} callback Callback function of the form f(err, principal, accessToken).
 **/

Principal.prototype.create = function(config, callback) {
    var self = this;

    crypto.randomBytes(Principal.DEVICE_SECRET_BYTES, function(err, secretBuf) {
        if (err) return callback(err);

        var secretBase64 = secretBuf.toString('base64');

        if (self.is('user') && (!self.email || !self.password || !self.name)) {
            return callback(new Error("Please provide your full name, email, and password to create an account."));
        } else if (!self.is('user')) {
            if (!self.api_key && config.api_key) self.api_key = config.api_key;
            if (!self.api_key) return callback(new Error('Parameter api_key required for principal.create'));

            self.secret = secretBase64;
        }

        var principalObject = JSON.parse(JSON.stringify(self));

        request.post({
            url: config.endpoints.principals,
            json: principalObject
        }, function(err, resp, body) {
            if (err) return callback(err);
            if (resp.statusCode !== 200) return callback(body.error || resp.statusCode);

            // reinject the secret
            body.principal.secret = secretBase64;

            self.updateAttributes(body.principal);

            return callback(null, self, body.accessToken);
        });
    });
};

/**
 * Find principals filtered by the passed query and limited to and sorted by the passed options.
 *
 * @method find
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Object} query A query filter for the principals defined using MongoDB's query format.
 * @param {Object} options Options for the query:  'limit': maximum number of results to be returned. 'sort': The field that the results should be sorted on, 'dir': The direction that the results  should be sorted. 'skip': The number of results that should be skipped before pulling results.
 * @param {Function} callback Callback function of the form f(err, principals).
 **/

Principal.find = function(session, query, options, callback) {
    if (!session) return callback(new Error('Principal.findById requires active session.'));

    var principalsUrl = session.service.config.endpoints.principals;
    session.get({
        url: principalsUrl,
        query: query,
        queryOptions: options,
        json: true
    }, function(err, resp, body) {
        if (err) return callback(err);

        var principals = body.principals.map(function(principal) {
            return new Principal(principal);
        });

        callback(null, principals);
    });
};

/**
 * Find a principal by id.
 *
 * @method findById
 * @param {Object} session An open session with a Nitrogen service.
 * @param {String} principalId The principal id to search for.
 * @param {Function} callback Callback function of the form f(err, principal, accessToken).
 **/

Principal.findById = function(session, principalId, callback) {
    if (!session) return callback(new Error('Principal.findById requires active session.'));

    var principalsUrl = session.service.config.endpoints.principals + "/" + principalId;
    session.get({ url: principalsUrl, json: true }, function(err, resp, body) {
        if (err) return callback(err);

        callback(null, new Principal(body.principal));
    });
};

/**
 * Impersonate a principal using another principal's session.  This is used by the service to
 * impersonate a particular principal for application execution.
 *
 * @method impersonate
 * @param {Object} session An open session with a Nitrogen service.
 * @param {String} principalId The principal id to impersonate.
 * @param {Function} callback Callback function of the form f(err, principal, accessToken).
 **/

Principal.impersonate = function(session, principalId, callback) {
    var self = this;
    var impersonateUrl = session.service.config.endpoints.principals + "/impersonate";
    session.post({ url: impersonateUrl, json: { id: principalId } }, function(err, resp, body) {
        if (err) return callback(err);
        if (resp.statusCode != 200) return callback(body.error || resp.statusCode);

        var receivedPrincipal = new Principal(body.principal);

        // preserve the nickname for storage
        receivedPrincipal.nickname = self.nickname;

        return callback(null, receivedPrincipal, body.accessToken);
    });
};

/**
 * Delete this principal from the service.
 *
 * @method remove
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err).
 **/

Principal.prototype.remove = function(session, callback) {
    var self = this;

    session.remove({ url: session.service.config.endpoints.principals + "/" + this.id }, function(err) {
        if (err) return callback(err);

        session.service.clearCredentials(self);

        return callback();
    });
};

/**
 * Resume a session using a stored accessToken (attached to this principal).
 *
 * @method resume
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err, principal, accessToken).
 **/

Principal.prototype.resume = function(config, callback) {
    // Just create session, handle failure on first usage if accessToken is invalid.

    return callback(null, this, this.accessToken);
};

/**
 * Save this principal to the service.
 *
 * @method save
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err, principal).
 **/

Principal.prototype.save = function(session, callback) {
    if (!this.id) return callback("Principal must have id to be saved.");
    var self = this;

    Principal.update(session, this.id, this, function(err, resp, body) {
        if (err) return callback(err);
        if (resp.statusCode != 200) return callback(resp.statusCode, null);

        self.updateAttributes(body.principal);

        if (callback) callback(null, self);
    });
};

/**
 * Report the status of this principal.  Principal subclasses should override this method if there
 * is meaningful status that they can provide.  This status is included in the principal's heartbeat
 * to the Nitrogen service.
 *
 * By default this implementation simply makes a no status callback.
 *
 * @method status
 * @param {Function} callback Callback function of the form f(err, status).
 **/

Principal.prototype.status = function(callback) {
    // nop by default, principal subclasses should override if there is a meaningful status they can provide.
    callback(null, {});
};

Principal.prototype.toStoreId = function() {
    if (!this.nickname) console.log("WARNING: nickname is not defined for device.");

    return "principal." + this.nickname;
};

Principal.prototype.toStoreObject = function() {
    return {
        id: this.id,
        api_key: this.api_key,
        email: this.email,
        type: this.type,
        public_key: this.public_key,
        private_key: this.private_key,
        secret: this.secret
    };
};

/**
 * Performs a partial update of a principal.
 *
 * @method update
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Object} id The id of the principal to update.
 * @param {Object} updates The update to apply to this principal.
 * @param {Function} callback Callback function of the form f(err, resp, body).
 **/

Principal.update = function(session, id, updates, callback) {
    session.put({ url: session.service.config.endpoints.principals + "/" + id, json: updates }, callback);
};

Principal.prototype.updateAttributes = function(attributes) {
    for(var key in attributes) {
        this[key] = attributes[key];
    }
};

Principal.prototype.is = function(type) {
    return this.type === type;
};

module.exports = Principal;
