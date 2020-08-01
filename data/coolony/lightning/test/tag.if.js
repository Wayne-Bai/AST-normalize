var lightning = require('../lib/lightning');

describe('tag#if', function() {

  it('should switch correctly for true', function(done) {
    lightning.tmpl('{{if a == 1}}foo{{else}}bar{{/if}}', {a: 1}, null, function(err, res){
      res.toString().should.eql('foo');
      done();
    })
  });
  
  it('should switch correctly for else', function(done) {
    lightning.tmpl('{{if a == 1}}foo{{else}}bar{{/if}}', {a: 2}, null, function(err, res){
      res.toString().should.eql('bar');
      done();
    })
  });
  
  it('should switch correctly for elseif cases', function(done) {
    lightning.tmpl('{{if a == 1}}foo{{else a == 5}}bar{{else}}loo{{/if}}', {a: 5}, null, function(err, res){
      res.toString().should.eql('bar');
      done();
    })
  });
  
  it('should switch correctly for elseif cases when nothing matches', function(done) {
    lightning.tmpl('{{if a == 1}}foo{{else a == 5}}bar{{else}}loo{{/if}}', {a: 8}, null, function(err, res){
      res.toString().should.eql('loo');
      done();
    })
  });
  
  it('should work without else clause', function(done) {
    lightning.tmpl('{{if a == 1}}foo{{/if}}', {a: 1}, null, function(err, res){
      res.toString().should.eql('foo');
      done();
    })
  });
  
  it('should work without else clause', function(done) {
    lightning.tmpl('<b>{{if a == 1}}foo{{/if}}</b>', {a: 3}, null, function(err, res){
      res.toString().should.eql('<b></b>');
      done();
    })
  });
  
  it('should support embedding tags', function(done) {
    lightning.tmpl('<b>{{if a == 1}}${b}{{/if}}</b>', {a: 1, b: 'boo'}, null, function(err, res){
      res.toString().should.eql('<b>boo</b>');
      done();
    })
  });
  
});