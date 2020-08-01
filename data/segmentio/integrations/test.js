
var integrations = require('./index');
var assert = require('assert');

Object.keys(integrations).forEach(function(k){
  assert('Integration' === integrations[k].prototype.constructor.name);
});