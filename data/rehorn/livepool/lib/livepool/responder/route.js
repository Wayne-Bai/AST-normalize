var url = require('url'),
    fs = require('fs'),
    dns = require('dns');

var httpProxy = require('http-proxy');
var httpProxyAgent = require('http-proxy-agent');

var config = require('../config'),
    liveRequest = require('../request'),
    logger = require('../logger'),
    notify = require('../notify'),
    templateResponder = require('./template');

var global = config.global;

function routeResponder(router, req, res, options) {
    var proxyHost = '';
    var reqInfo = liveRequest.getReqInfo(req);
    router = router || config.getRouter(reqInfo);
    if (router) {
        // directly proxy
        if (router.action == '-') {
            goProxy(req, res, null, options);
        } else {
            // proxy to specified server
            goProxy(req, res, router.action, options);
        }
    } else {
        // directly proxy
        goProxy(req, res, null, options);
    }
};

function goProxy(req, res, router, options) {
    var host, port, hostIp;
    if (router) {
        host = router.split(':')[0];
        port = router.split(':')[1] || '80';
    }
    var urlObj = url.parse(req.url);
    urlObj.host = host || urlObj.hostname;
    urlObj.port = port || urlObj.port;

    // TODO req.connect.remoteAddress -> 127.0.0.1
    // hack -> use dns resolve to get ip of hostname
    // known issue: multi ip don't know which one is used for socket connection
    var re = /((?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d))/;
    if (re.test(urlObj.host)) {
        notify.hostIp(options.sid, req, res, [urlObj.host]);
    } else {
        dns.resolve4(urlObj.host, function(err, address) {
            if (err) {
                return;
            };
            notify.hostIp(options.sid, req, res, address);
        });
    }

    // logger.log('req proxied, host:' + host + ', port:' + port + ', url:' + req.url);
    var proxy = httpProxy.createProxyServer({});
    var proxyOptions = {
        target: {
            host: urlObj.host,
            port: urlObj.port
        }
    };
    // TODO: router with a proxy agent has errors
    // router ip should be visit without proxy agent
    if (!router && global.proxy) {
        proxyOptions.agent = httpProxyAgent(global.proxy);
    }
    proxy.web(req, res, proxyOptions, function(e) {
        // proxy error -> retry once
        proxy.web(req, res, proxyOptions, function(e) {
            console.log('[proxy error]: ' + req.url.grey);
            // console.log(e.stack);
            var options = {
                statusCode: 503
            };
            templateResponder('503_ProxyError.html', req, res, options);
        });      
    });
};

module.exports = routeResponder;
