var test = require('tap').test;
var chainsaw = require('../');

test('down', function (t) {
    t.plan(1);
    
    var error = null;
    var s;
    var ch = chainsaw(function (saw) {
        s = saw;
        this.raise = function (err) {
            error = err;
            saw.down('catch');
        };
        
        this.do = function (cb) {
            cb.call(this);
        };
        
        this.catch = function (cb) {
            if (error) {
                saw.nest(cb, error);
                error = null;
            }
            else saw.next();
        };
    });
    
    ch
        .do(function () {
            this.raise('pow');
        })
        .do(function () {
            t.fail("raise didn't skip over this do block");
        })
        .catch(function (err) {
            t.equal(err, 'pow');
        })
        .do(function () {
            t.end();
        })
    ;
});
