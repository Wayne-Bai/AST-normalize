'use strict';

var methodOverride = require('method-override');

module.exports = function create(getter) {
  return methodOverride(function(req, res) {
    if(req.body && typeof req.body === 'object' && getter in req.body) {
      var method = req.body._method;
      delete req.method._method;
      return method;
    }
  });
};
