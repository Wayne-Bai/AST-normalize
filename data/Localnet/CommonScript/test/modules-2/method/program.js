module.declare(
	["lib/assert", "a"],
	function(require, exports, module) {
		var assert = require('lib/assert');
		var a = require("a");
		var foo = a.foo;

		exports['test module method 1'] = function() {
			assert.equal(a.foo(), a);
		};

		exports['test module method 2'] = function() {
			assert.equal(foo(), function() { return this; });
		};

		exports['test module method 2'] = function() {
			a.set(10);
			assert.equal(a.get(), 10);
		};
	}
);
