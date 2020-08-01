var test = require('tap').test;
var through = require('through');
var hyperstream = require('../');

var fs = require('fs');
var expected = fs.readFileSync(__dirname + '/none/index.html', 'utf8');

test('paused output', function (t) {
    t.plan(1);
    
    var hs = hyperstream();
    hs.pause();
    setTimeout(function () {
        hs.resume();
    }, 500);
    
    var rs = fs.createReadStream(__dirname + '/none/index.html');
    
    var data = '';
    rs.pipe(hs).pipe(through(write, end));
    
    function write (buf) { data += buf }
    
    function end () {
        t.equal(data, expected);
    }
});
