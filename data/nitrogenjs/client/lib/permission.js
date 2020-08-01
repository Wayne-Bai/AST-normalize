/**
 * A permission in Nitrogen is a grant that has been made to principal(s) for a particular set of actions on another principal.
 *
 * A permission has the following properties:
 *     issued_to: The principal id that this permission is granted to.  If missing, this permission applies to all principals.
 *     principal_for: The principal this permission is for.  For instance, if you were granting subscription access for a lamp to a user,
 *         in this scenario the lamp would be the principal_for.
 *     action: The action that this permission is relevant for.  Valid values include:
 *         'admin': issued_to is authorized to perform administrative operations on principal_for.
 *         'send': issued_to is authorized to send messages to principal_for.
 *         'subscribe': issued_to is authorized to subscribe to messages from principal_for.
 *         'view': issued_to is authorized to see principal_for in searches.
 *     authorized: Boolean declaring if matches to this permission authorizes or forbids it.
 *     priority: The priority this principal has in relation to other permissions.  Permissions are walked in priority order and the first
 *         match is used to determine if the action is authorized.
 *     filter: An object that specifies additional filters that should be applied to a relevant object at authorization time.  For example,
 *         { type: "ip" } would be used to limit matches with this permission to only messages with the type 'ip'.
 *     expires: An expiration date for this permission. After this expiration date, the permission will be disregarded and eventually removed
 *          from the system.
 * @class Permission
 * @namespace nitrogen
 **/

function Permission(json) {
    for(var key in json) {
        if(json.hasOwnProperty(key)) {
            this[key] = json[key];
        }
    }
}

/**
 * Creates a permission with the Nitrogen service.
 *
 * @method create
 * @async
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err, permission).
 **/

Permission.prototype.create = function(session, callback) {
    session.post({ url: session.service.config.endpoints.permissions, json: this }, function(err, resp, body) {
        if (err) return callback(err);
        if (resp.statusCode != 200) return callback(body);

        if (callback) callback(null, new Permission(body.permission));
    });
};

/**
 * Find permissions filtered by the passed query and limited to and sorted by the
 * passed options.
 *
 * @method find
 * @async
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Object} query A query using MongoDB query format.
 * @param {Object} options Options for the query:  'limit': maximum number of results to be returned. 'sort': The field that the results should be sorted on, 'dir': The direction that the results  should be sorted. 'skip': The number of results that should be skipped before pulling results.
 * @param {Function} callback Callback function of the form f(err, permissions).
 **/

Permission.find = function(session, query, options, callback) {
    if (!session) return callback(new Error("session required for find"));
    if (!callback || typeof callback !== 'function') return callback(new Error('callback required for find.'));

    session.get({
        url: session.service.config.endpoints.permissions,
        query: query,
        queryOptions: options,
        json: true
    }, function(err, resp, body) {
        if (err) return callback(err);

        var permissions = body.permissions.map(function(permission) {
            return new Permission(permission);
        });

        callback(null, permissions);
    });
};

/**
 * Delete this permission from the service.
 *
 * @method remove
 * @async
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err).
 **/

Permission.prototype.remove = function(session, callback) {
    var self = this;

    session.remove({ url: session.service.config.endpoints.permissions + "/" + this.id }, function(err) {
        return callback(err);
    });
};

/**
 * Save this permission to the service.
 *
 * @method save
 * @async
 * @param {Object} session An open session with a Nitrogen service.
 * @param {Function} callback Callback function of the form f(err, permission).
 **/

Permission.prototype.save = function(session, callback) {
    if (!this.id) return callback("Permission must have id to be saved.");

    session.put({ url: session.service.config.endpoints.permissions + "/" + this.id, json: this }, function(err, resp, body) {
        if (err) return callback(err);
        if (resp.statusCode != 200) return callback(body, null);

        if (callback) callback(null, new Permission(body.permission));
    });
};

Permission.NORMAL_PRIORITY = 10000000;

module.exports = Permission;