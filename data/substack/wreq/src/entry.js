var detective = require('detective');
var http = require('http-browserify');
var path = require('path');

function load (file) {
    fetch(path.resolve(window.location.pathname, file), function (src) {
        src.run();
    });
}

(function () {
    function onready () {
        if (document.readyState === 'loading') return;
        document.removeEventListener('readystatechange', onready);
        var scripts = document.querySelectorAll('script[type="text/wreq"]');
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src) {
                var file = scripts[i].src.replace(/^https?:\/\/[^\/]+/, '');
                load(file);
            }
            else {
                var file = '#' + Math.random().toString().slice(2);
                store(file, scripts[i].innerHTML, function (src) {
                    src.run();
                });
            }
        }
    }
    onready();
    document.addEventListener('readystatechange', onready);
})();

var sources = {};

function run (src) {
    if (src.cache) return src.cache;
    
    var fn = Function([ 'require', 'module', 'exports' ], src.source);
    var m = { exports : {} };
    fn.apply(null, [
        function require (p) { return src.requires[p].run() },
        m, m.exports
    ]);
    return m.exports;
}

function fetch (file, cb) {
    if (sources[file]) return cb(sources[file]);
    sources[file] = {};
    var opts = { path : file };
    
    http.get(opts, function (res) {
        var data = '';
        res.on('data', function (buf) { data += buf });
        res.on('end', function () {
            store(file, data, cb);
        });
    });
}

function store (file, data, cb) {
    var requires = detective(data);
    var pending = requires.length;
    sources[file].source = data + '\n//@ sourceURL=' + file;
    sources[file].requires = {};
    sources[file].run = function () {
        return run(sources[file]);
    };
    
    if (pending === 0) cb(sources[file]);
    
    requires.forEach(function (r) {
        fetch(path.resolve(path.dirname(file), r), function (src) {
            sources[file].requires[r] = src;
            if (--pending === 0) cb(sources[file]);
        });
    });
}
