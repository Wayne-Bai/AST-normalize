var test = require('tap').test;
var concat = require('concat-stream');
var http = require('http');
var through = require('through');
var hyperstream = require('../');
var hyperquest = require('hyperquest');

test('queue an empty string to an http response', function (t) {
    t.plan(1);
    t.on('end', function () {
        server.close();
    });
    
    var server = http.createServer(function (req, res) {
        createStream().pipe(res);
    });
    server.listen(function () {
        var port = server.address().port;
        var hq = hyperquest('http://localhost:' + port);
        hq.pipe(concat(function (src) {
            t.equal(String(src), '<div class="a">xyz</div>');
        }));
    });
});

function createStream () {
    var stream = through();
    var hs = hyperstream({ '.a': stream });
    var rs = through().pause();
    rs.pipe(hs);
    rs.queue('<div class="a"></div>');
    rs.queue(null);
    
    process.nextTick(function () {
        rs.resume();
    });
    
    setTimeout(function () {
        stream.queue('xy');
    }, 25);
    setTimeout(function () {
        stream.queue('');
    }, 50);
    setTimeout(function () {
        stream.queue('z');
    }, 75);
    setTimeout(function () {
        stream.queue(null);
    }, 100);
    
    return hs;
}
