
var app = require('../fixtures/bootstrap'),
    vows = require('vows'),
    assert = require('assert'),
    Multi = require('multi'),
    EventEmitter = require('events').EventEmitter;
    
var multi;

vows.describe('BCrypt (middleware)').addBatch({
  
  '': {
    
    topic: function() {
      var promise = new EventEmitter(); 

      app.use('bcrypt');
      multi = new Multi(app.bcrypt);
      
      var pass='hello', hash;

      app.bcrypt.hashPassword(pass, function(err, h) {
        hash = h;
        app.bcrypt.checkPassword(pass, h, function(err, valid) {
          promise.emit('success', [hash, valid]);
        });
      });

      return promise;
    },
    
    'Successfully hashes & verifies passwords': function(results) {
      var hash = results[0],
          valid = results[1];
      assert.equal(hash.length, 60);
      assert.isTrue(hash.charAt(0) == '$');
      assert.isTrue(valid);
    }
    
  }
  
}).export(module);
