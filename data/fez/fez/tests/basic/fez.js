var fez = require("../../src/main.js"),
    Promise = require("bluebird");

function nop() { return null; }

exports.build = function(spec) {
  spec.with("a").each(function(file) {
    spec.rule(file, "b", nop);
  });

  spec.with("b").each(function(file) {
    spec.rule(file, "c", nop);
  });
};

exports.default = exports.build;

fez(module);
