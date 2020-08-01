var sys = require('sys');
var log = require('fastjs/logger').getLogger('Dispatcher');
var kiwi = require('kiwi');
var haml = kiwi.require('haml');
var fs = require('fs');

var dispatch = function(module, fn, env) {
  this.log = require('../logger').getLogger(module);
  
  this.render_haml = function(tpl, vars) {
    var file = env['fastjs.settings']['server.dir'] + '/app/views/' + module + '/' + (tpl ? tpl : fn.toString()) + '.haml';
    fs.readFile(file, function (err, data) {
      if(err) throw err;
      
      log.info("Rendering " + file);
      var html = haml.render(data, {locals: vars ? vars : {}});
      env['fastjs.response'].sendResponse(200, html, {"Content-Type": "text/html"});
    });
  };
};

exports.call = function(env) {
  var router = env['fastjs.router'];
  var match = router.match(env['fastjs.path_info'].pathname);
  if(match) {
    log.info("Dispatching to: " + match.module + "." + match.fn);
    var module = require(env['fastjs.settings']['server.dir'] + '/app/modules/' + match.module);
    module[match.fn].apply(new dispatch(match.module, match.fn, env));
    return true;
  }
  
  return false;
};