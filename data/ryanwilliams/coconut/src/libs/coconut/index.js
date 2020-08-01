var util = require('util');

/** @namespace */
var coconut = util.populateIndex(module, 'World Map');

module.exports.components = require('./components');
module.exports.entities = require('./entities');
