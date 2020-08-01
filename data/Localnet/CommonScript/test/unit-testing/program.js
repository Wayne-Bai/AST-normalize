var assert = require("lib/assert");

exports['test AssertionError instanceof Error'] = function () {
	assert.ok(new assert.AssertionError({}) instanceof Error);
};

exports['test ok false'] = function() {
	assert.error(function() { assert.ok(false); });
};

exports['test ok true'] = function() {
	assert.ok(true);
};

exports['test ok "test"'] = function() {
	assert.ok("test");
};

exports['test equal true false'] = function () {
	assert.error(function() { assert.equal(true, false); });
};

exports['test equal null null'] = function() {
	assert.equal(null, null);
};

exports['test equal undefined undefined'] = function() {
	assert.equal(undefined, undefined);
};

exports['test equal null undefined'] = function() {
	assert.equal(null, undefined);
};

exports['test equal 2 "2"'] = function() {
	assert.equal(2, "2");
};

exports['test equal "2" 2'] = function() {
	assert.equal("2", 2);
};

exports['test equal true true'] = function() {
	assert.equal(true, true);
};

exports['test notEqual true false'] = function() {
	assert.notEqual(true, false);
};

exports['test notEqual true true'] = function () {
	assert.error(function() { assert.notEqual(true, true); });
};

exports['test strictEqual 2 "2"'] = function () {
	assert.error(function() { assert.strictEqual(2, "2"); });
};

exports['test strictEqual null undefined'] = function () {
	assert.error(function() { assert.strictEqual(null, undefined); });
};

exports['test notStrictEqual 2 "2"'] = function() {
	assert.notStrictEqual(2, "2");
};

exports['test deepEqual date'] = function() {
	assert.deepEqual(new Date(2000, 3, 14), new Date(2000, 3, 14));
};

exports['test deepEqual date negative'] = function () {
	assert.error(function() { assert.deepEqual(new Date(), new Date(2000, 3, 14)); });
};

exports['test deepEqual 4 "4"'] = function() {
	assert.deepEqual(4, "4");
};

exports['test deepEqual "4" 4'] = function() {
	assert.deepEqual("4", 4);
};

exports['test deepEqual true 1'] = function() {
	assert.deepEqual(true, 1);
};

exports['test deepEqual 4 "5"'] = function () {
	assert.error(function() { assert.deepEqual(4, "5"); });
};

exports['test deepEqual {a: 4} {a: 4}'] = function() {
	assert.deepEqual({a: 4}, {a: 4});
};

exports['test deepEqual {a: 4, b: "2"} {a: 4, b: "2"}'] = function() {
	assert.deepEqual({a: 4, b: "2"}, {a: 4, b: "2"});
};

exports['test deepEqual [4] ["4"]'] = function() {
	assert.deepEqual([4], ['4']);
};

exports['test deepEqual {a: 4} {a: 4, b: true}'] = function () {
	assert.error(function() { assert.deepEqual({a: 4}, {a: 4, b: true}); });
};

exports['test deepEqual ["a"], {0: "a"}'] = function() {
	assert.deepEqual(["a"], {0: "a"});
};

exports['test deepEqual {a: 4, b: "1"} {b: "1", a: 4}'] = function() {
	assert.deepEqual({a: 4, b: "1"}, { b: "1", a: 4});
};

exports['test deepEqual arrays with non-numeric properties'] = function () {
	var a1 = [1, 2, 3], a2 = [1, 2, 3];

	a1.a = "test";
	a1.b = true;
	a2.b = true;
	a2.a = "test"

	assert.error(function() { assert.deepEqual(Object.keys(a1), Object.keys(a2)); });
	assert.deepEqual(a1, a2);
};

exports['test deepEqual identical prototype'] = function () {
	var nbRoot = {
		toString: function() { return this.first + " " + this.last; }
	};

	var nameBuilder = function(first, last) {
		this.first = first;
		this.last = last;
		return this;
	};

	nameBuilder.prototype = nbRoot;

	var nameBuilder2 = function(first, last) {
		this.first = first;
		this.last = last;
		return this;
	};

	nameBuilder2.prototype = nbRoot;

	var nb1 = new nameBuilder("Ryan", "Dahl");
	var nb2 = new nameBuilder2("Ryan", "Dahl");

	assert.deepEqual(nb1, nb2);

	nameBuilder2.prototype = Object;
	nb2 = new nameBuilder2("Ryan", "Dahl");
	assert.error(function() { assert.deepEqual(nb1, nb2); });
};

exports['test deepEqual "a" {}'] = function () {
	assert.error(function() { assert.deepEqual("a", {}); });
};

exports['test deepEqual "" ""'] = function () {
	assert.deepEqual("", "");
};

exports['test deepEqual "" [""]'] = function () {
	assert.error(function() { assert.deepEqual("", [""]); });
};

exports['test deepEqual [""] [""]'] = function () {
	assert.deepEqual([""], [""]);
};

exports['test error AssertionError'] = function () {
	var error = false;

	function thrower(constructor) {
		throw new constructor("test");
	}

	assert.error(function() { thrower(assert.AssertionError); }, assert.AssertionError, "message");
	assert.error(function() { thrower(assert.AssertionError); }, assert.AssertionError);
	assert.error(function() { thrower(assert.AssertionError); });
	assert.error(function() { thrower(TypeError); } );

	try {
		assert.error(function() { thrower(TypeError); }, assert.AssertionError);
	} catch(e) {
		error = true;
		assert.ok(e instanceof TypeError, "type");
	}

	assert.ok(error);
};
