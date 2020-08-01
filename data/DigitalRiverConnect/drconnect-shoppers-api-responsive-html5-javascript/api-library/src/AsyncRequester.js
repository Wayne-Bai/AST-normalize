/**
 * Requester of a resource by an URI
 */
define(['Class'], function(Class) {
    
    var AsyncRequester = Class.extend({
        init: function(session) {
          this.session = session;  
        }, 
        
        /**
         * Sends a request and handles the responses
         * If no callbacks are defined, it calls this.options.error which is the default error handler.
         * The errorResponde containing a variable (handled) which can be used by the default error handler
         * to do special actions, for example if that error is handled by the then(null, errorFunction) of the 
         * service (which is the one who calls this function) for doing that you must put errorHandled parameter = true
         */
        makeRequest: function(promise, callbacks, errorHandled) {
            var self = this;
            var p = promise
                    .fail(function(response) { return self.invalidTokenHandler(response); })
                    .fail(function(response) { return self.adaptError(response, errorHandled); } ); 
            if(callbacks) {
                var cb = this.getCallbacks(callbacks);
                p.then(cb.success, cb.error).end();
            } else {
            	if(this.options.error){
            		p.then(null, this.options.error)
            	}
                return p;
            }
        },
        /**
         * Filter the errors to handle 401 properly (it is currently returned with status = 0)
         */
        invalidTokenHandler: function(response) {
           // The browser does not recognize the 401 status and shows 0 status.
           // We also ask for 401 status for other apps like W8
           if(response.status == 0 || response.status == 401) {
           	  if(response.status == 0){ 
				response.status = 401;
				response.error = {};
				response.error.errors = {};
				response.error.errors.error = {code: "Unauthorized", description:"Invalid token"};
	          }else{ // error.status == 401
	          	var error; 
	          	if(response.error.errors.error[0]){
	          		error = response.error.errors.error[0];
	          	}else{
	          		error = response.error.errors.error;	
	          	}
	          	response.error = {};
				response.error.errors = {};
				response.error.errors.error = {code: error.code, description: error.description};
	          }
              // Remove all session data (token, auth flag)
              //this.session.disconnect();
           }
           // Re throw the exception
           throw response;
        },
        failRequest: function(data, callbacks) {
            if(callbacks) {
                cb.error(data);
            } else {
                var defer = Q.defer();
                defer.reject(data);
                return defer.promise;
            }
        },
        load: function(resource, parameters, callbacks) {
            if(resource && resource.uri) {
                return this.makeRequest(this.session.retrieve(resource.uri, parameters), callbacks);
            } else {
                return this.failRequest("The resource does not provide a URI", callbacks);
            }
        },
        adaptError: function(response, handled) {
            if(response.error && response.error.errors && response.error.errors.error) {
                response.error = response.error.errors.error;
            }
            throw {status: response.status, details: response, "handled": handled};        
        },
        getCallbacks: function(callbacks){
            var that = this;
            var cb = {};
            if(!callbacks) callbacks = {};
            
            cb.error = function(response) {
                
                // If both success and error function are set
                if(callbacks.error && typeof callbacks.error === 'function'){
                    callbacks.error(response);
                    // If callDefaultError is set, call de default error handler
                    if(callbacks.callDefaultErrorHandler){
                        if(that.options.error && typeof that.options.error === 'function') {
                            that.options.error(response);
                        }
                    }
                
                // If no specific error handler was set, call the default error handler
                } else if(that.options.error && typeof that.options.error === 'function') {
                    that.options.error(response);
                }       
            };
            
            cb.success = function(data) {
                // If both success and error function are set
                if(callbacks.success && typeof callbacks.success === 'function'){
                    callbacks.success(data);
                
                // If only one success callback function is set 
                } else if(callbacks && typeof callbacks === 'function') {
                    callbacks(data);
                
                //  
                } else if(that.options.success && typeof that.options.success === 'function') {
                    that.options.success(data);
                }       
            };
            
            return cb; 
        }   
    });
    return AsyncRequester;
});