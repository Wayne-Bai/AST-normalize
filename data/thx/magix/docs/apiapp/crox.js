var Crox;
(function() {
	function Class(base, constructor, methods) {
		/// <param name="base" type="Function"></param>
		/// <param name="constructor" type="Function"></param>
		/// <param name="prototype" type="Object" optional="true"></param>

		function f() {}
		f.prototype = base.prototype;
		var t = new f;
		if (methods) {
			for (var i in methods)
			t[i] = methods[i];
		}
		if (!constructor) constructor = f;
		constructor.prototype = t;
		return constructor;
	}

	function Position(row, col) {
		this.row = row;
		this.col = col;
	}
	Position.prototype.toString = function() {
		return '(' + this.row + ',' + this.col + ')';
	};

	function getPos(s, index) {
		/// <summary>取得字符串中某个位置所在的行列</summary>
		/// <param name="s" type="String"></param>
		/// <param name="index" type="Number"></param>
		var t = s.substring(0, index);
		var re_nl = /\r\n?|\n/g;
		var m = t.match(re_nl);
		var row = 1;
		if (m) {
			row += m.length;
		}
		var col = 1 + /[^\r\n]*$/.exec(t)[0].length;
		return new Position(row, col);
	}

	function Enum(arr) {
		/// <param name="arr" type="Array"></param>
		var obj = {};
		for (var i = 0; i < arr.length; ++i)
		obj[arr[i]] = arr[i];
		return obj;
	}

	function inArr(a, t) {
		/// <param name="a" type="Array"></param>
		for (var i = 0; i < a.length; ++i)
		if (a[i] == t) return i;
		return -1;
	}

	function inArr_strict(a, t) {
		/// <param name="a" type="Array"></param>
		for (var i = 0; i < a.length; ++i)
		if (a[i] === t) return i;
		return -1;
	}

	function nodup(a, eq) {
		/// <param name="a" type="Array"></param>
		/// <param name="eq" type="Function">比较函数</param>
		var b = [];
		var n = a.length;
		for (var i = 0; i < n; i++) {
			for (var j = i + 1; j < n; j++)
			if (eq(a[i], a[j])) j = ++i;
			b.push(a[i]);
		}
		return b;
	}

	function htmlEncode(s) {
		/// <param name="s" type="String"></param>
		/// <returns type="String" />
		return String(s).replace(/[&<>"]/g, function(a) {
			switch (a) {
				case '&':
					return '&amp;';
				case '<':
					return '&lt;';
				case '>':
					return '&gt;';
				default:
					return '&quot;';
			}
		});
	}

	function singleQuote(s) {
		/// <param name="s" type="String"></param>
		/// <returns type="String" />
		return "'" + String(s).replace(/[\x00-\x1f'\\\u2028\u2029]/g, function(a) {
			switch (a) {
				case "'":
					return "\\'";
				case '\\':
					return '\\\\';
				case '\b':
					return '\\b';
				case '\f':
					return '\\f';
				case '\n':
					return '\\n';
				case '\r':
					return '\\r';
				case '\t':
					return '\\t';
			}
			return '\\u' + ('000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + "'";
	}

	function doubleQuote(s) {
		/// <param name="s" type="String"></param>
		/// <returns type="String" />
		return JSON.stringify(String(s)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
	}

	function quote(s) {
		/// <param name="s" type="String"></param>
		/// <returns type="String" />
		var t1 = singleQuote(s);
		var t2 = doubleQuote(s);
		return t1.length < t2.length ? t1 : t2;
	}

	function phpQuote(s) {
		/// <param name="s" type="String"></param>
		/// <returns type="String" />
		return '"' + String(s).replace(/[\x00-\x1f"\\\u2028\u2029]/g, function fn_esc(a) {
			switch (a) {
				case '"':
					return '\\"';
				case '\\':
					return '\\\\';
				case '\b':
					return '\\b';
				case '\f':
					return '\\f';
				case '\n':
					return '\\n';
				case '\r':
					return '\\r';
				case '\t':
					return '\\t';
				case '$':
					return '\\$';
			}
			return '\\u' + ('000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"';
	}

	/// <reference path="common.js"/>

	function createLexer(g) {

		function Token(tag, text, index, subMatches) {
			this.tag = tag;
			this.text = text;
			this.index = index;
			this.subMatches = subMatches;
		}
		Token.prototype.toString = function() {
			return this.text;
		};

		function emptyFunc() {}

		function buildScanner(a) {
			var n = 1;
			var b = [];
			var matchIndexes = [1];
			var fa = [];
			for (var i = 0; i < a.length; ++i) {
				matchIndexes.push(n += RegExp('|' + a[i][0].source).exec('').length);
				fa.push(a[i][1] || emptyFunc);
				b.push('(' + a[i][0].source + ')');
			}

			var re = RegExp(b.join('|') + '|', 'g');
			return [re, matchIndexes, fa];
		}

		var endTag = g.$ || '$';
		var scanner = {};
		for (var i in g) {
			if (i.charAt(0) != '$') scanner[i] = buildScanner(g[i]);
		}

		return Lexer;

		function Lexer(s) {
			if (typeof s != 'string') s = String(s);
			var Length = s.length;
			var i = 0;
			var stateStack = [''];

			var obj = {
				text: '',
				index: 0,
				source: s,
				pushState: function(s) {
					stateStack.push(s);
				},
				popState: function() {
					stateStack.pop();
				},
				retract: function(n) {
					i -= n;
				}
			};

			function scan() {
				var st = stateStack[stateStack.length - 1];
				var rule = scanner[st];
				var re = rule[0];
				re.lastIndex = i;
				var t = re.exec(s);
				if (t[0] == '') {
					if (i < Length) {
						throw Error('lexer error: ' + getPos(s, i) +
							'\n' + JSON.stringify(s.slice(i, i + 50)));
					}
					return new Token(endTag, '', i);
				}
				obj.index = i;
				i = re.lastIndex;
				var idx = rule[1];
				for (var j = 0; j < idx.length; ++j)
				if (t[idx[j]]) {
					var tag = rule[2][j].apply(obj, t.slice(idx[j], idx[j + 1]));
					return new Token(tag, t[0], obj.index, t.slice(idx[j] + 1, idx[j + 1]));
				}
			}

			return {
				scan: function() {
					do {
						var t = scan();
					} while (t.tag == null);
					return t;
				},
				getPos: function(i) {
					return getPos(s, i);
				},
				reset: function() {
					i = 0;
					stateStack = [''];
				}
			};
		}
	}
	/// <reference path="createLexer.js"/>
	var Lexer = function() {
		var re_id = /[A-Za-z_]\w*/;
		var re_str = /"(?:[^"\\]|\\[\s\S])*"|'(?:[^'\\]|\\[\s\S])*'/;
		var re_num = /0x[\dA-Fa-f]+|(?:(?:0|[1-9]\d*)(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/;

		function isReserved(s) {
			return " abstract boolean break byte case catch char class const continue debugger default delete do double else enum export extends final finally float for function goto if implements import in instanceof int interface let long native new package private protected public return short static super switch synchronized this throw throws transient try typeof var void volatile while with yield ".indexOf(' ' + s + ' ') != -1;
		}
		var code = [
        [/\s+/, function() {
			return 'ws';
		}],
        [/#([a-z]+)/, function(a, b) {
			switch (b) {
				case 'include':
					return a;
				default:
					throw Error("unknown: " + a + ' ' + getPos(this.source, this.index));
			}
		}],
        [re_id, function(a) {
			switch (a) {
				case 'true':
				case 'false':
					return 'boolean';
				case 'null':
				case 'if':
				case 'else':
				case 'each':
				case 'as':
					return a;
				default:
					if (isReserved(a)) throw Error("Reserved: " + a + ' ' + getPos(this.source, this.index));
					return 'id';
			}
		}],
        [re_str, function(a) {
			return 'string';
		}],
        [re_num, function(a) {
			return 'number';
		}],
        [function(a) {
			a.sort().reverse();
			for (var i = 0; i < a.length; ++i)
			a[i] = a[i].replace(/[()*+?.[\]|]/g, '\\$&');
			return RegExp(a.join('|'));
		}(["!", "%", "&&", "(", ")", "*", "+", "-", ".", "/", "<", "<=", "=", "=>", ">", ">=", "@", "[", "]", "||", "==", "!=", '?', ':', ',']), function(a) {
			return a;
		}]
    ];
		var Lexer = createLexer({
			'': [
            [/(?:(?!{{)[\s\S])+|{{{?/, function(a) {
				if (a.substring(0, 2) == '{{') {
					this.pushState(a);
					return a;
				}
				return 'text';
			}]
        ],
			'{{': code.concat([
            [/}}/, function(a) {
				this.popState();
				return a;
			}]
        ]),
			'{{{': code.concat([
            [/}}}/, function(a) {
				this.popState();
				return a;
			}]
        ])
		});
		return Lexer;
	}();
	/// <reference path="common.js"/>
	var ast = {};

	function AstNode() {}
	var Stmt = Class(AstNode, {
		tag: null
	});
	var Expr = Class(AstNode, {
		op: null
	});
	var ProgramNode = Class(AstNode, function(stmts) {
		this.idList = [['data', true]];
		this.stmts = stmts;
	});
	ProgramNode.prototype._addId = function(t, def) {
		for (var i = 0; i < this.idList.length; ++i) {
			if (this.idList[i][0] == t) {
				if (!this.idList[i][1] && def) this.idList[i][1] = true;
				return;
			}
		}
		this.idList.push([t, def]);
	};
	ProgramNode.prototype.addId = function(id, def) {
		this._addId(id.text, def);
	};
	ProgramNode.prototype.mergeIdList = function(ids) {
		for (var i = 0; i < ids.length; ++i)
		this._addId(ids[i][0], ids[i][1]);
	};
	ProgramNode.prototype.getUndefined = function() {
		var a = [];
		for (var i = 0; i < this.idList.length; ++i) {
			if (!this.idList[i][1]) a.push(this.idList[i][0]);
		}
		return a;
	};
	ProgramNode.prototype.genGetId = function() {
		var a = this.idList;
		var prefix = '_';
		while (1) {
			for (var i = 0; i < a.length; ++i) {
				if (a[i][0].indexOf(prefix) == 0) {
					prefix += '_';
					continue;
				}
			}
			break;
		}
		i = 1;
		return function() {
			return prefix + i++;
		};
	};

	var Eval = Class(Stmt, function(x, encode) {
		this.expr = x;
		this.encode = encode;
	}, {
		tag: 'eval'
	});
	var ContentNode = Class(Stmt, function(t) {
		this.text = t.text;
	}, {
		tag: 'content'
	});
	var If = Class(Stmt, function(expr, stmts, stmts2) {
		this.expr = expr;
		this.stmts = stmts;
		this.falseStmts = stmts2;
	}, {
		tag: 'if'
	});
	var Each = Class(Stmt, function(type, expr, ids, stmts) {
		this.type = type;
		this.expr = expr;
		this.idKey = ids[0];
		this.idItem = ids[1];
		this.stmts = stmts;
	}, {
		tag: 'each'
	});
	var Set = Class(Stmt, function(id, expr) {
		this.id = id;
		this.expr = expr;
	}, {
		tag: 'set'
	});

	var Binary = Class(Expr, function(x1, op, x2) {
		this.expr1 = x1;
		this.op = op;
		this.expr2 = x2;
	});
	Binary.prototype.toString = function() {
		return '(' + this.expr1 + ')' + this.op + '(' + this.expr2 + ')';
	};

	function buildBinary(x1, op, x2) {
		return new Binary(x1, op, x2);
	}
	var Unary = Class(Expr, function(op, x) {
		this.op = 'u' + op;
		this.expr = x;
	});
	Unary.prototype.toString = function() {
		return this.op.slice(1) + '(' + this.expr + ')';
	};

	function buildUnary(op, x) {
		return new Unary(op, x);
	}
	var Literal = Class(Expr, function(tok) {
		this.tag = tok.tag;
		switch (tok.tag) {
			case 'number':
				this.value = Number(tok.text);
				break;
			case 'string':
				this.value = eval(tok.text);
				break;
			case 'boolean':
				this.value = tok.text == 'true';
				break;
			case 'null':
				this.value = null;
				break;
			default:
				throw Error("unknown literal: " + tok.tag);
		}
	}, {
		op: 'literal'
	});

	Literal.prototype.toString = function() {
		if (this.tag == 'string') {
			return singleQuote(this.value);
		}
		return JSON.stringify(this.value);
	};

	var MemberExpr = Class(Expr, function(x1, op, x2) {
		this.expr1 = x1;
		this.op = op;
		this.expr2 = x2;
	});
	MemberExpr.prototype.toString = function() {
		var s = this.expr1.toString();
		if (this.op == '.') s += '.' + this.expr2;
		else {
			s += '[' + this.expr2 + ']';
		}
		return s;
	};
	var Id = Class(Expr, function(id) {
		this.name = id.text;
		this.startIndex = id.index;
	}, {
		op: 'id'
	});
	Id.prototype.toString = function() {
		return this.name;
	};
	ast.ProgramNode = ProgramNode;
	ast.If = If;
	ast.Each = Each;
	ast.Set = Set;
	ast.Eval = Eval;
	ast.ContentNode = ContentNode;
	ast.buildBinary = buildBinary;
	ast.buildUnary = buildUnary;
	ast.Id = Id;
	ast.Literal = Literal;
	ast.MemberExpr = MemberExpr;
	var Conditional = Class(Expr, function(x1, x2, x3) {
		this.expr1 = x1;
		this.expr2 = x2;
		this.expr3 = x3;
	}, {
		op: '?'
	});

	Conditional.prototype.toString = function() {
		return '(' + this.expr1 + ')?(' + this.expr2 + '):(' + this.expr3 + ')';
	};
	ast.Conditional = Conditional;
	var Call = Class(Expr, function(fn, args) {
		this.fn = fn;
		this.args = args;
	}, {
		op: 'call'
	});
	ast.buildCall = function(fn, args) {
		return new Call(fn, args);
	};
	/// <reference path="common.js"/>
	var Env = Enum(['Browser', 'File', 'Other']);
	var theEnv = function() {
		if (this.location) {
			if (/^https?:\/\//.test(location)) {
				return Env.Browser;
			}
			if (/^file[:]\/\/\//.test(location)) {
				return Env.File;
			}
		}
		return Env.Other;
	}();

	function ajaxGet(url) {
		var x;
		try {
			x = new XMLHttpRequest();
		} catch (e) {
			try {
				x = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {}
		}
		if (!x) {
			alert("创建 XHR 失败");
			return;
		}
		x.open('GET', url, false);
		x.send(null);
		var r = '';
		if (x.status == 200) {
			r = x.responseText;
		} else {
			throw Error("ajaxGet error:\nurl: " + url + "\n" + x.status + " " + x.statusText);
		}
		//alert([url, r].join('\n'));
		return r;
	}

	function calcAbsPath(currentPath, relativePath) {
		switch (theEnv) {
			case Env.Browser:
			case Env.File:
				var d = document.createElement('div');
				d.innerHTML = '<a href="' + (currentPath.replace(/[^/]+$/, '') + relativePath).replace(/"/g, '&quot;') + '">a</a>';
				return d.firstChild.href;
			default:
				throw Error("不支持 Env: " + theEnv);
		}
	}

	function loadTemplate(path) {
		switch (theEnv) {
			case Env.Browser:
				return ajaxGet(path);
			case Env.File:
				return readFile(path.replace(/^file[:]\/{3}/, ''));
			default:
				return readFile(path);
		}
	}

	function procInclude(tokStr, currentUrl, includes) {
		/// <param name="includes" type="Array">Description</param>
		var str = eval(tokStr.text);
		var url = str;
		if (currentUrl && !/^https?:\/\/|^\//.test(str)) {
			url = calcAbsPath(currentUrl, str);
		}
		//alert([currentUrl, str, url].join('\n'));
		if (inArr(includes, url) != -1) throw Error("禁止循环 include: " + url);
		includes.push(url);
		//alert(url);
		var s = loadTemplate(url);
		//alert(s); return s;
		var lx = Lexer(s);
		var r = parse(lx, url, includes);
		return r;
	}
	/* state num: 118 */
	var parse = function() {
		function $f0($1) {
			var $$;
			$$ = new ast.Literal($1);
			return $$;
		}

		function $f1($1, $2, $3) {
			var $$;
			$$ = $2;
			return $$;
		}
		var nBegin = 41;
		var tSymbols = ["$", "!", "!=", "#include", "%", "&&", "(", ")", "*", "+", ",", "-", ".", "/", ":", "<", "<=", "=", "==", "=>", ">", ">=", "?", "@", "[", "]", "as", "boolean", "each", "else", "id", "if", "null", "number", "string", "text", "{{", "{{{", "||", "}}", "}}}", "AdditiveExpression", "ArgumentList", "Arguments", "CallExpression", "ConditionalExpression", "EqualityExpression", "LeftHandSideExpression", "LogicalAndExpression", "LogicalOrExpression", "MemberExpression", "MultiplicativeExpression", "PrimaryExpression", "RelationalExpression", "UnaryExpression", "_1", "_2", "asPart", "eachType", "expr", "program", "statement", "statements"];
		var tSymbolIndex = {};
		for (var i = 0; i < tSymbols.length; ++i)
		tSymbolIndex[tSymbols[i]] = i;
		var tAction = [{
			_: -58
		}, {
			_: -2
		}, {
			_: -32768
		}, {
			35: 4,
			36: 5,
			37: 6,
			_: -1
		}, {
			_: -11
		}, {
			1: 8,
			3: 9,
			6: 10,
			11: 11,
			27: 12,
			28: 13,
			30: 14,
			31: 15,
			32: 16,
			33: 17,
			34: 18,
			_: 0
		}, {
			1: 8,
			6: 10,
			11: 11,
			27: 12,
			30: 32,
			32: 16,
			33: 17,
			34: 18,
			_: 0
		}, {
			_: -3
		}, {
			34: 35,
			_: 0
		}, {
			_: -44
		}, {
			4: 38,
			23: 39,
			_: -12
		}, {
			17: 41,
			_: -46
		}, {
			_: -45
		}, {
			_: -43
		}, {
			_: -42
		}, {
			9: 43,
			11: 44,
			_: -27
		}, {
			_: -57
		}, {
			_: -17
		}, {
			2: 45,
			18: 46,
			_: -22
		}, {
			_: -41
		}, {
			5: 47,
			_: -20
		}, {
			22: 48,
			38: 49,
			_: -18
		}, {
			6: 50,
			12: 51,
			24: 52,
			_: -56
		}, {
			4: 54,
			8: 55,
			13: 56,
			_: -32
		}, {
			_: -48
		}, {
			15: 57,
			16: 58,
			20: 59,
			21: 60,
			_: -24
		}, {
			_: -35
		}, {
			39: 61,
			_: 0
		}, {
			_: -46
		}, {
			40: 62,
			_: 0
		}, {
			_: -39
		}, {
			_: -59
		}, {
			7: 64,
			_: 0
		}, {
			_: -40
		}, {
			_: -14
		}, {
			_: -13
		}, {
			39: 67,
			_: 0
		}, {
			1: 8,
			6: 10,
			7: 75,
			11: 11,
			27: 12,
			30: 32,
			32: 16,
			33: 17,
			34: 18,
			_: 0
		}, {
			30: 78,
			_: 0
		}, {
			_: -51
		}, {
			_: -8
		}, {
			_: -9
		}, {
			39: 87,
			_: 0
		}, {
			_: -47
		}, {
			26: 88,
			_: 0
		}, {
			39: 89,
			_: 0
		}, {
			4: 54,
			8: 55,
			13: 56,
			_: -33
		}, {
			4: 54,
			8: 55,
			13: 56,
			_: -34
		}, {
			15: 57,
			16: 58,
			20: 59,
			21: 60,
			_: -26
		}, {
			15: 57,
			16: 58,
			20: 59,
			21: 60,
			_: -25
		}, {
			2: 45,
			18: 46,
			_: -23
		}, {
			14: 91,
			_: 0
		}, {
			5: 47,
			_: -21
		}, {
			_: -52
		}, {
			7: 92,
			10: 93,
			_: 0
		}, {
			_: -54
		}, {
			_: -49
		}, {
			25: 94,
			_: 0
		}, {
			_: -38
		}, {
			_: -36
		}, {
			_: -37
		}, {
			9: 43,
			11: 44,
			_: -28
		}, {
			9: 43,
			11: 44,
			_: -30
		}, {
			9: 43,
			11: 44,
			_: -29
		}, {
			9: 43,
			11: 44,
			_: -31
		}, {
			_: -10
		}, {
			30: 95,
			_: 0
		}, {
			_: -7
		}, {
			35: 4,
			36: 97,
			37: 6,
			_: 0
		}, {
			_: -53
		}, {
			_: -50
		}, {
			19: 100,
			_: -15
		}, {
			39: 101,
			_: 0
		}, {
			1: 8,
			3: 9,
			6: 10,
			11: 11,
			13: 102,
			27: 12,
			28: 13,
			29: 103,
			30: 14,
			31: 15,
			32: 16,
			33: 17,
			34: 18,
			_: 0
		}, {
			_: -19
		}, {
			_: -55
		}, {
			30: 104,
			_: 0
		}, {
			31: 106,
			_: 0
		}, {
			39: 107,
			_: 0
		}, {
			_: -16
		}, {
			35: 4,
			36: 108,
			37: 6,
			_: 0
		}, {
			39: 109,
			_: 0
		}, {
			1: 8,
			3: 9,
			6: 10,
			11: 11,
			13: 111,
			27: 12,
			28: 13,
			30: 14,
			31: 15,
			32: 16,
			33: 17,
			34: 18,
			_: 0
		}, {
			_: -4
		}, {
			35: 4,
			36: 112,
			37: 6,
			_: 0
		}, {
			28: 113,
			_: 0
		}, {
			1: 8,
			3: 9,
			6: 10,
			11: 11,
			13: 114,
			27: 12,
			28: 13,
			30: 14,
			31: 15,
			32: 16,
			33: 17,
			34: 18,
			_: 0
		}, {
			39: 115,
			_: 0
		}, {
			31: 116,
			_: 0
		}, {
			_: -6
		}, {
			39: 117,
			_: 0
		}, {
			_: -5
		}];
		var actionIndex = [0, 1, 2, 3, 4, 5, 6, 7, 6, 8, 6, 6, 9, 10, 11, 6, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 6, 6, 36, 6, 6, 6, 6, 6, 6, 6, 37, 38, 6, 39, 6, 6, 6, 6, 6, 6, 6, 40, 41, 42, 43, 44, 45, 1, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 6, 69, 6, 70, 71, 72, 73, 74, 75, 76, 1, 77, 78, 79, 80, 81, 1, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91];
		var tGoto = [{
			14: 1,
			19: 2
		}, {
			21: 3
		}, , {
			20: 7
		}, , {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 31
		}, {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 33
		}, , {
			3: 20,
			6: 23,
			9: 26,
			11: 28,
			13: 34
		}, , {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 36
		}, {
			3: 20,
			6: 23,
			9: 26,
			11: 28,
			13: 37
		}, , {
			17: 40
		}, , {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 42
		}, , , , , , , , , , , {
			2: 53
		}, , , , , , , , , {
			15: 63
		}, , , , , {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 65
		}, {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 66
		}, , {
			3: 20,
			6: 23,
			9: 26,
			10: 68,
			11: 28,
			13: 30
		}, {
			3: 20,
			6: 23,
			9: 26,
			10: 69,
			11: 28,
			13: 30
		}, {
			0: 19,
			3: 20,
			6: 23,
			9: 26,
			10: 27,
			11: 28,
			12: 70,
			13: 30
		}, {
			0: 19,
			3: 20,
			6: 23,
			9: 26,
			10: 27,
			11: 28,
			12: 71,
			13: 30
		}, {
			0: 19,
			3: 20,
			5: 72,
			6: 23,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30
		}, {
			0: 19,
			3: 20,
			4: 73,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30
		}, {
			0: 19,
			3: 20,
			5: 22,
			6: 23,
			7: 74,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30
		}, {
			0: 19,
			1: 76,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 77
		}, , {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 79
		}, , {
			3: 20,
			6: 23,
			9: 26,
			11: 28,
			13: 80
		}, {
			3: 20,
			6: 23,
			9: 26,
			11: 28,
			13: 81
		}, {
			3: 20,
			6: 23,
			9: 26,
			11: 28,
			13: 82
		}, {
			0: 83,
			3: 20,
			6: 23,
			9: 26,
			10: 27,
			11: 28,
			13: 30
		}, {
			0: 84,
			3: 20,
			6: 23,
			9: 26,
			10: 27,
			11: 28,
			13: 30
		}, {
			0: 85,
			3: 20,
			6: 23,
			9: 26,
			10: 27,
			11: 28,
			13: 30
		}, {
			0: 86,
			3: 20,
			6: 23,
			9: 26,
			10: 27,
			11: 28,
			13: 30
		}, , , , , , , {
			21: 90
		}, , , , , , , , , , , , , , , , , , , , , {
			16: 96
		}, , {
			20: 7
		}, {
			0: 19,
			3: 20,
			4: 98,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30
		}, , {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 99
		}, , , , {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 31
		}, , , , {
			21: 105
		}, , , , {
			20: 7
		}, , {
			21: 110
		}, {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 31
		}, , {
			20: 7
		}, , {
			0: 19,
			3: 20,
			4: 21,
			5: 22,
			6: 23,
			7: 24,
			8: 25,
			9: 26,
			10: 27,
			11: 28,
			12: 29,
			13: 30,
			18: 31
		}];
		var tRules = [[63, 60], [60, 55, 62], [62], [62, 62, 61], [61, 36, 31, 59, 39, 62, 36, 13, 31, 39], [61, 36, 31, 59, 39, 62, 36, 29, 39, 62, 36, 13, 31, 39], [61, 36, 28, 58, 59, 26, 57, 39, 62, 36, 13, 28, 39], [61, 36, 30, 17, 59, 39], [61, 36, 59, 39], [61, 37, 59, 40], [61, 36, 3, 34, 56, 39], [61, 35], [58], [58, 23], [58, 4], [57, 30], [57, 30, 19, 30], [59, 45], [45, 49], [45, 49, 22, 45, 14, 45], [49, 48], [49, 49, 38, 48], [48, 46], [48, 48, 5, 46], [46, 53], [46, 46, 18, 53], [46, 46, 2, 53], [53, 41], [53, 53, 15, 41], [53, 53, 20, 41], [53, 53, 16, 41], [53, 53, 21, 41], [41, 51], [41, 41, 9, 51], [41, 41, 11, 51], [51, 54], [51, 51, 8, 54], [51, 51, 13, 54], [51, 51, 4, 54], [54, 1, 54], [54, 11, 54], [54, 47], [52, 34], [52, 33], [52, 27], [52, 32], [52, 30], [52, 6, 59, 7], [50, 52], [50, 50, 12, 30], [50, 50, 24, 59, 25], [44, 50, 43], [43, 6, 7], [43, 6, 42, 7], [42, 59], [42, 42, 10, 59], [47, 50], [47, 44], [55], [56]];
		var tFuncs = [, function($1, $2) {
			var $$;
			$1.stmts = $2;
			$$ = $1;
			return $$;
		}, function() {
			var $$;
			$$ = [];
			return $$;
		}, function($1, $2) {
			var $$;
			if ($2 instanceof ast.ProgramNode) {
				$1 = $1.concat($2.stmts);
				this.prog.mergeIdList($2.idList);
			} else $1.push($2);
			$$ = $1;
			return $$;
		}, function($1, $2, $3, $4, $5, $6, $7, $8, $9) {
			var $$;
			$$ = new ast.If($3, $5, null);
			return $$;
		}, function($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) {
			var $$;
			$$ = new ast.If($3, $5, $9);
			return $$;
		}, function($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) {
			var $$;
			$$ = new ast.Each($3, $4, $6, $8);
			return $$;
		}, function($1, $2, $3, $4, $5) {
			var $$;
			this.prog.addId($2, true);
			$$ = new ast.Set($2, $4);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = new ast.Eval($2, true);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = new ast.Eval($2, false);
			return $$;
		}, function($1, $2, $3, $4, $5) {
			var $$;
			$$ = $4;
			return $$;
		}, function($1) {
			var $$;
			$$ = new ast.ContentNode($1);
			return $$;
		}, function() {
			var $$;
			$$ = "%";
			return $$;
		}, function($1) {
			var $$;
			$$ = "@";
			return $$;
		}, function($1) {
			var $$;
			$$ = "%";
			return $$;
		}, function($1) {
			var $$;
			this.prog.addId($1, true);
			$$ = [null, $1];
			return $$;
		}, function($1, $2, $3) {
			var $$;
			this.prog.addId($1, true);
			this.prog.addId($3, true);
			$$ = [$1, $3];
			return $$;
		}, , , function($1, $2, $3, $4, $5) {
			var $$;
			$$ = new ast.Conditional($1, $3, $5);
			return $$;
		}, , function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, "||", $3);
			return $$;
		}, , function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, "&&", $3);
			return $$;
		}, , function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '==', $3);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '!=', $3);
			return $$;
		}, , function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '<', $3);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '>', $3);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '<=', $3);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '>=', $3);
			return $$;
		}, , function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '+', $3);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '-', $3);
			return $$;
		}, , function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '*', $3);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '/', $3);
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$$ = ast.buildBinary($1, '%', $3);
			return $$;
		}, function($1, $2) {
			var $$;
			$$ = ast.buildUnary("!", $2);
			return $$;
		}, function($1, $2) {
			var $$;
			$$ = ast.buildUnary("-", $2);
			return $$;
		}, , $f0, $f0, $f0, $f0, function($1) {
			var $$;
			this.prog.addId($1, false);
			$$ = new ast.Id($1);
			return $$;
		}, $f1, , function($1, $2, $3) {
			var $$;
			$$ = new ast.MemberExpr($1, ".", $3.text);
			return $$;
		}, function($1, $2, $3, $4) {
			var $$;
			$$ = new ast.MemberExpr($1, "[]", $3);
			return $$;
		}, function($1, $2) {
			var $$;
			$$ = ast.buildCall($1, $2);
			return $$;
		}, function($1, $2) {
			var $$;
			$$ = [];
			return $$;
		}, $f1, function($1) {
			var $$;
			$$ = [$1];
			return $$;
		}, function($1, $2, $3) {
			var $$;
			$1.push($3);
			$$ = $1;
			return $$;
		}, , , function() {
			var $$;
			$$ = this.prog = new ProgramNode;
			return $$;
		}, function() {
			var $$;
			$$ = procInclude(this.get(-1), this.path, this.includes);
			return $$;
		}];

		function getAction(x, y) {
			var list = tAction[actionIndex[x]];
			return list[y] || list._;
		}
		return function(lexer, path, includes) {
			function getToken() {
				var t = lexer.scan();
				if (t.tag == 'ws') t = lexer.scan();
				return t;
			}

			var s = 0;
			var stateStack = [0];
			var a = getToken();
			var valueStack = [];
			var obj = {
				get: function(i) {
					return valueStack[valueStack.length + i];
				},
				set: function(i, v) {
					valueStack[valueStack.length + i] = v;
				},
				path: path,
				includes: includes,
				prog: null
			};

			while (1) {
				var t = getAction(s, tSymbolIndex[a.tag]);
				if (!t) err();
				else if (t > 0) {
					stateStack.push(s = t);
					valueStack.push(a);
					a = getToken();
				} else if (t < 0 && t > -32768) {
					var idx = -t;
					var p = tRules[idx];
					var num = p.length - 1;
					stateStack.length -= num;
					s = tGoto[stateStack[stateStack.length - 1]][p[0] - nBegin];
					stateStack.push(s);

					if (tFuncs[idx]) {
						var val = tFuncs[idx].apply(obj, valueStack.splice(valueStack.length - num, num));
						valueStack.push(val);
					} else if (num != 1) {
						valueStack.splice(valueStack.length - num, num, null);
					}
				} else {
					if (a.tag != tSymbols[0]) err();
					return valueStack[0];
				}
			}

			function err() {
				throw Error("Syntax error: " + lexer.getPos(a.index));
			}
		};
	}();
	/// <reference path="codeg.js"/>

	function compile2js(prog) {
		var s_output;
		var hasEncode = false;
		var s_indent = '';
		var idRet = '';
		var getId = null;

		function indent() {
			s_indent += '  ';
		}

		function outdent() {
			s_indent = s_indent.substr(0, s_indent.length - 2);
		}

		function init() {
			idRet = getId();
			s_output = '(function(data) {\nvar ' + idRet + ' = "";\n';
		}

		function end() {
			if (hasEncode) s_output += htmlEncode;
			s_output += 'return ' + idRet + ';\n})';
			return s_output;
		}

		function emit(s) {
			s_output += s_indent + s + '\n';
		}

		function compileEval(stmt) {
			var t = walkExpr(stmt.expr);
			if (stmt.encode) {
				hasEncode = true;
				t = 'htmlEncode(' + t + ')';
			}
			emit(idRet + ' += ' + t + ';');
		}

		function compileContent(stmt) {
			emit(idRet + ' += ' + quote(stmt.text) + ';');
		}

		function compileIf(stmt) {
			emit('if(' + walkExpr(stmt.expr) + '){');
			indent();
			compileStmts(stmt.stmts);
			outdent();
			emit('}');
			if (stmt.falseStmts) {
				emit('else{');
				indent();
				compileStmts(stmt.falseStmts);
				outdent();
				emit('}');
			}
		}

		function compileEach(stmt) {
			var idKey = stmt.idKey || getId();
			var idItem = stmt.idItem;
			if (stmt.type == '@') {
				emit('for(var ' + idKey + '=0; ' + idKey + '<' + exprToStr(stmt.expr, isMember) + '.length; ++' + idKey + ')');
			} else {
				emit('for(var ' + idKey + ' in ' + exprToStr(stmt.expr, isAdd) + ')');
			}
			emit('{');
			indent();
			emit('var ' + idItem + '=' + exprToStr(stmt.expr, isMember) + '[' + idKey + '];');
			compileStmts(stmt.stmts);
			outdent();
			emit('}');
		}

		function compileVar(stmt) {
			emit('var ' + stmt.id + ' = ' + walkExpr(stmt.expr) + ';');
		}

		function compileStmt(stmt) {
			switch (stmt.tag) {
				case 'eval':
					compileEval(stmt);
					break;
				case 'content':
					compileContent(stmt);
					break;
				case 'if':
					compileIf(stmt);
					break;
				case 'each':
					compileEach(stmt);
					break;
				case 'set':
					compileVar(stmt);
					break;
				default:
					throw 2;
			}
		}

		function compileStmts(stmts) {
			for (var i = 0; i < stmts.length; ++i)
			compileStmt(stmts[i]);
		}

		function compileProgram(prog) {
			getId = prog.genGetId();
			init();
			compileStmts(prog.stmts);
			return end();
		}

		function isAtom(op) {
			switch (op) {
				case 'id':
				case 'literal':
					return true;
			}
			return false;
		}

		function isMember(op) {
			if (isAtom(op)) return true;
			switch (op) {
				case '.':
				case '[]':
					return true;
			}
			return false;
		}

		function isCall(op) {
			return op == 'call';
		}

		function isLHS(op) {
			return isMember(op) || isCall(op);
		}

		function isUnary(op) {
			return isLHS(op) || op == 'u!' || op == 'u-';
		}

		function isMul(op) {
			if (isUnary(op)) return true;
			switch (op) {
				case '*':
				case '/':
				case '%':
					return true;
			}
			return false;
		}

		function isAdd(op) {
			if (isMul(op)) return true;
			switch (op) {
				case '+':
				case '-':
					return true;
			}
			return false;
		}

		function isRel(op) {
			if (isAdd(op)) return true;
			switch (op) {
				case '<':
				case '>':
				case '<=':
				case '>=':
					return true;
			}
			return false;
		}

		function isEquality(op) {
			if (isRel(op)) return true;
			switch (op) {
				case '==':
				case '!=':
					return true;
			}
			return false;
		}

		function isLogicalAnd(op) {
			return isEquality(op) || op == '&&';
		}

		function isLogicalOr(op) {
			return isLogicalAnd(op) || op == '||';
		}


		function exprToStr(x, check) {
			var t = walkExpr(x);
			if (check && !check(x.op)) t = '(' + t + ')';
			return t;
		}

		function walkExpr(x) {
			switch (x.op) {
				case 'id':
				case 'literal':
					return x.toString();
				case '.':
					return exprToStr(x.expr1, isMember) + "['" + x.expr2 + "']";
				case '[]':
					return exprToStr(x.expr1, isMember) + '[' + walkExpr(x.expr2) + ']';
				case 'u!':
				case 'u-':
					return x.op.charAt(1) + ' ' + exprToStr(x.expr, isUnary);
				case '*':
				case '/':
				case '%':
					return exprToStr(x.expr1, isMul) + x.op + exprToStr(x.expr2, isUnary);
				case '+':
				case '-':
					return exprToStr(x.expr1, isAdd) + x.op + ' ' + exprToStr(x.expr2, isMul);
				case '<':
				case '>':
				case '<=':
				case '>=':
					return exprToStr(x.expr1, isRel) + x.op + exprToStr(x.expr2, isAdd);
				case '==':
				case '!=':
					return exprToStr(x.expr1, isEquality) + x.op + exprToStr(x.expr2, isRel);
				case '&&':
					return exprToStr(x.expr1, isLogicalAnd) + '&&' + exprToStr(x.expr2, isEquality);
				case '||':
					return exprToStr(x.expr1, isLogicalOr) + '||' + exprToStr(x.expr2, isLogicalAnd);
				case '?':
					return exprToStr(x.expr1, isLogicalOr) + '?' + exprToStr(x.expr2, null) + ':' + exprToStr(x.expr3, null);
				case 'call':
					var s = exprToStr(x.fn) + '(';
					for (var i = 0; i < x.args.length; ++i) {
						if (i > 0) s += ',';
						s += exprToStr(x.args[i]);
					}
					return s + ')';
				default:
					throw Error("unknown expr: " + x.op);
			}
		}
		return compileProgram(prog);
	}
	/// <reference path="codeg.js"/>

	function compile2php(prog) {
		var s_output;
		var s_indent = '';
		var idRet = '';
		var getId = null;

		function indent() {
			s_indent += '  ';
		}

		function outdent() {
			s_indent = s_indent.substr(0, s_indent.length - 2);
		}

		function init() {
			idRet = '$' + getId();
			s_output = 'function temp($data) {\n' + idRet + " = '';\n";
			s_output += 'function isNumber($a) { return is_float($a) || is_int($a); }\n';
			s_output += 'function plus($a, $b) {\
if (isNumber($a) && isNumber($b)) {\
	return $a + $b;\
}\
else {\
	return ToString($a) . ToString($b);\
}\
}\n';
			s_output += 'function logical_and($a, $b) { return $a ? $b : $a; }\n';
			s_output += 'function logical_or($a, $b) { return $a ? $a : $b; }\n';
			s_output += "function ToString($a) {\n\
	if (is_string($a)) return $a;\n\
	if (isNumber($a)) return (string)$a;\n\
	if (is_bool($a)) return $a ? 'true' : 'false';\n\
	if (is_null($a)) return 'null';\n\
	if (is_array($a)) {\n\
		$s = '';\n\
		for ($i = 0; $i < count($a); ++$i) {\n\
			if ($i > 0) $s .= ',';\n\
			if (!is_null($a[$i]))\n\
				$s .= ToString($a[$i]);\n\
		}\n\
		return $s;\n\
	}\n\
	return '[object Object]';\n\
}\n";
			s_output += 'function ToBoolean($a) {\n\
	if (is_string($a)) return strlen($a) > 0;\n\
	if (is_array($a) || is_object($a)) return true;\n\
	return (bool)$a;\n\
}\n';
		}

		function end() {
			s_output += 'return ' + idRet + ';\n}';
			return s_output;
		}

		function emit(s) {
			s_output += s_indent + s + '\n';
		}

		function compileEval(stmt) {
			var t = 'ToString(' + walkExpr(stmt.expr) + ')';
			if (stmt.encode) {
				t = 'htmlspecialchars(' + t + ')';
			}
			emit(idRet + ' .= ' + t + ';');
		}

		function compileContent(stmt) {
			emit(idRet + ' .= ' + phpQuote(stmt.text) + ';');
		}

		function compileIf(stmt) {
			emit('if(' + walkExpr(stmt.expr) + '){');
			indent();
			compileStmts(stmt.stmts);
			outdent();
			emit('}');
			if (stmt.falseStmts) {
				emit('else{');
				indent();
				compileStmts(stmt.falseStmts);
				outdent();
				emit('}');
			}
		}

		function compileEach(stmt) {
			var idKey = stmt.idKey ? '$' + stmt.idKey + '=>' : '';
			var idItem = stmt.idItem;
			emit('foreach(' + walkExpr(stmt.expr) + ' as ' + idKey + '$' + idItem + ')');
			emit('{');
			indent();
			compileStmts(stmt.stmts);
			outdent();
			emit('}');
		}

		function compileVar(stmt) {
			emit('$' + stmt.id + ' = ' + walkExpr(stmt.expr) + ';');
		}

		function compileStmt(stmt) {
			switch (stmt.tag) {
				case 'eval':
					compileEval(stmt);
					break;
				case 'content':
					compileContent(stmt);
					break;
				case 'if':
					compileIf(stmt);
					break;
				case 'each':
					compileEach(stmt);
					break;
				case 'set':
					compileVar(stmt);
					break;
				default:
					throw 2;
			}
		}

		function compileStmts(stmts) {
			for (var i = 0; i < stmts.length; ++i)
			compileStmt(stmts[i]);
		}

		function compileProgram(prog) {
			getId = prog.genGetId();
			init();
			compileStmts(prog.stmts);
			return end();
		}

		function isAtom(op) {
			switch (op) {
				case 'id':
				case 'literal':
					return true;
			}
			return false;
		}

		function isMember(op) {
			if (isAtom(op)) return true;
			switch (op) {
				case '.':
				case '[]':
				case '+':
				case '&&':
				case '||':
					return true;
			}
			return false;
		}

		function isUnary(op) {
			return isMember(op) || op == 'u!' || op == 'u-';
		}

		function isMul(op) {
			if (isUnary(op)) return true;
			switch (op) {
				case '*':
				case '/':
				case '%':
					return true;
			}
			return false;
		}

		function isAdd(op) {
			return isMul(op) || op == '-';
		}

		function isRel(op) {
			if (isAdd(op)) return true;
			switch (op) {
				case '<':
				case '>':
				case '<=':
				case '>=':
					return true;
			}
			return false;
		}

		function isEquality(op) {
			if (isRel(op)) return true;
			switch (op) {
				case '==':
				case '!=':
					return true;
			}
			return false;
		}

		function isLogicalAnd(op) {
			return isEquality(op);
		}

		function isLogicalOr(op) {
			return isLogicalAnd(op);
		}


		function exprToStr(x, check) {
			var t = walkExpr(x);
			if (check && !check(x.op)) t = '(' + t + ')';
			return t;
		}

		function walkExpr(x) {
			switch (x.op) {
				case 'id':
					return '$' + x;
				case 'literal':
					return x.toString();
				case '.':
					return exprToStr(x.expr1, isMember) + "->" + x.expr2;
				case '[]':
					return exprToStr(x.expr1, isMember) + '[' + walkExpr(x.expr2) + ']';
				case 'u!':
					return '!ToBoolean(' + exprToStr(x.expr, isUnary) + ')';
				case 'u-':
					return '- ' + exprToStr(x.expr, isUnary);
				case '*':
				case '/':
				case '%':
					return exprToStr(x.expr1, isMul) + x.op + exprToStr(x.expr2, isUnary);
				case '+':
					return 'plus(' + exprToStr(x.expr1, null) + ', ' + exprToStr(x.expr2, null) + ')';
				case '-':
					return exprToStr(x.expr1, isAdd) + '- ' + exprToStr(x.expr2, isMul);
				case '<':
				case '>':
				case '<=':
				case '>=':
					return exprToStr(x.expr1, isRel) + x.op + exprToStr(x.expr2, isAdd);
				case '==':
				case '!=':
					return exprToStr(x.expr1, isEquality) + x.op + exprToStr(x.expr2, isRel);
				case '&&':
					return 'logical_and(' + exprToStr(x.expr1, null) + ', ' + exprToStr(x.expr2, null) + ')';
				case '||':
					return 'logical_or(' + exprToStr(x.expr1, null) + ', ' + exprToStr(x.expr2, null) + ')';
				case '?':
					return exprToStr(x.expr1, isLogicalOr) + '?' + exprToStr(x.expr2, null) + ':' + exprToStr(x.expr3, null);
				default:
					throw Error("unknown expr: " + x.op);
			}
		}

		return compileProgram(prog);
	}

	function Crox(s) {
		/// <param name="s" type="String"></param>
		var lx = Lexer(s);
		//alert(location);
		var ast = parse(lx, location.href, []);
		//var undefIds = (ast.getUndefined());
		//if (undefIds.length > 0)
		//	throw Error("变量未定义：" + undefIds.join(', '));
		this.ast = ast;
	}
	Crox.prototype.genPhp = function() {
		return compile2php(this.ast);
	};
	Crox.prototype.genJs = function() {
		return compile2js(this.ast);
	};
	Crox.prototype.genJsFn = function() {
		return eval('0,' + this.genJs());
	};
	Crox.prototype.render = function(data) {
		return this.genJsFn()(data);
	};
	this.Crox = Crox;
})();