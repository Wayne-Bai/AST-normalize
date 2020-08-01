/*global module, expect, test, equal */
/*jshint strict: false */
module("core");

test("jQuery.proxy", function(){
	expect(7);

	var test = function(){ equal( this, thisObject, "Make sure that scope is set properly." ); };
	var thisObject = { foo: "bar", method: test };

	// Make sure normal works
	test.call( thisObject );

	// Basic scoping
	window.proxy( test, thisObject )();

	// Another take on it
	window.proxy( thisObject, "method" )();

	// Make sure it doesn't freak out
	equal( window.proxy( null, thisObject ), undefined, "Make sure no function was returned." );

	// Partial application
	var test2 = function( a ){ equal( a, "pre-applied", "Ensure arguments can be pre-applied." ); };
	window.proxy( test2, null, "pre-applied" )();

	// Partial application w/ normal arguments
	var test3 = function( a, b ){ equal( b, "normal", "Ensure arguments can be pre-applied and passed as usual." ); };
	window.proxy( test3, null, "pre-applied" )( "normal" );

	// Test old syntax
	var test4 = { "meth": function( a ){ equal( a, "boom", "Ensure old syntax works." ); } };
	window.proxy( test4, "meth" )( "boom" );
});
