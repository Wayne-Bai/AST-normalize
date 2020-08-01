define(['Config', 'connection/Connection', 'auth/AuthManager', 'q'], function(Config, Connection, AuthManager, Q) {
    /**
     * This object is for getting a Session for connecting
     * @returns {Session}
     */
    var Session = function(apikey, authOptions){
        this.apikey = apikey;
            
        this.connection = new Connection();
        this.authManager = new AuthManager(Config.connection.URI.BASE_URL + Config.connection.URI.LOGIN, authOptions);  
        
       this.reset();
    }
    
    /**
     * Creates a new error promise with the specified error message
     */
    Session.prototype.createErrorPromise = function(message) {
        console.log("Operation not allowed: " + message);
        var errorResponse = this.createServerErrorResponse();
        var d = Q.defer();
        d.reject(errorResponse);
        return d.promise;
    }
    
    /**
     * Creates a new error promise indicating the user must be connected before using the API
     */
    Session.prototype.createDisconnectedError = function() {
        return this.createErrorPromise("You must be connected to the server in order to use the API")
    }
    
    /**
     * Creates a server_error response
     */
    Session.prototype.createServerErrorResponse = function(){
        var errorResponse = {};
        var error = {};
        error.code = "server_error";
        error.description = "Service Temporaly Unavailable. Please try again later or contact the System Administrator.";
        errorResponse.status = 500;
        errorResponse.error = {};
        errorResponse.error.errors = {};
        errorResponse.error.errors.error = error;
        return errorResponse;
    }
    
    
    /**
     * Connection.create
     */
    Session.prototype.create = function(uri, urlParams, body){
    
        // Check if session is logged in
        if(!this.connected){
            return this.createDisconnectedError();
        }
        
        // Http Request Header fields for all Creations
        var headerParams = {};
        headerParams['Authorization'] = 'bearer ' + this.token;
        
        var formattedBody = body;
        if(body){
			headerParams["Content-Type"] = "application/json";
			formattedBody = JSON.stringify(body);
        }
        
        var promise = this.connection.create(uri, urlParams, headerParams, formattedBody)
                       .then(function(data) {
                           for(var name in data) {
                               if(name) {
                                   return data[name];
                               }
                           }
                       });
        
        return promise;
    }
    
    /**
     * Connection.retrieve
     */
    Session.prototype.remove = function(uri, urlParams){
    
        // Check if session is logged in
        if(!this.connected){
           return this.createDisconnectedError();
        }
        
        // Http Request Header fields for all Retrieves
        var headerParams = {};
        headerParams['Authorization'] = 'bearer ' + this.token;
        
        if(!urlParams) {
            urlParams = {};
        }
        urlParams.client_id = this.apikey;
        
        var promise = this.connection.remove(uri, urlParams, headerParams)
                       .then(function(data) {
                           for(var name in data) {
                               if(name) {
                                   return data[name];
                               }
                           }
                       });
        return promise;
    }
    
    /**
     * Connection.retrieve
     */
    Session.prototype.retrieve = function(uri, urlParams){
    
        // Check if session is logged in
        if(!this.connected){
            return this.createDisconnectedError();
        }
        
        // Http Request Header fields for all Retrieves
        var headerParams = {};
        headerParams['Authorization'] = 'bearer ' + this.token;
        
        if(!urlParams) {
            urlParams = {};
        }
        urlParams.client_id = this.apikey;
        
        var self = this;
        var promise = this.connection.retrieve(uri, urlParams, headerParams)
                       .then(function(data) {
                           for(var name in data) {
                               if(name) {
                                   return data[name];
                               }
                           }
                       });
        /*
        if(urlParams.expand && urlParams.expand !== "") {
            promise = this.handleExpansion(promise, urlParams.expand);
        }
        */
        return promise;
    }
    
    Session.prototype.errorHandle = function(response) {
    }
    
    /**
     * Performs an anonymous authentication to the DR Server.
     * This should always be the first step in the session (required to use anonymous APIs and also to authenticate)
     */
    Session.prototype.anonymousLogin = function() {
        
        var uri = Config.connection.URI.BASE_URL + Config.connection.URI.ANONYMOUS_LOGIN;
        var that = this;
        
        var d = new Date();
        
        if(this.refreshToken){
            return this.getRefreshToken();  
        }
        
        var fields = {"client_id": this.apikey, "ts": d.getTime(), "grant_type": "password", "username": "anonymous", "password": "anonymous"};
        
        return this.connection.submitForm(uri, fields,{})
            .then(function(data){
                that.connected = true;
                that.token = data.access_token;
                that.refreshToken = data.refresh_token;
                console.debug("[DR Api Library] Anonymous token obtained: " + that.token);
                that.tokenStartTime = new Date().getTime()/1000;
                that.tokenExpirationTime = new Date().getTime()/1000 + parseInt(data.expires_in);
                return data;
            }).fail(function(data){
                // If fails cleans the refresh_token to obtain a new one on the next anonymousLogin call
                console.debug("[DR Api Library] Token failure. Application could not obtain an anonymous token.");
                that.reset();
                var errorResponse = that.createServerErrorResponse();
                
                throw errorResponse;
            });
    };
    
    /**
     * Refresh an anonymous token authentication to the DR Server.
     */
    Session.prototype.getRefreshToken = function() {
        
        var uri = Config.connection.URI.BASE_URL + Config.connection.URI.ANONYMOUS_LOGIN;
        var that = this;
        
        var d = new Date();
        
        var fields = {"client_id": this.apikey, "ts": d.getTime(), "grant_type": "refresh_token", "refresh_token": this.refreshToken};
        
        return this.connection.submitForm(uri, fields, {})
            .then(function(data){
                that.connected = true;
                that.token = data.access_token;
                that.refreshToken = data.refresh_token;
                console.debug("[DR Api Library] Anonymous token obtained using Refresh Token: " + that.token);
                that.tokenStartTime = new Date().getTime()/1000;
                that.tokenExpirationTime = new Date().getTime()/1000 + parseInt(data.expires_in);
                return data;
            }).fail(function(data){
                // If fails cleans the refresh_token to obtain a new one on the next anonymousLogin call
                console.debug("[DR Api Library] Token failure. Application could not obtain an anonymous token using a refresh token.");
                that.refreshToken = null;
                var errorResponse = {};
                var error = {};
                error.code = "refresh_token_invalid";
                error.description = "The Refresh Token is invalid";
                errorResponse.status = 401;
                errorResponse.error = {};
                errorResponse.error.errors = {};
                errorResponse.error.errors.error = error;
                
                throw errorResponse;
            });
    };
    
     /**
      * Sets the session info (usefull when an application activates after suspention)
      * Sets the token and other session variables 
      */
    Session.prototype.setSessionInfo = function(sessionInfo){
        this.connected = sessionInfo.connected;
		this.authenticated = sessionInfo.authenticated;
		this.token = sessionInfo.token;
		this.refreshToken = sessionInfo.refreshToken;
		this.tokenExpirationTime = sessionInfo.tokenExpirationTime;
    };
    
    /**
     * Forces to refresh token even if the access_token isn't expired 
     */
    Session.prototype.forceRefreshToken = function(){
        return this.getRefreshToken();
    };
    
    /**
     * Forces to get restart the connection getting a new access token
     */
    Session.prototype.forceResetSession = function(){
        this.reset();
        return this.anonymousLogin();
    };
    
    /**
     * Resets the token session variables
     */
    Session.prototype.reset = function() {
        this.token = null;
        this.refreshToken = null;
        this.connected = false;
        this.authenticated = false;
        this.tokenStartTime = null;
        this.tokenExpirationTime = null;
        
    };
    
    
    /**
     * Triggers the OAuth flow in order to get credentials from the user and authenticate him/her
     * This will allow to use protected APIs (such as GetShopper)
     */
    Session.prototype.authenticate = function(onViewLoadedCallback) {
        var self = this;
        
        // Check if session is logged in
        if(!this.connected){
            return this.createDisconnectedError();
        }
        
        var defer = Q.defer();
        
        var p = this.authManager.login(this.token, onViewLoadedCallback);
        p.then(function(data) {
                if(data.token && data.token != "") {
                    self.token = data.token;
                    self.authenticated = true;
                    self.refreshToken = null;
                    self.tokenStartTime = new Date().getTime()/1000;
                    self.tokenExpirationTime = new Date().getTime()/1000 + parseInt(data.expires_in);
                    console.debug("[DR Api Library] Authenticated token obtained: " + self.token);
                }else if(data.code){
                	return self.getAutorizationCodeToken(data.code, defer);
               
                }
                defer.resolve(data.token);
            });  
        
        return defer.promise;
    };
    
    
     /**
     * Refresh an anonymous token authentication to the DR Server.
     */
    Session.prototype.getAutorizationCodeToken = function(authorization_code, defer) {
        
        var uri = Config.connection.URI.BASE_URL + Config.connection.URI.ANONYMOUS_LOGIN;
        var redirectUri = Config.config.DEFAULT_REDIRECT_URI;
        var that = this;
        
        var d = new Date();
        
        var fields = {"client_id": this.apikey, "ts": d.getTime(), "grant_type": "authorization_code", "code": authorization_code, 
        	"redirect_uri" : redirectUri, "dr_limited_token": this.token};
        
        return this.connection.submitForm(uri, fields, {})
            .then(function(data){
                if(data.access_token != "") {
                    that.token = data.access_token;
                    that.authenticated = true;
                    that.refreshToken = null;
                    that.tokenStartTime = new Date().getTime()/1000;
                    that.tokenExpirationTime = new Date().getTime()/1000 + parseInt(data.expires_in);
                    console.debug("[DR Api Library] Authenticated token obtained using Autorization Code: " + that.token);
                }
                defer.resolve(data.access_token);
            }).fail(function(data){
                // If fails cleans the refresh_token to obtain a new one on the next anonymousLogin call
                console.debug("[DR Api Library] Token failure. Application could not obtain a token using an authorization code.");
                that.refreshToken = null;
                var errorResponse = {};
                var error = {};
                error.code = "authotization_code_invalid";
                error.description = "The Authorization Code is Invalid";
                errorResponse.status = 401;
                errorResponse.error = {};
                errorResponse.error.errors = {};
                errorResponse.error.errors.error = error;
                
                defer.reject(errorResponse);
            });
    };
    
    
    
    /**
     * Disconnects from the service by clearing the session data
     */
    Session.prototype.disconnect = function() {
        this.token = null;
        this.authenticated = false;
        this.connected = false;
        
        var defer = Q.defer();
        defer.resolve();
        return defer.promise;
    }
    
    /**
     * Ends the session by clearing the session data and starting an anonymous one.
     */
    Session.prototype.logout = function() {
        if(!this.connected){
            return this.createDisconnectedError();
        }
        if(this.authenticated) {
            // User is authenticated, forget the token and create an anonymous session
            // this.token = null;
            // this.authenticated = false;
            this.reset();
            
            return this.anonymousLogin();
        } else {
            // User is anonymous already, do nothing
            var defer = Q.defer();
            defer.resolve();
            return defer.promise;
        }
        
    }
    
    /**
     * Temporary implementation of the 'expand' param due to a workInProgress by Apigee
     */
    Session.prototype.handleExpansion = function(promise, attribute) {
        var that = this;
        
        return promise
                .then(function(data) { 
                        return that.expand(data, attribute);
                }); 
    }
    
    Session.prototype.expand = function(result, attribute) {
        var that = this;
        var entity = getAttribute(result, attribute);
        var promises = [];
        var isArray = is_array(entity); 
        if(isArray) {
            for(var i = 0; i < entity.length; i++) {
                var o = entity[i];
                promises.push(that.retrieve(o.uri, {}));
            }
        } else {
             promises.push(that.retrieve(entity.uri, {}));
        }
        return Q.all(promises)
            .then(function(results) {
                if(isArray) {
                    setAttribute(result, attribute, []);
                    var entity = getAttribute(result, attribute);
                    for(var i = 0; i < results.length; i++) {
                        entity.push(results[i]);    
                    }
                } else {
                    setAttribute(result, attribute, results[0]);
                }
                return result;
            });
    }
    
    return Session;    
});