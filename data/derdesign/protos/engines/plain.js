
/* engines/plain.js */

var util = require('util');

/**
  Plain engine class
 */

function Plain() {

  this.module = null;
  this.multiPart = true;
  this.extensions = ['txt', 'txt.html'];

}

util.inherits(Plain, protos.lib.engine);

Plain.prototype.render = function(data) {
  var tpl, func = this.getCachedFunction(arguments);
  if (func === null) {
    func = function() {
      return data;
    }
    this.cacheFunction(func, arguments);
  }
  return this.evaluate(func, arguments);
}

module.exports = Plain;
