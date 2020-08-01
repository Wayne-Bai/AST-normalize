var lightning = require('../index')
  , basic = __dirname + '/express/basic.lightning'
  , base = __dirname + '/express/base.lightning'
  , leaf1 = __dirname + '/express/leaf1.lightning'
  , leaf2 = __dirname + '/express/leaf2.lightning';

// Actual tests
function runExpressTests(express) {
    
  describe('express', function() {

    it('should be connectable', function() {
      lightning.should.have.property('__express')
    });
    
    it('should work properly', function(done) {
      lightning.__express(basic, {}, function(err, res){
        res.toString().should.be.equal('<b>Foo</b>')
        done();
      })
    });
    
    it('should handle layouts', function(done) {
      lightning.__express(leaf1, {}, function(err, res){
        res.toString().should.be.equal('Foo Woo');
        res.blocks.loo.should.be.equal('Woo');
        done();
      })
    });
    
    it('should handle dynamic layouts', function(done) {
      lightning.__express(leaf2, {someLayout:'base.lightning'}, function(err, res){
        res.toString().should.be.equal('Foo Doo');
        res.blocks.loo.should.be.equal('Doo');
        done();
      });
    });
    
    it('should handle absolute paths as well', function(done) {
      lightning.__express(leaf2, {someLayout:base}, function(err, res){
        res.toString().should.be.equal('Foo Doo');
        res.blocks.loo.should.be.equal('Doo');
        done();
      });
    });
    
    it('should handle custom loaders', function(done) {
    
      function dummyViewLookup(name, options, callback) {
        if(name == 'test') callback(base);
      }
    
      lightning.__express(leaf2, {someLayout:'test', settings:{'view options':{viewLookup:dummyViewLookup}}}, function(err, res){
        res.toString().should.be.equal('Foo Doo');
        res.blocks.loo.should.be.equal('Doo');
        done();
      })
    });
  
  });
  
}

// Run these tests if possible
var express;

try {
  express = require('express');
} catch(e) { }

if(express)
  runExpressTests(express);