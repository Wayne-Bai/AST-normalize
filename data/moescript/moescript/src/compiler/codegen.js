var moe = require('../runtime');
var moecrt = require('./compiler.rt');
var smapinfo = require('./smapinfo');

var UNIQ = moe.UNIQ;

var nt = moecrt.NodeType;
var ScopedScript = moecrt.ScopedScript;
var walkRex = moecrt.walkRex;
var nodeSideEffectiveQ = moecrt.nodeSideEffectiveQ;

var smapRecord = smapinfo.smapRecord;
var rBracketRemoval = smapinfo.rBracketRemoval;

"Code Emission Util Functions";
var ENCODE_IDENTIFIER = function(){
	var COMPARE_CODES = function(P, Q){
		if(P.code === Q.code) return P.j - Q.j;
		else return P.code - Q.code;
	};
	var DIGITS = 'abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	var encNum = function(x){
		var buff = '' + (x % 10);
		x = ~~(x / 10);
		while(x > 0){
			buff += DIGITS[x % 53];
			x = ~~(x / 53);
		};
		return buff;
	};
	var encodeNonBasics = function(s, a){
		if(a.length < 1) return s;
		var buf = '';
		a = a.sort(COMPARE_CODES);
		var code = a[0];	
		buf += encNum((code.j << 16) + code.ch);
		for(var i = 1; i < a.length; i++){
			if(a[i].ch === code.ch && a[i].j - code.j < 0x10000){
				buf += encNum(a[i].j - code.j).toString(36);
			} else {
				buf += encNum(((a[i].j) << 16) + (a[i].ch)).toString(36);
			}
			code = a[i];
		};
		return '$' + s + '$' + buf;
	};
	return function(s){
		var nonBasics = [];
		s = s.replace(/\W/g, function(ch, j){
			nonBasics.push({ch: ch.charCodeAt(0), j: j + 1});
			return '';
		});
		return encodeNonBasics(s, nonBasics);
	}
}();


var C_NAME = exports.C_NAME = function (name) { return ENCODE_IDENTIFIER(name) + '$' },
	C_LABELNAME = function (name) { return ENCODE_IDENTIFIER(name) + '$L' },
	C_TEMP = exports.C_TEMP = function (type){ return type + '$_' },
	T_THIS = function (env) { return '_$_THIS' },
	T_ARGN = function(){ return '_$_ARGND' },
	T_ARG0 = function(){ return '_$_ARG0' },
	T_ARGS = function(){ return '_$_ARGS' },
	C_BLOCK = function(label){ return 'block_' + label },
	C_STRING = moecrt.C_STRING;

var INDENT = function(s){ return s.replace(/^/gm, '    ') };

var JOIN_STMTS = function (statements) {
	var ans = [], ansl = 0, statement;
	for(var i = 0; i < statements.length; i++) if((statement = statements[i])){
		statement = statement.replace(/^[\s;]+/g, '').replace(/[\s;]+$/g, '')
		if(/[^\s]/.test(statement))
			ans[ansl++] = statement;
	}
	return '\n' + INDENT(ans.join(';\n')) + ';\n';
}

var THIS_BIND = function (env) {
	return (env.thisOccurs) ? 'var ' + T_THIS() + ' = this' : '';
};
var ARG0_BIND = function (env) {
	return (env.arg0Occurs) ? 'var ' + T_ARG0() + ' = arguments[0]' : '';
};
var ARGS_BIND = function (env, ReplGlobalQ) {
	if(ReplGlobalQ) return 'var ' + T_ARGS() + ' = ' + '[]';
	else return (env.argsOccurs) ? 'var ' + T_ARGS() + ' = ' + C_TEMP('SLICE') + '(arguments, 0)' : '';
};
var ARGN_BIND = function (env, ReplGlobalQ) {
	if(ReplGlobalQ) return 'var ' + T_ARGN() + ' = ' + '{}';
	else return (env.argnOccurs) ? 
		'var ' + T_ARGN() + ' = ' + C_TEMP('CNARG') + '(arguments[arguments.length - 1])' : '';
};
var TEMP_BIND = function (env, tempName) {
	return C_TEMP(tempName);
};

var $ = function(template, items_){
	var a = arguments;
	return template.replace(/%(\d+)/g, function(m, $1){
		return a[parseInt($1, 10)] || '';
	});
};

var GETV = function (node) { return C_NAME(node.name) };
var SETV = function (node, val) { return '(' + C_NAME(node.name) + ' = ' + val + ')' };

var SPECIALNAMES = {
	"break":1, "continue":1, "do":1, "for":1, "import":1, 
	"new":1, "this":1, "void":1, "case":1, 
	"default":1, "else":1, "function":1, "in":1, 
	"return":1, "typeof":1, "while":1, "comment":1, 
	"delete":1, "export":1, "if":1, "label":1, 
	"switch":1, "var":1, "with":1, "abstract":1, 
	"implements":1, "protected":1, "boolean":1, "instanceof":1, 
	"public":1, "byte":1, "int":1, "short":1, 
	"char":1, "interface":1, "static":1, "double":1, 
	"long":1, "synchronized":1, "false":1, "native":1, 
	"throws":1, "final":1, "null":1, "transient":1, 
	"float":1, "package":1, "true":1, "goto":1, 
	"private":1, "catch":1, "enum":1, "throw":1, 
	"class":1, "extends":1, "try":1, "const":1, 
	"finally":1, "debugger":1, "super":1
};
var IDENTIFIER_Q = /^[a-zA-Z$][\w$]*$/;

var PART = exports.PART = function(left, right){
	// Generates 'Parting' code.
	// Left: expression
	// Right: name
	if (!IDENTIFIER_Q.test(right) || SPECIALNAMES[right] === 1)
		return left + '[' + C_STRING(right) + ']';
	else 
		return left + '.' + right;
};

var GListTmpType = function(type){
	// Generates a function lists specific type of temp vars
	// used in a scope.

	// See compiler.rt/ScopedScript.markTempUsed
	type = type + 1;
	return function(scope){
		var l = [];

		scope.usedTemps.forEach(function(tid, tempType){
			if(tempType === type)
				l.push(tid);
		});
		return l;
	};
};
var listTemp = GListTmpType(ScopedScript.VARIABLETEMP);

exports.Generator = function(g_envs, g_config){
	var env = g_envs[0];

	var g_options = g_config.options || {}

	var g_nargsOptOff = g_options.nargsOptOff;

	var ungroup = function(node){
		while(node.type === nt.GROUP)
			node = node.operand;
		return node;
	};

	var WPOS = function(node, s){
		var r = s;
		if(node.begins >= 0 && node.ends >= 0){
			r = smapRecord('LM', node.begins) + r + smapRecord('RM', node.ends);
		};
		return r;
	}

	var NodeTransformFunction = function(f){
		return function(node){
			return WPOS(node, f.apply(this, arguments));;
		}
	}

	"Common Functions";
	var compileFunctionBody = function (tree, ReplGlobalQ) {
		// Generates code for normal function.
		// Skip when necessary.
		if (tree.transformed) return tree.transformed;
		var backupenv = env;
		env = tree;

		var s = transform(tree.code).replace(/^    /gm, '');

		var locals = UNIQ(tree.locals),
			vars = [],
			temps = listTemp(tree);

		var pars = tree.parameters.names.slice(0);

		for (var i = 0; i < locals.length; i++) {
			if (!tree.variables.get(locals[i]).parQ){
				vars.push(C_NAME(locals[i]));
			}
		}

		for (var i = 0; i < temps.length; i++)
			temps[i] = TEMP_BIND(tree, temps[i]);

		s = JOIN_STMTS([
			THIS_BIND(tree),
			ARGS_BIND(tree, ReplGlobalQ),
			ARG0_BIND(tree, ReplGlobalQ),
			ARGN_BIND(tree, ReplGlobalQ),
			(temps.length ? 'var ' + temps.join(', '): ''),
			(vars.length ? 'var ' + vars.join(', ') : ''),
			s
		]);

		for (var i = 0; i < pars.length; i++) {
			pars[i] = transform(pars[i]);
		};

		if(ReplGlobalQ) return s.replace(/^    /gm, '');
		if(tree.mPrim && tree.blockQ){
			s = $('function (%1){%2}',  C_TEMP('SCHEMATA'), s);
		} else {
			s = $('function (%1){%2}',  pars.join(','), s);
			if(tree.mPrim){
				s = $('{build: function(%1){return %2}}', C_TEMP('SCHEMATA'), s)
			}
		}
	
		tree.transformed = s;
		env = backupenv;
		return s;
	};

	"Transforming Utils";
	// schemata: Transformation schemata for both non- and MP nodes.
	// Used for expressions only.
	var schemata = [];
	var defineSchemata = function(type, f){
		if(!type) throw "Unexpected schemata name"
		schemata[type] = f;
	};



	var transform = NodeTransformFunction(function (node) {
		if (schemata[node.type]) {
			return schemata[node.type].call(node, node, env);
		} else {
			throw node
		};
	});


	"Common schematas";
	defineSchemata(nt.VARIABLE, function () {
		return smapRecord('ID', ENCODE_IDENTIFIER(this.name)) + GETV(this);
	});
	defineSchemata(nt.TEMPVAR, function(){
		return C_TEMP(this.name);
	});
	defineSchemata(nt.LITERAL, function () {
		if (typeof this.value === 'string') {
			return C_STRING(this.value);
		} else if (typeof this.value === 'number'){
			return '' + this.value;
		} else if (this.value.tid){
			return C_TEMP(this.value.tid);
		} else if (this.value instanceof RegExp){
			return '(/' + (this.value.source.replace(/\n/g, '\\n').replace(/(\\.)|(\[(?:\\.|[^\[\]])*\])|(\/)|([^\\\/\[])/g, 
				function(m, escape, charclass, slash, normal){
					if(slash) return '\\/'
					else return m
				})) 
				+ '/' 
				+ (this.value.global ? 'g' : '') 
				+ (this.value.ignoreCase ? 'i' : '') 
				+ (this.value.multiline ? 'm' : '') + ')';
		} else return '' + this.value.map;
	});
	defineSchemata(nt.GROUP, function(){
		return '(' + transform(ungroup(this.operand)) + ')'
	});
	defineSchemata(nt.THIS, function (node, e) {
		return T_THIS(e);
	});
	defineSchemata(nt.ARGN, function (){
		return T_ARGN();
	});
	defineSchemata(nt.ARG0, function (){
		return T_ARG0();
	});
	defineSchemata(nt.ARGUMENTS, function () {
		return T_ARGS();
	});
	defineSchemata(nt.PARAMETERS, function () {
		throw new Error('Unexpected parameter group');
	});
	defineSchemata(nt.UNIT, function(){
		return 'undefined';
	});
	defineSchemata(nt.BLOCK, function(){
		return '(function(' + (this.arg ? transform(this.arg) : '') + '){' + transform(this.code) + '})'
	});



	defineSchemata(nt.OBJECT, function () {
		var inits = [],
		    terms = [],
			x = 0,
			hasNameQ = this.nameused;
		for (var i = 0; i < this.args.length; i++) {
			var right = transform(this.args[i])
			if (typeof this.names[i] === "string") {
				hasNameQ = true;
				inits.push(C_STRING(this.names[i]) + ': ' + right);
			} else {
				inits.push(C_STRING('' + x) + ': ' + right);
				x++;
			};
			terms.push(right);
		};
		if(hasNameQ)
			return $('({%1})',
				(this.args.length < 4 ? inits.join(', ') : '\n' + INDENT(inits.join(',\n')) + '\n'));
		else
			return $('[%1]', terms.join(', '));
	});
	defineSchemata(nt.FUNCTION, function () {
		var	f = g_envs[this.tree];
		var s = compileFunctionBody(f);
		return '(' + s + ')';
	});

	defineSchemata(nt.MEMBER, function () {
		if(this.right.type === nt.LITERAL 
			&& typeof this.right.value === 'string' 
			&& !(this.left.type === nt.LITERAL && typeof this.left.value === 'number')) {
			return PART(transform(this.left), this.right.value);
		} else {
			return $('%1[%2]', transform(this.left), transform(this.right))
		}
	});

	var binoper = function (operator, tfoper) {
		defineSchemata(nt[operator], function () {
			var left, right;
			if(this.left.type > this.type) {
				left = '(' + reduceBracketsTransform(this.left, true) + ')'
			} else {
				left = transform(this.left)
			}
			if(this.right.type >= this.type) {
				right = '(' + reduceBracketsTransform(this.right, true) + ')'
			} else {
				right = transform(this.right)
			}
			return $('%1 %2 %3', left, tfoper, right);
		});
	};
	var libfuncoper = function (operator, func){
		defineSchemata(nt[operator], function () {
			return $('%1(%2, %3)', func, transform(this.left), transform(this.right));
		});
	};

	binoper('+', '+');
	binoper('-', '-');
	binoper('*', '*');
	binoper('/', '/');
	binoper('%', '%');
	binoper('<', '<');
	binoper('>', '>');
	binoper('<=', '<=');
	binoper('>=', '>=');
	binoper('==', '===');
	binoper('=~', '==');
	binoper('===', '===');
	binoper('!==', '!==');
	binoper('!=', '!==');
	binoper('!~', '!=');
	binoper('&&', '&&');
	binoper('||', '||');
	binoper('and', '&&');
	binoper('or', '||');
	libfuncoper('is', C_TEMP('IS'));
	libfuncoper('as', C_TEMP('AS'));
	libfuncoper('..', C_TEMP('ExclusiveRange'));
	libfuncoper('...', C_TEMP('InclusiveRange'));

	defineSchemata(nt.NEGATIVE, function () {
		return '(-(' + reduceBracketsTransform(this.operand, true) + '))';
	});
	defineSchemata(nt.NOT, function () {
		return '(!(' + reduceBracketsTransform(this.operand, true) + '))';
	});
	defineSchemata(nt.CTOR, function(){
		return 'new (' + reduceBracketsTransform(this.expression, true) + ')'
	});


	defineSchemata(nt.VAR, function(){return ''});

	"Normal transformation specific rules";
	defineSchemata(nt.CALLBLOCK, function(){
		return $('(%1())', transform(this.func))
	})
	defineSchemata(nt.ASSIGN, function () {
		return $('(%1 = %2)', transform(this.left), transform(this.right));
	});

	var isBracketedExprType = function(t){
		return t === nt.ASSIGN || t === nt.CALLBLOCK || t === nt.NOT || t === nt.NEGATIVE
		    || t === nt.THEN || t === nt.CONDITIONAL || t === nt.AS || t === nt.IS
		    || t === nt['..'] || t === nt['...']
	};

	var reduceBracketsTransform = function(e, ceQ){

		var s = transform(e);
		if(isBracketedExprType(e.type) && rBracketRemoval.test(s))
			s = s.replace(rBracketRemoval, '$1$2$3');

		if(ceQ) return s;

		// Two schemas are avoided due to JS' restrictions
		if(s.slice(0, 8) === 'function' || s.charAt(0) === '{'){
			s = '(' + s + ')';
		};
		return s;
	};
	var transformArgs = function(node){
		var _ = [];
		for(var j = 0; j < node.args.length; j++) {
			_[j] = transform(node.args[j]);
		}
		return _;
	}
	defineSchemata(nt.CALL, function (node, env) {
		return $('%1(%2)', transform(this.func), transformArgs(this).join(', '))
	});
	defineSchemata(nt['then'], function(){
		var a = []
		for(var i = 0; i < this.args.length; i++) {
			var e = this.args[i];
			var s = transform(e);
			if(e.type === nt['then'])
				a.push(s.slice(1, -1))
			else
				a.push(s);
		}
		return '(' + a.join(',') + ')';
	});
	defineSchemata(nt.CONDITIONAL, function(){
		return $("(%1 ? %2 : %3)", transform(this.condition), transform(this.thenPart), transform(this.elsePart))
	});

	defineSchemata(nt.RETURN, function () {
		return 'return ' + transform(this.expression);
	});
	defineSchemata(nt.IF, function () {
		return $('if (%1) {%2} %3', 
			reduceBracketsTransform(this.condition, true),
			transform(this.thenPart),
			this.elsePart ? "else {" + transform(this.elsePart) + "}" : '');
	});

	defineSchemata(nt.REPEAT, function () {
		return $('do {%2} while(%1)', reduceBracketsTransform(this.condition, true), transform(this.body));
	});
	defineSchemata(nt.WHILE, function () {
		return $('while (%1) {%2}', reduceBracketsTransform(this.condition, true), transform(this.body));
	});

	defineSchemata(nt.BREAK, function () {
		return 'break ' + (this.destination ? C_LABELNAME(this.destination) : '');
	});
	defineSchemata(nt.LABEL, function () {
		return C_LABELNAME(this.name) + ':{' + transform(this.body) + '}';
	});

	defineSchemata(nt.TRY, function(){
		return $('try {%1} catch (%2) {%3}',
			transform(this.attemption),
			transform(this.eid),
			transform(this.catcher))
	});
	
	defineSchemata(nt.SCRIPT, function (n) {
		var a = [];
		for (var i = 0; i < n.content.length; i++) {
			if (n.content[i]){
				a.push(reduceBracketsTransform(n.content[i]));
			}
		}
		return JOIN_STMTS(a)
	});

	return function(){
		var generatedCode = compileFunctionBody.apply(this, arguments);
		return {generatedCode: generatedCode}
	}
};