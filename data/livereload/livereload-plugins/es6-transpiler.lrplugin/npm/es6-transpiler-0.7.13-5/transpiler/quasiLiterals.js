/*globals module,require*/
// @see http://www.nczonline.net/blog/2012/08/01/a-critical-review-of-ecmascript-6-quasi-literals/
"use strict";

const assert = require("assert");
const error = require("./../lib/error");
const core = require("./core");
const unicode = require("./unicode");

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
		let parent = node.$parent;

		if( parent.type === "TaggedTemplateExpression" ) {
			this.__replaceTaggedTemplateExpression(parent, node);
		}
		else {
			this.__replaceQuasiLiterals(node);
		}
	}

	, escape: function(templateString, options) {
		options = options || {};
		let raw = options.raw, compat = options.compat;
		var tt = templateString;

		templateString = templateString
			.replace(/([^\\]|^)"/g, "$1\\\"").replace(/([^\\]|^)"/g, "$1\\\"")
//			.replace(/\t/g, "\\t").replace(/\v/g, "\\v").replace(/\f/g, "\\f")
//			.replace(/\f/g, "\\f")
			//.replace(/\b/g, "\\b")
		;

		if ( compat ) {
			templateString = templateString.replace(/((?:\r\n)|\n)/g, function(found, group) {
				return "\\n";
//				return group === "\n" ? "\\n" : "\\r\\n";
			});
		}
		else {
			templateString = templateString.replace(/((?:\r\n)|\n)/g, function(found, group) {
				return "\\\n\\n";
//				return group === "\n" ? "\\\n\\n" : "\\\n\\r\\n";
			});
		}

		if ( raw ) {
//			templateString = templateString.replace(/\\/g, "\\\\");
		}

//		console.log(tt, raw, compat, '->', templateString);

		return templateString;
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
		let quasis = quasiContainer.quasis.map(function(quasi) {
			let valueNode = quasi.value, rawString = valueNode.raw;
			let unicodeResult = unicode.convert(rawString);
			if ( unicodeResult.changes ) {
				unicode.markToSkip(valueNode);
				rawString = unicodeResult.string;
			}
			return rawString;
		});

		let quasiRawString = quasis.map(function(quasiString) {
			return "\"" + this.escape(this.cleanupTemplateString(quasiString), {raw: true, compat: true}) + "\"";
		}, this).join(", ");

		let quasiCookedString = quasis.map(function(quasiString) {
			return "\"" + this.escape(this.cleanupTemplateString(quasiString), {compat: true}) + "\"";
		}, this).join(", ");

		let quasisesTmpKey;

		if( quasiRawString.length === quasiCookedString.length && quasiRawString === quasiCookedString ) {
			quasiRawString = null;
			quasisesTmpKey = quasiCookedString;
		}
		else {
			quasisesTmpKey = quasiCookedString + "|" + quasiRawString;
		}

		let temporaryVarName = this.quasisesTmp[quasisesTmpKey];
		if( !temporaryVarName ) {
			let nearestIIFENode = core.getNearestIIFENode(expressionContainer);
			if( !nearestIIFENode ) {
				nearestIIFENode = this.ast;
				assert(nearestIIFENode.type === "Program");
			}

			const _Object_freeze = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$freeze", "Object.freeze", false);
			const _Object_defineProperties = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$defProps", "Object.defineProperties", false);

			let quasiString, variableNamePlaceholder;
			if( !quasiRawString ) {
				variableNamePlaceholder = "%" + (Math.random() * 1e9 | 0) + "name" + (Math.random() * 1e9 | 0) + "%";
				quasiString = "[" + quasiCookedString + "];" + variableNamePlaceholder + " = " + _Object_freeze + "(" + _Object_defineProperties + "(" + variableNamePlaceholder + ", {\"raw\": {\"value\": " + variableNamePlaceholder + "}}))";
			}
			else {
				quasiString = _Object_freeze + "(" + _Object_defineProperties + "([" + quasiCookedString + "], {\"raw\": {\"value\": " + _Object_freeze + "([" + quasiRawString + "])}}))";
			}

			temporaryVarName = this.quasisesTmp[quasisesTmpKey] = core.bubbledVariableDeclaration(nearestIIFENode.$scope, "$TS", quasiString, false, variableNamePlaceholder);
		}

		let expressionsString = quasiContainer.expressions.map(function(expression) {
			return this.alter.get(expression.range[0], expression.range[1])
		}, this).join(", ");
		let resultString =
			"("
				+ temporaryVarName
				+ (expressionsString ? ", " + expressionsString : "")
				+ ")"
		;

		let start = quasiContainer.range[0], end = quasiContainer.range[1];

		let lineBreaks = this.alter.getRange(start, end).match(/[\r\n]/g) || [];
		this.alter.replace(
			start
			, end
			, resultString
			, {transform: function(str) {
				const newLineBreaks = str.match(/[\r\n]/g) || [];
				const newLineBreaksCount = newLineBreaks.length;

				if ( newLineBreaksCount < lineBreaks.length ) {
					str = str + lineBreaks.slice(newLineBreaksCount).join("");
				}
				return str;
			}}
		);

	}

	, __replaceQuasiLiterals: function(quasiContainer) {
		let quasis = quasiContainer.quasis
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

		for( let index = 0 ; index < quasisLength ; index++ ) {
			quasi = quasis[index];

			quasiString = this.escape(this.cleanupTemplateString(quasi.value.raw)
				/*.replace(/((?:\r\n)|\n)/g, "\\\n\\n")*/)
			;

			let unicodeResult = unicode.convert(quasiString);
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

for(let i in plugin) if( plugin.hasOwnProperty(i) && typeof plugin[i] === "function" ) {
	plugin[i] = plugin[i].bind(plugin);
}
