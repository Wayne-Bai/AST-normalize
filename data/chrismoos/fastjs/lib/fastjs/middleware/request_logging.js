var sys = require('sys');
var log = require('fastjs/logger').getLogger('RequestLogger');

exports.call = function(env) {
  var items = [
    env['fastjs.request']['method'],
    env['fastjs.path_info'].pathname,
    " - " + env['fastjs.request']['socket']['remoteAddress']
  ];
  
  log.info(items.join(' '));
  
  return false;
};