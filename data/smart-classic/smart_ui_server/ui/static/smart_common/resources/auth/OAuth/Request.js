
OAuthRequest = function(options) {
    var method = 'GET', url, query_params, headers={}, raw_body;
    var oauth_header_params = {
		    'oauth_callback': 'oob',
            'oauth_consumer_key': '',
            'oauth_token': '',
            'oauth_signature_method': '',
            'oauth_timestamp': getTimestamp(),
            'oauth_nonce': getNonce(),
            'oauth_verifier': '',
            'oauth_version': ''
	};
	
    this.init = function (options) {
    	this.setMethod(options.method);
    	this.setUrl(options.url);

	if (options.contentType === undefined) {
	    options.contentType = 'application/x-www-form-urlencoded';
	}

	this.setRequestHeader('Content-Type', options.contentType);
	
	if (options.contentType === 'application/x-www-form-urlencoded'){

	    if ('query' in options && 
		typeof options.query == 'string'){
		// turn into an object
		var query = options.query.split('&');
		options.query = {}; // reset
		for (var i = 0; i < query.length; i++) {
		    var kv = query.split('=');
		    options.query[kv[0]] = kv[1];
		}
	    }

	    query_params = options.query || {};
	} else { // dealing with a body hashing case here.
	    query_params = {};
	    raw_body = options.query;
	    oauth_header_params['oauth_body_hash'] = this.signBody(raw_body);
	}
		
	if ('authorization_header_params' in options) {
	    for (var i in options.authorization_header_params) {
		oauth_header_params[i] = options.authorization_header_params[i];
	    }
	}
    };

    this.signBody = function(raw) {
	var signature = new OAuthConsumer.signatureMethods['SHA1']().sign(raw);
	return signature;
    };
    
    this.getMethod = function() {
        return method;
    };
    
    this.setMethod = function(method_string) {
        method = method_string.toUpperCase() || 'GET';
    };
    
    this.getUrl = function() {
        if (this.getMethod() == 'POST') {
            return url;
        } else {
            return this.toString();        
        }
    };
    
    this.setUrl = function(url_string) {
        // @TODO: add url normalization here
        // http://github.com/bytespider/jsOAuth/blob/master_before_0.3/src/uri.js
        url = url_string;
    };
    
    this.getQueryParam = function(key) {
        return query_params[key] | undefined;
    };
    
    this.setQueryParam = function(key, value) {
        query_params[key] = value;
    };
    
    this.getQueryParams = function() {
		return lexicologicalSort(query_params);
    };
    
    this.setQueryParams = function(query_params_object) {
        query_params = query_params_object;
    };
	
	this.setAuthorizationHeaderParam = function (header, value) {
		oauth_header_params[header] = value;
	};
	
	this.getAuthorizationHeaderParams = function () {
		return lexicologicalSort(oauth_header_params);
	};
	
	function lexicologicalSort(object) {
		var keys = [];
		for (var k in object) {
			keys.push(k);
		}

        var o = object;
		object = {}; // reset
		keys.sort();
		
		for(var k = 0; k < keys.length; k++) {
			object[keys[k]] = o[keys[k]];
		}
        
        return o;	
	}
	
	function getTimestamp() {
        return ""+parseInt(+new Date / 1000); // use short form of getting a timestamp
    };
    
    function getNonce(key_length) {
        key_length = key_length || 64;
        
        var key_bytes = key_length / 8;
        var value = '';
        var key_iter = key_bytes / 4;
        var key_remainder = key_bytes % 4;
        var chars = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', 
                     '2A', '2B', '2C', '2D', '2E', '2F', '30', '31', '32', '33', 
                     '34', '35', '36', '37', '38', '39', '3A', '3B', '3C', '3D', 
                     '3E', '3F', '40', '41', '42', '43', '44', '45', '46', '47', 
                     '48', '49', '4A', '4B', '4C', '4D', '4E', '4F', '50', '51', 
                     '52', '53', '54', '55', '56', '57', '58', '59', '5A', '5B', 
                     '5C', '5D', '5E', '5F', '60', '61', '62', '63', '64', '65', 
                     '66', '67', '68', '69', '6A', '6B', '6C', '6D', '6E', '6F', 
                     '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', 
                     '7A', '7B', '7C', '7D', '7E'];
        
        for (var i = 0; i < key_iter; i++) {
            value += chars[rand()] + chars[rand()] + chars[rand()]+ chars[rand()];
        }
        
        // handle remaing bytes
        for (var i = 0; i < key_remainder; i++) {
            value += chars[rand()];
        }
        
        return value;
        
        function rand() {
            return Math.floor(Math.random() * chars.length);
        }
    };
	
	this.getRequestHeaders = function (header) {
		return headers;
	};
	
	this.getRequestHeader = function (header) {
		return headers[header];
	};
		
	this.setRequestHeader = function (header, value) {
		headers[header] = value;
	};
    
    this.toString = function () {
		// @TODO need to clean up the url at this point
        // http://github.com/bytespider/jsOAuth/blob/master_before_0.3/src/uri.js
		return url + '?' + this.toQueryString();
    };
	
    this.toQueryString = function () {
	var arr = [], qp = this.getQueryParams(), i;
		for (i in qp) {
				if (qp[i] && qp[i] != undefined) {
					arr.push(OAuthUtilities.urlEncode(i) + '=' + OAuthUtilities.urlEncode(qp[i]+''));
				}
		}
		
		return arr.join('&');
    };
	
	 this.toHeaderString = function () {
	     var arr = [], hp = this.getAuthorizationHeaderParams(), i;
		for (i in hp) {
            if (hp[i] && hp[i] != undefined) {
				arr.push(i + '="' + OAuthUtilities.urlEncode(hp[i]) + '"');
            }
		}
		
		return arr.join(', ');
    };
	
    this.toSignatureBaseString = function () {
	var arr = [], i;
		
		for (i in oauth_header_params) {
				if (oauth_header_params[i] && oauth_header_params[i] != undefined) {
					arr.push(OAuthUtilities.urlEncode(i) + '=' + OAuthUtilities.urlEncode(oauth_header_params[i]+''));
				}
		}
		for (i in query_params) {
				if (query_params[i] && query_params[i] != undefined) {
					arr.push(OAuthUtilities.urlEncode(i) + '=' + OAuthUtilities.urlEncode(query_params[i]+''));
				}
		}
		
        return [
            method, 
            OAuthUtilities.urlEncode(OAuthUtilities.urlForSignatureBaseString(url)), 
            OAuthUtilities.urlEncode(arr.sort().join('&'))
        ].join('&');
    };
    
    
    if (arguments.length > 0) {
        this.init(options);
    }
}
