// @see http://www.nczonline.net/blog/2012/08/01/a-critical-review-of-ecmascript-6-quasi-literals/
"use strict";

var assert = require("assert");
var error = require("./../lib/error");
var core = require("./core");
var unicode = require("./unicode");

var plugin = module.exports = {
	reset: function() {
		this.quasisesTmp = {};
	}

	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;
		this.ast = ast;
		this.options = options;
	}

	, '::TemplateLiteral': function(node) {
		var parent = node.$parent;

		if( parent.type === "TaggedTemplateExpression" ) {
			this.__replaceTaggedTemplateExpression(parent, node);
		}
		else {
			this.__replaceQuasiLiterals(node);
		}
	}

	, escapeQuoters: function(templateString) {
		return templateString
			.replace(/([^\\]|^)"/g, "$1\\\"").replace(/([^\\]|^)"/g, "$1\\\"")
		;
	}

	, cleanupTemplateString: function(templateString) {
		return templateString
//			.replace(/([^\\]|^)"/g, "$1\\\"").replace(/([^\\]|^)"/g, "$1\\\"")//need it twice for `""`
			.replace(/([^\\]|^)\\`/g, "$1`").replace(/([^\\]|^)\\`/g, "$1`")//need it twice for `\`\``
			.replace(/([^\\]|^)\\\$/g, "$1$").replace(/([^\\]|^)\\\$/g, "$1$")//need it twice for `\$\$`
			.replace(/([^\\]|^)\\{/g, "$1{").replace(/([^\\]|^)\\{/g, "$1{")//need it twice for `\{\{`
		;
	}

	, __replaceTaggedTemplateExpression: function(expressionContainer, quasiContainer) {
		var quasis = quasiContainer.quasis.map(function(quasi) {
			var valueNode = quasi.value, rawString = valueNode.raw;
			var unicodeResult = unicode.convert(rawString);
			if ( unicodeResult.changes ) {
				unicode.markToSkip(valueNode);
				rawString = unicodeResult.string;
			}
			return rawString;
		});

		var quasiRawString = quasis.map(function(quasiString) {
			return "\"" + this.cleanupTemplateString(quasiString).replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
		}, this).join(", ");

		var quasiCookedString = quasis.map(function(quasiString) {
			return "\"" + this.escapeQuoters(this.cleanupTemplateString(quasiString)) + "\"";
		}, this).join(", ");

		var quasisesTmpKey;

		if( quasiRawString.length === quasiCookedString.length && quasiRawString === quasiCookedString ) {
			quasiRawString = null;
			quasisesTmpKey = quasiCookedString;
		}
		else {
			quasisesTmpKey = quasiCookedString + "|" + quasiRawString;
		}

		var temporaryVarName = this.quasisesTmp[quasisesTmpKey];
		if( !temporaryVarName ) {
			var nearestIIFENode = core.getNearestIIFENode(expressionContainer);
			if( !nearestIIFENode ) {
				nearestIIFENode = this.ast;
				assert(nearestIIFENode.type === "Program");
			}

			var _Object_freeze = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$freeze", "Object.freeze", false);
			var _Object_defineProperties = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$defProps", "Object.defineProperties", false);

			var quasiString, variableNamePlaceholder;
			if( !quasiRawString ) {
				variableNamePlaceholder = "%" + (Math.random() * 1e9 | 0) + "name" + (Math.random() * 1e9 | 0) + "%";
				quasiString = "[" + quasiCookedString + "];" + variableNamePlaceholder + " = " + _Object_freeze + "(" + _Object_defineProperties + "(" + variableNamePlaceholder + ", {\"raw\": {\"value\": " + variableNamePlaceholder + "}}))";
			}
			else {
				quasiString = _Object_freeze + "(" + _Object_defineProperties + "([" + quasiCookedString + "], {\"raw\": {\"value\": " + _Object_freeze + "([" + quasiRawString + "])}}))";
			}

			temporaryVarName = this.quasisesTmp[quasisesTmpKey] = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$TS", quasiString, false, variableNamePlaceholder);
		}

		var expressionsString = quasiContainer.expressions.map(function(expression) {
			return this.alter.get(expression.range[0], expression.range[1])
		}, this).join(", ");
		var resultString =
			"("
				+ temporaryVarName
				+ (expressionsString ? ", " + expressionsString : "")
				+ ")"
		;

		this.alter.replace(
			quasiContainer.range[0]
			, quasiContainer.range[1]
			, resultString
		);

	}

	, __replaceQuasiLiterals: function(quasiContainer) {
		var quasis = quasiContainer.quasis
			, quasisLength = quasis.length
			, quasi
			, quasiString
			, expressions = quasiContainer.expressions
			, expressionsLength = quasiContainer.expressions.length
			, expression
			, expressionType
			, resultString = "("
			, theOnlyOne = quasisLength === 2 && quasis[1].value.raw === '' && quasis[1].value.cooked === ''
		;

		if( theOnlyOne ) {
			quasisLength--;//remove tail
		}

		for( var index = 0 ; index < quasisLength ; index++ ) {
			quasi = quasis[index];

			quasiString = this.escapeQuoters(this.cleanupTemplateString(quasi.value.raw)
				.replace(/((?:\r\n)|\n)/g, "\\\n\\n"))
			;

			var unicodeResult = unicode.convert(quasiString);
			if ( unicodeResult.changes ) {
				unicode.markToSkip(quasi.value);
				quasiString = unicodeResult.string;
			}

			expression = index < expressionsLength// or checking quasi.tail === true
				? expressions[index]
				: null
			;

			expressionType = expression
				? (
					expression.type === "Identifier"
						? 1 // simple
						: 2 // compound
				)
				: null
			;

			resultString += (
				(index ? " + " : "")
				+ (expression && !theOnlyOne ? "(" : "")
				+ "\""
				+ quasiString
				+ (expression
					? ("\" + " + (expressionType === 2 ? "(" : "") + this.alter.get(expression.range[0], expression.range[1]))
						+ (expressionType === 2 ? ")" : "")
						+ (theOnlyOne ? "" : ")")
					: "\"")
			);
		}

		resultString += ")";

		this.alter.replace(
			quasiContainer.range[0]
			, quasiContainer.range[1]
			, resultString
		);
	}
};

for(var i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
