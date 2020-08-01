/*!
 * ${copyright}
 */
sap.ui.require([
	'sap/ui/model/odata/_AnnotationHelperBasics'
], function(Basics) {
	/*global deepEqual, equal, expect, module, notDeepEqual, notEqual, notPropEqual,
	notStrictEqual, ok, propEqual, sinon, strictEqual, test, throws,
	*/
	"use strict";

	//*********************************************************************************************
	module("sap.ui.model.odata._AnnotationHelperBasics");

	//*********************************************************************************************
	test("toJSON, toJavaScript, toErrorString", function () {
		var oCircular = {},
			fnTestFunction = function () {};

		[
			{value: undefined, json: undefined, js: "undefined"},
			{value: NaN, js: "NaN"},
			{value: Infinity, js: "Infinity"},
			{value: -Infinity, js: "-Infinity"},
			{value: null, json: "null"},
			{value: false, json: "false"},
			{value: 0, json: "0"},
			{value: "", json: "''"},
			{value: "foo", json: "'foo'"},
			{value: {}, json: "{}"},
			{value: {foo: 'bar'}, json: "{'foo':'bar'}"},
			{value: {foo: "b'ar"}, json: "{'foo':'b\\'ar'}"},
			{value: {foo: 'b"ar'}, json: "{'foo':'b\"ar'}"},
			{value: {foo: 'b\\ar'}, json: "{'foo':'b\\\\ar'}"},
			{value: {foo: 'b\\"ar'}, json: "{'foo':'b\\\\\"ar'}"},
			{value: {foo: 'b\tar'}, json: "{'foo':'b\\tar'}"}
		].forEach(function (oFixture) {
			var vJS = oFixture.hasOwnProperty("js") ? oFixture.js : oFixture.json;

			if (oFixture.hasOwnProperty("json")) {
				strictEqual(Basics.toJSON(oFixture.value), oFixture.json,
					"toJSON:" + oFixture.json);
			}
			strictEqual(Basics.toJavaScript(oFixture.value), vJS, "toJavaScript:" + vJS);
			strictEqual(Basics.toErrorString(oFixture.value), vJS, "toErrorString:" + vJS);
		});

		throws(function() {
			Basics.toJavaScript(fnTestFunction);
		}, /Cannot write a function to a Javascript string/, "toJavaScript: function");

		oCircular.circle = oCircular;

		strictEqual(Basics.toErrorString(oCircular), "[object Object]",
			"toErrorString: circular references");
		strictEqual(Basics.toErrorString(fnTestFunction), String(fnTestFunction),
			"toErrorString: function");
	});

	//*********************************************************************************************
	test("error", function () {
		var oPathValue = {path: "/path/to/foo", value: {foo: "bar"}};

		this.mock(jQuery.sap.log).expects("error").once().withExactArgs(
			oPathValue.path + ": Wrong! So wrong!", Basics.toErrorString(oPathValue.value),
			"sap.ui.model.odata.AnnotationHelper");

		throws(function () {
			Basics.error(oPathValue, "Wrong! So wrong!");
		}, SyntaxError);
	});

	//*********************************************************************************************
	test("expectType", function () {
		var aArray = [],
			oObject = {},
			sString = "foo",
			aTests = [aArray, oObject, sString, undefined, null, true, 0, NaN, Function];

		[
			{type: "array", ok: aArray},
			{type: "object", ok: oObject},
			{type: "string", ok: sString},
		].forEach(function (oFixture) {
			aTests.forEach(sinon.test(function (vTest) {
				var oPathValue = {
						path: "/my/path",
						value: vTest
					};

				if (vTest === oFixture.ok) {
					this.mock(Basics).expects("error").never();
				} else {
					this.mock(Basics).expects("error").once()
						.withExactArgs(oPathValue, "Expected " + oFixture.type);
				}

				Basics.expectType(oPathValue, oFixture.type);

				ok(true, "type=" + oFixture.type + ", test=" + Basics.toErrorString(vTest));
			}));
		});
	});

	//*********************************************************************************************
	[false, true].forEach(function (bTestProperty) {
		test("descend, bTestProperty=" + bTestProperty, function () {
			[
				{type: "object", property: "p", value: {p: "foo"}},
				{type: "array", property: 0, value: ["foo"]}
			].forEach(sinon.test(function (oFixture) {
				var oStart = {
						path: "/my/path",
						value: oFixture.value
					},
					oEnd = {
						path: "/my/path/" + oFixture.property,
						value: "foo"
					},
					oResult,
					oBasics = this.mock(Basics);

				oBasics.expects("expectType").withExactArgs(oStart, oFixture.type);
				if (bTestProperty) {
					oBasics.expects("expectType").withExactArgs(oEnd, "string");
				} else {
					oBasics.expects("expectType").never();
				}

				oResult = bTestProperty ?
					Basics.descend(oStart, oFixture.property, "string") :
					Basics.descend(oStart, oFixture.property);
				deepEqual(oResult, oEnd, oFixture.type);
			}));
		});
	});

	//*********************************************************************************************
	test("property", function () {
		var oPathValue = {};

		this.mock(Basics).expects("descend").once().withExactArgs(oPathValue, "p", "string")
			.returns({value: "foo"});

		strictEqual(Basics.property(oPathValue, "p", "string"), "foo");
	});

	//*********************************************************************************************
	test("resultToString", function () {
		[{
			value: {result: "binding", value: "path"},
			binding: "{path}",
			expression: "${path}"
		}, {
			value: {result: "binding", value: "{foo'bar}"},
			binding: "{path:'{foo\\'bar}'}",
			expression: "${path:'{foo\\'bar}'}"
		}, {
			value: {result: "constant", value: "{foo\\bar}"},
			binding: "\\{foo\\\\bar\\}",
			expression: "'{foo\\\\bar}'"
		}, {
			value: {result: "expression", value: "foo(${path})"},
			binding: "{=foo(${path})}",
			expression: "foo(${path})"
		}].forEach(function (oFixture) {
			strictEqual(Basics.resultToString(oFixture.value, false), oFixture.binding,
				oFixture.binding);
			strictEqual(Basics.resultToString(oFixture.value, true), oFixture.expression,
				oFixture.expression);
		});

		strictEqual(Basics.resultToString({result: "constant", value: Infinity}, true),
			"Infinity", "non-JSON constant");
		strictEqual(
			Basics.resultToString({result: "composite", value: "{FirstName} {LastName}"}, false),
			"{FirstName} {LastName}", "composite to binding");
		throws(function () {
			Basics.resultToString({result: "composite", value: "{FirstName} {LastName}"}, true)
		}, /Trying to embed a composite binding into an expression binding/,
			"composite to expression");
	});

	//*********************************************************************************************
	test("resultToString with type", function () {
		[{
			value: {type: "Edm.Boolean", constraints: {}},
			binding: ",type:'sap.ui.model.odata.type.Boolean'"
		}, {
			value: {type: "Edm.Byte", constraints: {nullable: false}},
			binding: ",type:'sap.ui.model.odata.type.Byte',constraints:{'nullable':false}"
		}, {
			value: {type: "Edm.DateTime", constraints: {displayFormat: "DateOnly"}},
			binding: ",type:'sap.ui.model.odata.type.DateTime'," +
				"constraints:{'displayFormat':'DateOnly'}"
		}, {
			value: {type: "Edm.DateTimeOffset", constraints: {nullable: false}},
			binding: ",type:'sap.ui.model.odata.type.DateTimeOffset',constraints:{'nullable':false}"
		}, {
			value: {type: "Edm.Decimal", constraints: {precision: 10, scale: "variable"}},
			binding: ",type:'sap.ui.model.odata.type.Decimal'," +
				"constraints:{'precision':10,'scale':'variable'}"
		}, {
			value: {type: "Edm.Double", constraints: {nullable: false}},
			binding: ",type:'sap.ui.model.odata.type.Double',constraints:{'nullable':false}"
		}, {
			value: {type: "Edm.Float"},
			binding: ",type:'sap.ui.model.odata.type.Single'"
		}, {
			value: {type: "Edm.Guid"},
			binding: ",type:'sap.ui.model.odata.type.Guid'"
		}, {
			value: {type: "Edm.Int16"},
			binding: ",type:'sap.ui.model.odata.type.Int16'"
		}, {
			value: {type: "Edm.Int32"},
			binding: ",type:'sap.ui.model.odata.type.Int32'"
		}, {
			value: {type: "Edm.Int64"},
			binding: ",type:'sap.ui.model.odata.type.Int64'"
		}, {
			value: {type: "Edm.SByte"},
			binding: ",type:'sap.ui.model.odata.type.SByte'"
		}, {
			value: {type: "Edm.String", constraints: {maxLength: 30}},
			binding: ",type:'sap.ui.model.odata.type.String',constraints:{'maxLength':30}"
		}, {
			value: {type: "Edm.Time"},
			binding: ",type:'sap.ui.model.odata.type.Time'"
		}, {
			value: {/*no type*/},
			binding: ""
		}].forEach(function (oFixture) {
			oFixture.value.result = "binding";
			oFixture.value.value = "foo/'bar'";
			strictEqual(Basics.resultToString(oFixture.value, false, true),
				"{path:'foo/\\'bar\\''" + oFixture.binding + "}",
				oFixture.value.type);
		});
	});
});
