var test = require('tap').test;
var through = require('through');
var hyperstream = require('../');

var fs = require('fs');
var expected = fs.readFileSync(__dirname + '/string/expected.html', 'utf8');

test('glue html streams from disk', function (t) {
    t.plan(1);
    
    var hs = hyperstream({
        '#a': fs.createReadStream(__dirname + '/string/a.html'),
        '#b': fs.createReadStream(__dirname + '/string/b.html'),
        'head title': 'beep boop',
        '#c span': function (html) { return html.toUpperCase() }
    });
    var rs = fs.createReadStream(__dirname + '/string/index.html');
    
    var data = '';
    rs.pipe(hs).pipe(through(write, end));
    
    function write (buf) { data += buf }
    
    function end () {
        t.equal(data, expected);
    }
});
