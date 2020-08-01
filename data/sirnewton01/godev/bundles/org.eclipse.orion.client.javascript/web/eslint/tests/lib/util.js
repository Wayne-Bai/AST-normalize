/*******************************************************************************
 * @license
 * Copyright (c) 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *	 IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env mocha, node, amd*/
define([
"chai/chai", 
"eslint/util"
], function(assert, util) {
	assert = assert.assert /*chai*/ || assert;

	describe("ESLint Util Tests", function() {
		var topic = function() {
			var a = {}, b = { foo: "f", bar: 1 };
			util.mixin(a, b);
			return [a, b];
		};

		it("should add properties to target object", function() {
			var a = topic()[0];
			assert.equal(Object.keys(a).length, 2);
			assert.equal(a.foo, "f");
			assert.equal(a.bar, 1);
		});

		it("should not change the source object", function() {
			var b = topic()[1];
			assert.equal(Object.keys(b).length, 2);
			assert.equal(b.foo, "f");
			assert.equal(b.bar, 1);
		});
	});

});