var lightning = require('../lib/lightning');

describe('tag#var', function() {

  it('should return nothing if no variable matches', function(done) {
    lightning.tmpl('<b>${a}</b>', null, null, function(err, res){
      res.toString().should.eql('<b></b>');
      done();
    })
  });
  
  it('should return the variable when there is a match', function(done) {
    lightning.tmpl('<b>${a}</b>', {a:'foo'}, {}, function(err, res){
      res.toString().should.eql('<b>foo</b>');
      done();
    })
  });
  
  it('should work with additional spaces', function(done) {
    lightning.tmpl('<b>${ a }</b>', {a:'foo'}, {}, function(err, res){
      res.toString().should.eql('<b>foo</b>');
      done();
    })
  });
  
  it('should also work with result of method calls', function(done) {
    lightning.tmpl('<b>${a.toUpperCase()}</b>', {a:'foo'}, {}, function(err, res){
      res.toString().should.eql('<b>FOO</b>');
      done();
    })
  });
  
  it('should escape variables', function(done) {
    lightning.tmpl('<b>${a}</b>', {a:'<a b="c&d" d=\'e\'>test</a>'}, {}, function(err, res){
      res.toString().should.eql('<b>&lt;a b=&quot;c&amp;d&quot; d=&#39;e&#39;&gt;test&lt;/a&gt;</b>');
      done();
    })
  });
  
  it('should support filters', function(done) {
    lightning.tmpl('<b>${a|raw}</b>', {a:'<a b="c&d" d=\'e\'>test</a>'}, {}, function(err, res){
      res.toString().should.eql('<b><a b="c&d" d=\'e\'>test</a></b>');
      done();
    })
  });
  
  it('should not interpret nested tags', function(done) {
    lightning.tmpl('<b>${a}</b>', {a:'${b}'}, {}, function(err, res){
      res.toString().should.eql('<b>${b}</b>');
      done();
    })
  });
  
});