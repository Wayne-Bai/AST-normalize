Ink.createModule('App.Plasmas.DataProvider.Base', '1', ['Ink.Net.Ajax_1', 'Ink.Util.Cookie_1'], function(Ajax, Cookie) {
    //Ajax.globalOptions.requestHeaders['X-CSRFToken'] = Cookie.get('csrftoken');

    var Module = function() {
        this.serviceUrl = 'api/v1/admin/';
        this.contentType = 'application/json';
    }

    /*
     * Do initialization stuff (called by app's bootstrap process)
     */
    Module.prototype.init = function(signals) {
        this._appSignals = signals;
    }

    /* 
     * Global response handler
     * Put general error handling logic here...
     */ 
    Module.prototype.globalAjaxHandler = function(callback, response) {
        // an exception ocurred (network error ?)
        if (response === undefined) {
            console.log('Network error !');
            this._appSignals['noSession'].dispatch();
        } else {
            // Lost session cookie
            if (response.status === 0 || response.status == 302 || response.status == 303 || response.status == 401) {
                this._appSignals['noSession'].dispatch();
            }

            // Unhandled server error
            if (response.status == 500) {
                console.log('Unhandled server error !');
            }
        }

        if (typeof callback == 'function') {
            callback(response);
        }
    }
    
    Module.prototype._buildApiMethod = function(setup) {
        return function() {
            var id;
            var queryString;
            var paramIndex=0;
            var i;
            var successCallback, failureCallback;
            var postParams;
            var method=setup.method, uriPath=setup.uriPath, hasResourceId=setup.hasResourceId, hasPostBody=setup.hasPostBody, queryParams=setup.queryParams;
            var ajaxOptions;
            
            if (hasResourceId) {
                id=arguments[paramIndex];
                paramIndex++;
            }
            
            if (hasPostBody) {
                postParams=arguments[paramIndex];
                paramIndex++;
            }
            
            if (queryParams) {
                for (i=0; i<queryParams.length; i++) {
                    if ((typeof arguments[paramIndex] != 'undefined') && (arguments[paramIndex] != '')) { 
                        if (queryString) {
                            queryString+='&';
                        } else {
                            queryString='';
                        }
                    
                        queryString+=queryParams[i] + '=' + arguments[paramIndex];
                    }
                    
                    paramIndex++;
                }
            }
            
            successCallback = arguments[paramIndex++];
            failureCallback = arguments[paramIndex++];
            
            ajaxOptions = {
                method: method,
                cors: true,
                contentType: this.contentType,
                requestHeaders: {'Accept': this.contentType},
                onSuccess: this.globalAjaxHandler.bind(this, successCallback),
                onFailure: this.globalAjaxHandler.bind(this, failureCallback),
                onException: this.globalAjaxHandler.bind(this, undefined, undefined)
            };
            
            if (postParams) {
                ajaxOptions.parameters = JSON.stringify(postParams);
            }
            
            new Ajax(this.serviceUrl+uriPath+(id ? '/'+id : '')+(queryString ? '?'+queryString : ''), ajaxOptions);
        };
    }

    return Module;
});