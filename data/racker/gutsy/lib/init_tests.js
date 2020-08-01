
var settings = require('./settings');

exports.init = function(cb){
  settings.testing = true;
  return cb();
};