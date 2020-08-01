'use strict';

var winston = require('winston');
var path = require('path');
var glob = require('glob');

function load (pattern) {
  var modules = glob.sync(pattern, { cwd: __dirname });
  var index = modules.indexOf(path.basename(__filename));
  if (index !== -1) {
    modules.splice(index, 1);
  }
  return modules.map(unwrap).reduce(keys, {});

  function keys (accumulator, model, i) {
    var name = path.basename(modules[i], '.js');
    accumulator[name] = model;
    return accumulator;
  }
}

function unwrap (file) {
  winston.debug('Loading %s model', path.basename(file, '.js'));
  return require(path.join(__dirname, file));
}

module.exports = function () {
  var models = load('*.js');
  load('hooks/*.js');
  return models;
};
