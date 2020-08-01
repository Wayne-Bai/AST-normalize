
/* engines/jade.js */

var app = protos.app;
var jade = protos.requireDependency('jade', 'Jade Engine');
var util = require('util');
var extend = protos.extend;

/**
  Jade engine class
  
  https://github.com/visionmedia/jade
 */

function Jade() {
  
  var opts = (app.config.engines && app.config.engines.jade) || {};
  
  this.options = protos.extend({
    pretty: true
  }, opts);
  
  this.module = jade;
  this.multiPart = false;
  this.extensions = ['jade', 'jade.html'];

}

util.inherits(Jade, protos.lib.engine);

Jade.prototype.render = function(data, vars, relPath) {
  data = app.applyFilters('jade_template', data);
  var tpl, func = this.getCachedFunction(arguments);
  if (func === null) {
  
    var filename = (relPath && relPath[0] == '/') ? relPath : app.fullPath(app.mvcpath + 'views/' + relPath);
    var options = extend({filename: filename}, this.options);
        
    func = jade.compile(data, options);
    this.cacheFunction(func, arguments);
  }
  return this.evaluate(func, arguments);
}

module.exports = Jade;
