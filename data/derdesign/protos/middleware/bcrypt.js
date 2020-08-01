
/**
  BCrypt
  
  Provides Blowfish encryption capabilities for the application.
  
  » References:
  
    https://github.com/ncb000gt/node.bcrypt.js
    http://codahale.com/how-to-safely-store-a-password/
    
  » Configuration Options
  
    {int} rounds: Number of rounds to process the data for
    {int} seedLength: Seed length to pass to rand bytes
  
  */

var app = protos.app,
    bcrypt = protos.requireDependency('bcrypt', 'BCrypt Middleware');
    
var config;
    
function Blowfish(cfg, middleware) {
  
  app[middleware] = this;
  
  // Middleware configuration
  this.config = config = protos.extend({
    rounds: 10,
    seedLength: 20
  }, cfg);
  
}

/**
  Hashes a password
  
  @param {string} password
  @param {function} callback
  @public
 */

Blowfish.prototype.hashPassword = function(password, callback) {
  var self = this;
  bcrypt.genSalt(config.rounds, config.seedLength, function(err, salt) {
    if (err) callback.call(self, err, null);
    else {
      bcrypt.hash(password, salt, function(err, pass) {
        if (err) callback.call(self, err, null);
        else callback.call(self, null, pass);
      });
    }
  });
}

/**
  Compares a password against a hash, and returns its validity (boolean).
  
  @param {string} password
  @param {string} hash
  @param {function} callback
  @public
 */

Blowfish.prototype.checkPassword = function(password, hash, callback) {
  var self = this;
  bcrypt.compare(password, hash, function(err, pass) {
    if (err) callback.call(self, err, null);
    else callback.call(self, null, pass);
  });
}

module.exports = Blowfish;
