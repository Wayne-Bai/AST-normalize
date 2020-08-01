var $ = require('./dollar').$,
	httpProxy = require('http-proxy'),
	proxy = new httpProxy.RoutingProxy();
/*
 * forward to resftul api
 * attach client id in token request
 * to implement oauth2 resource owner's flow
 */
exports.apiProxy = function(host, port) {
	return function(req, res, next) {
		if (req.url.match(new RegExp('^\/api\/v1\/'))) {
			req.url = req.url.replace(/^\/api\/v1\//, "/");
			proxy.proxyRequest(req, res, {
				host: host,
				port: port
			});
		} else {
			next();
		}
	};
};

/*
 * forward to auth server (Oauth20)
 */
exports.graphProxy = function(host, port) {
	return function(req, res, next) {
		if (req.url.match(new RegExp('^\/graph\/v1\/'))) {
			// trust client 
			// if (req.path === '/auth/oauth/token') {
			// 	req.headers.authorization = 'Basic ' + new Buffer($('config').OAUTH_CLIENT_ID + ':' + $('config').OAUTH_CLIENT_SECRET).toString('base64');
			// }
			req.url = req.url.replace(/^\/graph\/v1\//, "/");
			proxy.proxyRequest(req, res, {
				host: host,
				port: port
			});
		} else {
			next();
		}
	};
};