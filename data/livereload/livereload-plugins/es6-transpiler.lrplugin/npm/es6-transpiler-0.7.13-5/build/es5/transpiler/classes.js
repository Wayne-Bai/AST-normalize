"use strict";

var assert = require("assert");
var core = require("./core");

var objectMixin =
		"function(t,s){"
			+ "for(var p in s){"
				+ "if(s.hasOwnProperty(p)){"
					+ "Object.defineProperty(t,p,Object.getOwnPropertyDescriptor(s,p));"
				+ "}"
			+ "}"
		+ "return t}"
	;

var classesTranspiler = {
	reset: function() {
		this.__currentClassMethodsStatic = null;
		this.__currentClassName = null;
		this.__currentSuperRefName = null;
		this.__currentAccessors = null;
		this.__currentStaticAccessors = null;
		this.__currentFirstStaticAccessor = null;
		this.__objectMixinFunctionName = null;
	}

	, setup: function(alter, ast, options) {
		if( !this.__isInit ) {
			this.reset();
			this.__isInit = true;
		}

		this.alter = alter;
	}

	, createPrototypeString: function(node, className, superName, accessors) {
		var accessorsKeys = Object.keys(accessors);

		var accessorsString = accessorsKeys.map(function(key) {
			var accessor = accessors[key];
			var raw = accessor.raw, getter = accessor.get, setter = accessor.set;
			return (raw || key) + ": {" + (getter ? "\"get\": " + getter + ", " : "") + (setter ? "\"set\": " + setter + ", " : "") + "\"configurable\": true, \"enumerable\": true}"
		} ).join(", ");

		if ( superName ) {
			return className
				+ ".prototype = Object.create(" + superName + ".prototype"
				+ ", {"
				+ "\"constructor\": {\"value\": " + className + ", \"configurable\": true, \"writable\": true}"
				+ (accessorsString ? ", " + accessorsString : "")
				+ " }"
				+ ");"
			;
		}
		else if ( accessorsString ) {
			return "Object.defineProperties("
				+ className	+ ".prototype, {" + accessorsString + "});"
			;
		}
		else {
			return "";
		}
	}

	, createStaticAccessorsDefinitionString: function(node, recipientStr, accessors) {
		var accessorsKeys = Object.keys(accessors);

		if ( !accessorsKeys.length ) {
			return "";
		}

		return ";Object.defineProperties(" + recipientStr + ", {" + accessorsKeys.map(function(key) {
			var accessor = accessors[key];
			var raw = accessor.raw, getter = accessor.get, setter = accessor.set;
			return (raw || key) + ": {" + (getter ? "\"get\": " + getter + ", " : "") + (setter ? "\"set\": " + setter : "") + ", \"configurable\": true, \"enumerable\": true}"
		} ).join(", ") + "});";
	}

	, ':: ClassDeclaration': function replaceClassBody(node, astQuery) {
		{
			if( !this.__currentSuperRefName ) {
				// We need only one unique 'super' name for the entire file
				this.__currentSuperRefName = core.unique("super", true);
			}

			var nodeId = node.id
				, classBodyNodes = node.body.body
				, currentClassName = nodeId.name
				, SUPER_NAME = this.__currentSuperRefName
			;

			var classStr
				, superClass = node.superClass
				, classBodyNodesCount = classBodyNodes.length
				, insertAfterBodyBegin_string
				, classConstructor
				, extendedClassConstructorPostfix
				, objectMixinFunctionName
			;

			assert(nodeId && nodeId.type === "Identifier");

			this.__currentClassName = currentClassName;

			classStr = "var " + currentClassName + " = (function(";

			if( superClass ) {
				objectMixinFunctionName = core.bubbledVariableDeclaration(node.$scope, "MIXIN", objectMixin);

				classStr += SUPER_NAME;
				superClass = superClass.name;

				insertAfterBodyBegin_string = objectMixinFunctionName + "(" + currentClassName + ", " + SUPER_NAME + ");";
			}

			classStr += ")";

			for( var i = 0 ; i < classBodyNodesCount && !classConstructor ; i++ ) {
				classConstructor = classBodyNodes[i];
				if( classConstructor.type !== "MethodDefinition" ) {
					classConstructor = null;
				}
				else if( classConstructor.key.name !== "constructor" ) {
					classConstructor = null;
				}
			}

			this.__currentAccessors = {};
			this.__currentStaticAccessors = {};
			if( classBodyNodesCount ) {
				for ( var i$0 = 0 ; i$0 < classBodyNodesCount ; i$0++ ) {
					this.replaceClassMethods(classBodyNodes[i$0], astQuery);
				}
			}

			extendedClassConstructorPostfix = this.createPrototypeString(node, currentClassName, superClass && SUPER_NAME, this.__currentAccessors);
			var staticAccessorsDefinitionString = this.createStaticAccessorsDefinitionString(node, currentClassName, this.__currentStaticAccessors);

			if( classConstructor ) {
				this.alter.replace(classConstructor.key.range[0], classConstructor.key.range[1], "function " + currentClassName);
				if( extendedClassConstructorPostfix ) {
					this.alter.insert(classConstructor.range[1], extendedClassConstructorPostfix);
				}

				astQuery.traverse(classConstructor, this.replaceClassConstructorSuper);
			}
			else {
				this.alter.insert(
					node.body.range[0] + 1
					, "function " + currentClassName + "() {return "
						+ (superClass ? SUPER_NAME + ".apply(this, arguments)" : "this")
						+ "}" + (insertAfterBodyBegin_string || "") + (extendedClassConstructorPostfix || "")
					, {before: true}
				);
				insertAfterBodyBegin_string = null;
			}

			if ( insertAfterBodyBegin_string ) {
				this.alter.insert(node.body.range[0] + 1, insertAfterBodyBegin_string);
			}

			if ( staticAccessorsDefinitionString ) {
				this.alter.insertAfter(this.__currentFirstStaticAccessor.range[1], staticAccessorsDefinitionString);
			}

			// replace class definition
			// text change 'class A[ extends B]' => 'var A = (function([0$0])'
			this.alter.replace(node.range[0], node.body.range[0], classStr);

			this.alter.insert(node.range[1] - 1, ";return " + currentClassName + ";");

			this.alter.insert(node.range[1], ")(" + (superClass || "") + ");");

			this.__currentClassName = null;
		}
	}

	, unwrapSuperCall: function unwrapSuperCall(node, calleeNode, isStatic, property, isConstructor) {
		var superRefName = this.__currentSuperRefName;
		assert(superRefName);

		var changeStr = superRefName + (isStatic ? "" : ".prototype");
		var callArguments = node.arguments;
		var hasSpreadElement = !isStatic && callArguments.some(function(node){ return node.type === "SpreadElement" });

		var changesEnd;
		if( (!isStatic || isConstructor) && !hasSpreadElement ) {
			changeStr += (property ? "." + property.name : "");

			if( !callArguments.length ) {
				changeStr += ".call(this)";
				changesEnd = node.range[1];
			}
			else {
				changeStr += ".call(this, ";
				changesEnd = callArguments[0].range[0];
			}
		}
		else {
			changesEnd = calleeNode.range[1];
		}

		// text change 'super(<some>)' => 'super$0(<some>)' (if <some> contains SpreadElement) or 'super$0.call(this, <some>)'
		this.alter.replace(calleeNode.range[0], changesEnd, changeStr);
	}
	
	, replaceClassConstructorSuper: function replaceClassConstructorSuper(node) {
		if( node.type === "CallExpression" ) {
			var calleeNode = node.callee;

			if( calleeNode && calleeNode.type === "Identifier" && calleeNode.name === "super" ) {
				this.unwrapSuperCall(node, calleeNode, true, null, true);
			}
		}
		else if( node.type === "ClassDeclaration" ) {
			return false;
		}
	}
	
	, replaceClassMethods: function replaceClassMethods(node, astQuery) {
		if( node.type === "MethodDefinition" && node.key.name !== "constructor" ) {
			var isStatic = this.__currentClassMethodsStatic = node.static;

			var nodeKey = node.key;

			if( node.kind === "set" || node.kind === "get" ) {
				if ( isStatic && !this.__currentFirstStaticAccessor ) {
					this.__currentFirstStaticAccessor = node;
				}

				var isLiteral = nodeKey.type == 'Literal';
				assert(nodeKey.type == 'Identifier' || isLiteral);

				var name;
				if ( isLiteral ) {
					name = nodeKey.value;
				}
				else {
					name = nodeKey.name;
				}

				var accessor = isStatic === true
					? this.__currentStaticAccessors[name] || (this.__currentStaticAccessors[name] = {})
					: this.__currentAccessors[name] || (this.__currentAccessors[name] = {})
				;
				var replacement = accessor[node.kind] = core.unique((isStatic ? "static_" : "") + name + "$" + node.kind, true);

				if ( isLiteral ) {
					accessor.raw = nodeKey.raw;
				}

				this.alter.replace(node.range[0], nodeKey.range[1], "function " + replacement);
			}
			else {
				if( isStatic === true ) {
					// text change 'method(<something>)' => 'ClassName.method(<something>)'
					this.alter.replace(node.range[0], nodeKey.range[0], this.__currentClassName + ".");
				}
				else {
					// text change 'method(<something>)' => 'ClassName.prototype.method(<something>)'
					this.alter.replace(node.range[0], nodeKey.range[0], this.__currentClassName + ".prototype.");
				}

				// text change 'method(<something>)' => 'method = function(<something>)'
				this.alter.insert(nodeKey.range[1], " = function");
			}

			astQuery.traverse(node.value, this.replaceClassMethodSuper);
		}
		this.__currentClassMethodsStatic = null;
	}
	
	, replaceClassMethodSuper: function replaceClassMethodSuper(node) {
		if( node.type === "CallExpression" ) {
			assert(typeof this.__currentClassMethodsStatic === "boolean");

			var calleeNode = node.callee;

			if( calleeNode && calleeNode.type === "MemberExpression" ) {
				var objectNode = calleeNode.object;
				if( objectNode && objectNode.type === "Identifier" && objectNode.name === "super" ) {
					// text change 'super.method(<some>)' => 'super$0(<some>)' (if <some> contains SpreadElement) or 'super$0.call(this, <some>)'
					this.unwrapSuperCall(node, objectNode, this.__currentClassMethodsStatic, calleeNode.property);
				}
			}
		}
		else if( node.type === "ClassDeclaration" ) {
			return false;
		}
	}
};

for(var i in classesTranspiler) if( classesTranspiler.hasOwnProperty(i) && typeof classesTranspiler[i] === "function" ) {
	classesTranspiler[i] = classesTranspiler[i].bind(classesTranspiler);
}

module.exports = classesTranspiler;
