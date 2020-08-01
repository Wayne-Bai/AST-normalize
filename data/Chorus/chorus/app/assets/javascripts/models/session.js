chorus.models.Session = chorus.models.Base.extend({
    constructorName: "Session",
    urlTemplate: "sessions",

    initialize: function() {
        this.sandboxPermissionsCreated = {};
        _.bindAll(this, ['logout']);
    },

    user: function() {
        if (!this._user && this.get("user")) {
            this._user = new chorus.models.User(this.get('user'));
        }

        return this._user;
    },

    loggedIn: function() {
        return this._user && this._user.get("id");
    },

    fetch: function(options) {
        options || (options = {});
        var success = options.success, error = options.error;

        options.success = function(model, data, xhr) {
            if (success) success(model, data);
        };

        options.error = function(model, xhr) {
            model.clear();
            if (error) error(model, xhr);
        };

        return this._super('fetch', [options]);
    },

    clear: function() {
        delete this.serverErrors;
        delete this._user;
        delete this.id;
        this.sandboxPermissionsCreated = {};
        this._super('clear', arguments);
    },

    logout: function() {
        var self = this;

        if (this.get("errors")) {
            this.rememberPathBeforeLoggedOut();
            this.trigger("needsLogin");
        } else {
            this.requestLogout(function(res) {
                self.updateToken(res);
                self.trigger("needsLogin");
            });
        }
    },

    requestLogout: function(logoutSucceeded) {
        var self = this;

        $.ajax({
            type: "DELETE",
            url: self.url(),
            success: function(res) {
                self.clear();
                logoutSucceeded(res);
            }
        });
    },

    rememberPathBeforeLoggedOut: function() {
        if (!Backbone.history.fragment.match('^logout/?$')) {
            if(!Backbone.history.fragment.match('^login/?$')) {
                this._pathBeforeLoggedOut = Backbone.history.fragment;
            }
        } else {
            delete this._pathBeforeLoggedOut;
        }
    },

    shouldResume: function() {
        return this._pathBeforeLoggedOut;
    },

    resumePath: function() {
        return this._pathBeforeLoggedOut;
    },

    declareValidations: function(newAttrs) {
        this.require("username", newAttrs);
        this.require("password", newAttrs);
    },

    updateToken: function(response) {
        if (response['csrf_token']) {
            $('meta[name="csrf-token"]').attr('content', response['csrf_token']);
        }
    },

    attrToLabel: {
        "username": "login.username",
        "password": "login.password"
    }
});
