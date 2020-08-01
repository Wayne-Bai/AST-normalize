module.declare(
	["lib/assert", "submodule/a", "submodule/b"],
	function(require, exports, module) {
		var assert = require("lib/assert");
		var a = require("submodule/a");
		var b = require("submodule/b");

		exports['test module relative'] = function() {
			assert.equal(a.foo, b.foo);
		};
	}
);
