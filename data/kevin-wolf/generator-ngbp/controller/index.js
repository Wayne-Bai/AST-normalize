'use strict';

var util       = require('util');
var ScriptBase = require('../script-base');

var MainGenerator = module.exports = function MainGenerator() {
  ScriptBase.apply(this, arguments);
};

util.inherits(MainGenerator, ScriptBase);

MainGenerator.prototype.createController = function createController() {
  this.generateSourceAndTest('controller', 'Ctrl', '', this.destPath, 'controllers');
};
