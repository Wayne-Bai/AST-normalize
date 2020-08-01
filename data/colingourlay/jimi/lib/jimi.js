var sys = require('sys'),
    url = require('url'),
    connect = require('connect'),
    template_loader = require('./template/loader');

var respond = exports.respond = function (res, body, content_type, status) {
    content_type = content_type || 'text/html';
    res.writeHead(status || 200, {
        'Content-Type': content_type  + '; charset=utf-8'
    });
    res.write(body, 'utf8');
    res.end();
};

exports.respond_using_template = function (res, template, context) {
    template_loader.load_and_render(template, context, function (error, result) {
        if (!error) {
            respond(res, result, 'text/html');
        }
    });
};

var redirect = exports.redirect = function(res, location, status) {
    status = status || 301;
    res.writeHead(status || 200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Location': location
    });
    res.write('Redirecting...');
    res.close();
}

function create_app(url_mappings) {
    
    function build_url_mappings(url_mappings, partial_pattern) {
        var mappings = [];
        partial_pattern = partial_pattern || '';
        url_mappings.map(function (pair) {
            if (partial_pattern) {
                pair[0] = partial_pattern + pair[0].substring(1,pair[0].length);
            } else {
                pair[0] = pair[0].charAt(0) + '/' + pair[0].substring(1,pair[0].length);
            }
            if (typeof(pair[1]) == 'object') {
                build_url_mappings(pair[1], pair[0]).map(function (pair) {
                    mappings.push(pair);
                });
            } else {
                mappings.push(pair);
            }
        });
        return mappings;
    }

    function is_valid_path(compiled, path) {
        var valid = false;
        for (var pair, i = 0; pair = compiled[i]; i++) {
            var match = pair[0](path);
            if (match) {
                valid = true;
                break;
            }
        }
        return valid;
    }
    
    function enhance_req(req) {
        var _req = req;
        _req.GET = _req.POST = _req.QUERY = [];
        if (_req.method === 'GET') {
            _req.GET = _req.QUERY = url.parse(req.url, true).query;
        } else if (req.method === 'POST') {
            _req.POST = _req.QUERY = url.parse(req.url, true).query;
        }
        return _req;
    }
    
    var compiled = build_url_mappings(url_mappings).map(function (pair) {
        return [new RegExp(pair[0]), pair[1]];
    });
    
    return function (req, res) {
        var path = url.parse(req.url).pathname;
        if (path.length > 1) {
            if (!is_valid_path(compiled, path) && is_valid_path(compiled, path + '/')) {
                redirect(res, req.url + '/');
            }
        }
        var handler = function (req, res) { respond(res, '', '', 404); };
        var args = [enhance_req(req), res];
        for (var pair, i = 0; pair = compiled[i]; i++) {
            var match = pair[0](path);
            if (match) {
                match.slice(1).forEach(function (arg) {
                    args.push(arg);
                });
                handler = pair[1];
                break;
            }
        }
        try {
            handler.apply(null, args);
        } catch (e) {
            throw new Error(e);
        }
    };
}

global.options = {
    template_path: null,
    public_path: null,
    debug: false,
    port: 8009,
    url_conf: {
        mappings: []
    }
}

exports.run = function (options) {
    for (option in options) {
        global.options[option] = options[option];
    }
    var application = create_app(global.options.url_conf.mappings);
    sys.puts((global.options.debug ? '(debug) ' : '') + 'jimi running on port ' + global.options.port + '...\n');
    if (global.options.debug) {
        if (!global.options.public_path) {
            sys.puts('[warning]: You have not defined the global public_path option, and will not be able to serve static media.');
        }
        return connect.createServer(
            connect.logger(),
            connect.staticProvider(global.options.public_path),
            application,
            connect.errorHandler({
                dumpExceptions: true,
                showStack: true
            })
        ).listen(global.options.port);
    } else {
        return connect.createServer(
            connect.staticProvider(global.options.public_path),
            application
        ).listen(global.options.port);
    }
};

exports.version = "0.0.8";