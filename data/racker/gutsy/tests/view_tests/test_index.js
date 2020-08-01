var base = require('./base');

exports.test_example_minimum_none = function(test, assert) {
  base.test_view(test, assert, 'index.jade', 'example-minimum.json');
};

exports.test_example_simple_none = function(test, assert) {
  base.test_view(test, assert, 'index.jade', 'example-simple.json');
};

exports.test_example_full_none = function(test, assert) {
  base.test_view(test, assert, 'index.jade', 'example-full.json');
};
