'use strict';

var assert  = require('assert');
var Retsly = require('retsly-js-sdk');
var noop = function () {};

describe('retsly-js-sdk', function () {

  it('is a constructor', function (done) {
    assert('function' == typeof Retsly);
    done();
  });
  
  it('expects three arguments', function (done) {
    assert(3 == Retsly.length);
    assert.throws(function(){new Retsly()});
    assert.ok(new Retsly('test', 'test'));
    done();
  });

  it('has public options property', function (done) {
    var r = new Retsly('test', 'test', {foo: 'bar'});
    assert('bar' == r.options.foo);
    done();
  });

  it('has a socket.io connection', function (done) {
    var r = new Retsly('test', 'test');
    r.doSockets();
    assert(r.io);
    done();
  });


  it('setup is chainable', function (done) {
    Retsly
        .client('test')
        .token('test')
        .options({foo:true})
        .create();
    done();
  });

  it('returns original instance', function (done) {
    var r1 = new Retsly('original', 'test');
    var r2 = Retsly.create();
    assert(r2.getClient() === 'original');
    assert(r2 === r1);
    done();
  });

  it('returns same instance each call', function (done) {
    var r = Retsly.create();
    var s = Retsly.create();

    assert(r instanceof Retsly);
    assert(s instanceof Retsly);
    assert.equal(r, s);
    done();
  });

  it('pass new args to replace', function (done) {
    var r = Retsly.create();
    var s = Retsly.create('foo', 'test', {foo:false});
    var t = Retsly.create();

    assert.notEqual(r, s);
    assert.equal(s, t);
    done();
  });

  it('builds URLs from fragments', function (done) {
    var r = new Retsly('test','test');
    assert(r.getDomain()+'/api/v1/test' == r.getURL('test'));
    done();
  });

  it('calls all functions passed', function (done) {
    var i = 0;
    var fn = function () { i++; if (2==i) done() };
    var r = new Retsly('test','test');
    r.ready(fn)
        .ready(fn)
        .ready();

  });

  it('is chainable', function (done) {
    var r = new Retsly('test','test')
        .ready(noop)
        .ready(noop);
    assert(r instanceof Retsly);
    done();
  });

  it('is chainable', function (done) {
    var r = new Retsly('test','test')
        .get('test.html', noop)
        .post('test.html', noop);
    assert(r instanceof Retsly);
    done();
  });


  it('is chainable', function (done) {
    var r = new Retsly('test','test')
        .logout(noop);
    assert(r instanceof Retsly);
    done();
  });


});