/*global module, expect, deepEqual, ok, test, equal */
/*jshint strict: false */

module("core");
test("jQuery.extend(Object, Object)", function() {
	expect(28);

	var settings = { "xnumber1": 5, "xnumber2": 7, "xstring1": "peter", "xstring2": "pan" },
		options = { "xnumber2": 1, "xstring2": "x", "xxx": "newstring" },
		optionsCopy = { "xnumber2": 1, "xstring2": "x", "xxx": "newstring" },
		merged = { "xnumber1": 5, "xnumber2": 1, "xstring1": "peter", "xstring2": "x", "xxx": "newstring" },
		deep1 = { "foo": { "bar": true } },
		deep2 = { "foo": { "baz": true }, "foo2": document },
		deep2copy = { "foo": { "baz": true }, "foo2": document },
		deepmerged = { "foo": { "bar": true, "baz": true }, "foo2": document },
		arr = [1, 2, 3],
		nestedarray = { "arr": arr };

	window.extend(settings, options);
	deepEqual( settings, merged, "Check if extended: settings must be extended" );
	deepEqual( options, optionsCopy, "Check if not modified: options must not be modified" );

	window.extend(settings, null, options);
	deepEqual( settings, merged, "Check if extended: settings must be extended" );
	deepEqual( options, optionsCopy, "Check if not modified: options must not be modified" );

	window.extend(true, deep1, deep2);
	deepEqual( deep1["foo"], deepmerged["foo"], "Check if foo: settings must be extended" );
	deepEqual( deep2["foo"], deep2copy["foo"], "Check if not deep2: options must not be modified" );
	equal( deep1["foo2"], document, "Make sure that a deep clone was not attempted on the document" );

	ok( window.extend(true, {}, nestedarray)["arr"] !== arr, "Deep extend of object must clone child array" );

	// #5991
	ok( window.isArray( window.extend(true, { "arr": {} }, nestedarray)["arr"] ), "Cloned array heve to be an Array" );
	ok( window.isPlainObject( window.extend(true, { "arr": arr }, { "arr": {} })["arr"] ), "Cloned object heve to be an plain object" );

	var empty = {};
	var optionsWithLength = { "foo": { "length": -1 } };
	window.extend(true, empty, optionsWithLength);
	deepEqual( empty["foo"], optionsWithLength["foo"], "The length property must copy correctly" );

	empty = {};
	var optionsWithDate = { "foo": { "date": new Date() } };
	window.extend(true, empty, optionsWithDate);
	deepEqual( empty["foo"], optionsWithDate["foo"], "Dates copy correctly" );

	/** @constructor */
	var myKlass = function() {};
	var customObject = new myKlass();
	var optionsWithCustomObject = { "foo": { "date": customObject } };
	empty = {};
	window.extend(true, empty, optionsWithCustomObject);
	ok( empty["foo"] && empty["foo"]["date"] === customObject, "Custom objects copy correctly (no methods)" );

	// Makes the class a little more realistic
	myKlass.prototype = { "someMethod": function(){} };
	empty = {};
	window.extend(true, empty, optionsWithCustomObject);
	ok( empty["foo"] && empty["foo"]["date"] === customObject, "Custom objects copy correctly" );

	var MyNumber = Number;
	var ret = window.extend(true, { "foo": 4 }, { "foo": new MyNumber(5) } );
	ok( ret.foo == 5, "Wrapped numbers copy correctly" );

	var nullUndef;
	nullUndef = window.extend({}, options, { "xnumber2": null });
	ok( nullUndef["xnumber2"] === null, "Check to make sure null values are copied");

	nullUndef = window.extend({}, options, { "xnumber2": undefined });
	ok( nullUndef["xnumber2"] === options["xnumber2"], "Check to make sure undefined values are not copied");

	nullUndef = window.extend({}, options, { "xnumber0": null });
	ok( nullUndef["xnumber0"] === null, "Check to make sure null values are inserted");

	var target = {};
	var recursive = { foo:target, bar:5 };
	window.extend(true, target, recursive);
	deepEqual( target, { bar:5 }, "Check to make sure a recursive obj doesn't go never-ending loop by not copying it over" );

	ret = window.extend(true, { foo: [] }, { foo: [0] } ); // 1907
	equal( ret.foo.length, 1, "Check to make sure a value with coersion 'false' copies over when necessary to fix #1907" );

	ret = window.extend(true, { foo: "1,2,3" }, { foo: [1, 2, 3] } );
	ok( typeof ret.foo != "string", "Check to make sure values equal with coersion (but not actually equal) overwrite correctly" );

	ret = window.extend(true, { foo:"bar" }, { foo:null } );
	ok( typeof ret.foo !== "undefined", "Make sure a null value doesn't crash with deep extend, for #1908" );

	var obj = { foo:null };
	window.extend(true, obj, { foo:"notnull" } );
	equal( obj.foo, "notnull", "Make sure a null value can be overwritten" );

	function func() {}
	window.extend(func, { key: "value" } );
	equal( func.key, "value", "Verify a function can be extended" );

	var defaults = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
		defaultsCopy = { xnumber1: 5, xnumber2: 7, xstring1: "peter", xstring2: "pan" },
		options1 = { xnumber2: 1, xstring2: "x" },
		options1Copy = { xnumber2: 1, xstring2: "x" },
		options2 = { xstring2: "xx", xxx: "newstringx" },
		options2Copy = { xstring2: "xx", xxx: "newstringx" },
		merged2 = { xnumber1: 5, xnumber2: 1, xstring1: "peter", xstring2: "xx", xxx: "newstringx" };

	settings = window.extend({}, defaults, options1, options2);
	deepEqual( settings, merged2, "Check if extended: settings must be extended" );
	deepEqual( defaults, defaultsCopy, "Check if not modified: options1 must not be modified" );
	deepEqual( options1, options1Copy, "Check if not modified: options1 must not be modified" );
	deepEqual( options2, options2Copy, "Check if not modified: options2 must not be modified" );
});
