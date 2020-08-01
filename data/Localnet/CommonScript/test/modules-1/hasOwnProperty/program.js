var assert = require("lib/assert");
var own_property = require("hasOwnProperty");
var to_string = require("toString");

exports['test module hasOwnProperty'] = function() {
	assert.deepEqual(own_property, to_string);
};
