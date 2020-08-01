'use strict';

var util       = require('util');
var ScriptBase = require('../script-base');

var MainGenerator = module.exports = function MainGenerator() {
  ScriptBase.apply(this, arguments);
};

util.inherits(MainGenerator, ScriptBase);

MainGenerator.prototype.createAppFile = function createAppFile() {
  this.angularModules = this.env.options.angularDeps;
  this.appTemplate('app', 'app/app/app');
};
