/**
 * @namespace nitch.xhr
 * @class
 * @description A basic XMLHttpRequest wrapper for basic ajaxian needs
 * @example var repoInfo = new nitch.xhr("https://api.github.com/orgs/twitter/repos");
 * @param {String} url The URL of where you want to send the request
 * @param {Object} [opts]
 * @param {String} [opts.method='get'] Method you want to send
 * @param {Boolean} [opts.async=true] Enables an asynchronous request.
 * @param {Function} [opts.callback] Fires callback on a successful 20X response
 * @param {Function} [opts.error] Fires a callback on a 400X or 500X response
 * @param {String} [opts.params] Additional query string parameters you would like to add
 * @param {Object} [opts.headers] Object to send additional HTTP headers
**/
nitch.xhr = function(url, opts) {
	var defaults = {
		method: 'get',
		async: true,
		callback: function() {},
		error: function() {},
		params: null
	};
	
	this.opts = nitch.util.apply(defaults, opts);

	var that = this;
	var req = new XMLHttpRequest();
	var header;

	req.queryString = this.opts.params;
	req.open(this.opts.method, url, this.opts.async);

	// Set "X-Requested-With" header
	req.setRequestHeader('X-Requested-With','XMLHttpRequest');

	if (this.opts.method.toLowerCase() == 'post') {
		req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
	}

	for (header in this.opts.headers) {
		if (this.opts.headers.hasOwnProperty(header)) {
			req.setRequestHeader(header, this.opts.headers[header]);
		}
	}

	req.handleResp = this.opts.callback;
	req.handleError = this.opts.error;
	
	var hdl = function (){
		if(req.readyState == 4) {
			delete(that.xmlHttpRequest);
			if((/^[20]/).test(req.status)) {
				req.handleResp();
			}
			if((/^[45]/).test(req.status)) {
				req.handleError();
			}
		}
	};
	
	if(this.opts.async) {
		req.onreadystatechange = hdl;
		this.xmlHttpRequest = req;
	}
	
	req.send(this.opts.params);
	
	if(!this.opts.async) {
		hdl();
	}

	nitch.xhr.prototype.json = function() {
		return JSON.parse(req.responseText);
	};

	nitch.xhr.prototype.xml = function() {
		var parser = new DOMParser();  
		return parser.parseFromString(req.responseXml, "text/xml");
	};
};