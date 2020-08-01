// UserStatusModel
// The model stores user session status, and handles login/logout
// --------
define(["jquery", "backbone", "./BaseModel"],

    function($, Backbone, BaseModel) {

        // Creates a new Backbone Model class object
        var Model = BaseModel.extend({

            getUrl: function(action) {
                return this.apiUrl + "/user/status?action=" + action;
            },

            // Model Constructor
            initialize: function() {
                //if not login, try auth via A cookie
                if (!this.isLogin()) {
                    var refreshToken = $.cookie('A');
                    if (refreshToken) {
                        this.login({
                            refresh_token: refreshToken
                        }, 'refresh');
                    }
                }
                $.ajaxSetup({
                    headers: {
                        'Authorization': this.getAuthToken()
                    }
                });

                //Check for sessionStorage support
                if (Storage && sessionStorage) {
                    this.supportStorage = true;
                }
            },

            // Default values for all of the Model attributes
            defaults: {
                authenticated: false,
                message: "",
                userId: null,
                userProfile: null,
                sessionId: null,
                rememberAuth: false
            },

            isLogin: function() {
                return Boolean(this.get('accessToken'));
            },

            get: function(key) {
                if (this.supportStorage) {
                    var data = sessionStorage.getItem(key);
                    if (data && data[0] === '{') {
                        return JSON.parse(data);
                    } else {
                        return data;
                    }
                } else {
                    return Backbone.Model.prototype.get.call(this, key);
                }
            },

            set: function(key, value) {
                if (this.supportStorage) {
                    sessionStorage.setItem(key, value);
                } else {
                    Backbone.Model.prototype.set.call(this, key, value);
                }
                return this;
            },

            unset: function(key) {
                if (this.supportStorage) {
                    sessionStorage.removeItem(key);
                } else {
                    Backbone.Model.prototype.unset.call(this, key);
                }
                return this;
            },

            clear: function() {
                if (this.supportStorage) {
                    sessionStorage.clear();
                } else {
                    Backbone.Model.prototype.clear(this);
                }
                this.trigger('change');
            },

            getAuthToken: function() {
                if (!this.get('accessToken') || !this.get('tokenType'))
                    return null;
                else
                    return this.get('tokenType') + ' ' + this.get('accessToken');
            },
            /*
             * Login in either username/password or refreshToken
             * @credentials either username/password or refresh token (required)
             * @param type of login [login|refresh] (required)
             */
            login: function(credentials, type, cb) {
                if (credentials.remember) {
                    this.rememberAuth = true;
                }
                var that = this;
                var login = $.ajax({
                    url: that.getUrl(type),
                    data: credentials,
                    type: 'POST'
                });
                login.done(function(response) {
                    that.set('accessToken', response.access_token);
                    that.set('refreshToken', response.refresh_token);
                    that.set('tokenType', response.token_type);
                    that.set('expiresIn', response.expires_in);
                    if (that.rememberAuth) {
                        $.cookie("A", response.refresh_token, {
                            expires: 1
                        });
                    }
                    // add authorization header on all ajax calls
                    $.ajaxSetup({
                        headers: {
                            'Authorization': that.getAuthToken()
                        }
                    });

                    // if "remember me" in login, save auth data into cookie
                    // when init session, load them from cookie
                    $.ajax({
                        url: 'api/v1/user'
                    }).done(function(profile) {
                        that.set('userProfile', JSON.stringify(profile));
                        $.cookie("B", profile, {
                            expires: 365
                        });
                        that.pubsub.trigger('user:login');
                        that.trigger('change');
                    }).fail(function(jqXHR, textStatus) {
                        //TODO: send a global message
                        that.logout();
                    });

                    var path = that.get('redirectFrom');
                    if (path && path !== "login") {
                        that.unset('redirectFrom');
                        Backbone.history.navigate(path, {
                            trigger: true
                        });
                    } else {
                        Backbone.history.navigate('', {
                            trigger: true
                        });
                    }
                    if (_.isFunction(cb)) {
                        cb();
                    }
                });
                login.fail(function(response, status, error) {
                    that.pubsub.trigger('system:notify', {
                        title: "demo",
                        text: "sth"
                    });
                    Backbone.history.navigate('login', {
                        trigger: true
                    });
                });
            },

            logout: function(cb) {
                var that = this;
                $.ajax({
                    url: that.getUrl('logout'),
                    type: 'POST'
                }).done(function(response) {
                    //Clear all session data
                    that.clear();
                    //Set the new csrf token to csrf vaiable and
                    //call initialize to update the $.ajaxSetup 
                    // with new csrf
                    //csrf = response.csrf;
                    $.removeCookie('A');
                    that.initialize();
                    //pubsub
                    that.pubsub.trigger('user:logout');
                    if (_.isFunction(cb)) {
                        cb();
                    }
                });
            }

            // getAuth: function(cb) {
            //     var that = this;
            //     var Session = this.fetch();

            //     Session.done(function(response) {
            //         that.set('authenticated', true);
            //         that.set('user', JSON.stringify(response.user));
            //     });

            //     Session.fail(function(response) {
            //         response = JSON.parse(response.responseText);
            //         that.clear();
            //         csrf = response.csrf !== csrf ? response.csrf : csrf;
            //         that.initialize();
            //     });
            //     if (_.isFunction(cb)) {
            //         Session.always(cb);
            //     }
            // }
        });

        // Returns the Model class
        return Model;

    }

);