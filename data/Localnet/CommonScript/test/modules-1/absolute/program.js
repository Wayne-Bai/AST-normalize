var assert = require("lib/assert");
var a = require("submodule/a");
var b = require("b");

exports['test module absolute'] = function() {
	assert.strictEqual(a.foo().foo, b.foo);
};
