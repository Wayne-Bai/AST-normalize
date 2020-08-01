var moe = require('../../runtime');
var OWNS = moe.OWNS;
var moecrt = require('../compiler.rt');
var nt = moecrt.NodeType;
var ScopedScript = moecrt.ScopedScript;
var Node = moecrt.MakeNode;

var CPS_EXPRESSION_SEGMENT_NAMESPACE = 'es'

var ScriptFlow = function(makeT){
	this.statements = []
	this.labels = []
	this.identLabel = {}

	this.pushStatement = function(s){
		if(!s) return;
		if(s.type === nt.VARIABLE || s.type === nt.TEMPVAR) return;
		this.statements.push(s);
		this.labels.push(null);
	}
	this.label = function(id, enterId){
		if(this.labels[this.labels.length - 1] && !enterId && !this.statements[this.labels.length - 1]){
			this.identLabel[id] = this.labels[this.labels.length - 1]
		} else {
			this.statements.push(enterId);
			this.labels.push(id);
		}
	}
	this.pushExpPart = function(node){
		while(node && node.type === nt.GROUP) node = node.operand;
		if(node && 
			(  node.type === nt.TEMPVAR && node.name.slice(0, CPS_EXPRESSION_SEGMENT_NAMESPACE.length) === CPS_EXPRESSION_SEGMENT_NAMESPACE 
			|| node.type === nt.LITERAL)) return node;

		var t = makeT();
		this.pushStatement(new Node(nt.ASSIGN, {
			left: new Node(nt.TEMPVAR, {name: t}),
			right: node
		}));
		return new Node(nt.TEMPVAR, {name: t});
	}
	this.GoTo = function(id){
		return new Node(nt.RETURN, {
			expression: new Node(nt.CALL, {
				func: new Node(nt.TEMPVAR, {name: id}),
				args: [],
				names: []
			}),
			isGoTo: true
		});
	}
	this.join = function(){
		var script = new Node(nt.SCRIPT, {content: []});
		var blockScript = new Node(nt.SCRIPT, {content: []});
		var currentLabel = null;
		var currentEnterId = null;
		var dceSupressed = false;

		for(var j = 0; j < this.statements.length; j++){
			if(this.labels[j]) {
				// Label
				if(currentLabel) {
					// Push a final jump
					if(!dceSupressed) {
						blockScript.content.push(this.GoTo(this.labels[j]));
					}
					// Create a label assignment
					script.content.push(new Node(nt.ASSIGN, {
						left: new Node(nt.TEMPVAR, {name: currentLabel}),
						right: new Node(nt.BLOCK, {
							code: blockScript,
							arg: currentEnterId
						})
					}));
				};

				// Start a new block;
				blockScript = new Node(nt.SCRIPT, {content: []});
				currentLabel = this.labels[j];
				currentEnterId = this.statements[j] ? new Node(nt.TEMPVAR, {name: this.statements[j]}) : null;
				dceSupressed = false;
			} else if(this.statements[j] && !dceSupressed) {
				// Common Statement
				blockScript.content.push(this.statements[j]);
				dceSupressed = (this.statements[j].type === nt.RETURN);
			}
		}

		// Process last block
		script.content.push(new Node(nt.ASSIGN, {
			left: new Node(nt.TEMPVAR, {name: currentLabel}),
			right: new Node(nt.BLOCK, {
				code: blockScript,
				arg: currentEnterId
			})
		}));

		for(each in this.identLabel) if(OWNS(this.identLabel, each)) {
			script.content.push(new Node(nt.ASSIGN, {
				left: new Node(nt.TEMPVAR, {name: each}),
				right: new Node(nt.TEMPVAR, {name: this.identLabel[each]})
			}));
		}

		script.content.push(new Node(nt.RETURN, {
			expression: script.content[0].left
		}))

		return script;
	}
}

var transform = exports.transform = function(code, scope, config, aux){
	var makeT = aux.makeT || function(){return config.makeT(scope, CPS_EXPRESSION_SEGMENT_NAMESPACE)};
	var flow = new ScriptFlow(makeT);

	var NaturalTransform = function(){
		var propList = arguments;
		return function(){
			for(var j = 0; j < propList.length; j++){
				if('*' === propList[j].charAt(0)) {
					var listProp = propList[j].slice(1);
					for(var k = 0; k < this[listProp].length; k++){
						this[listProp][k] = pep(this[listProp][k])
					}
				} else {
					this[propList[j]] = pep(this[propList[j]])
				}
			}
			return this;
		}
	}

	var schemata = []
	var ct = function(node){
		if(!node || !node.type || !node.bindPoint) return node
		if(!schemata[node.type]){
			throw node;
		}
		else return schemata[node.type].call(node);
	}

	var pep = function(node){
		return flow.pushExpPart(ct(node))
	}
	var pct = function(node){
		return flow.pushStatement(ct(node));
	}

	var BN = function(condition, label){
		return new Node(nt.IF, {
			condition: new Node(nt.NOT, {operand: condition}),
			thenPart: new Node(nt.SCRIPT, {content: [flow.GoTo(label)]})
		})
	}
	var BT = function(condition, label){
		return new Node(nt.IF, {
			condition: condition,
			thenPart: new Node(nt.SCRIPT, {content: [flow.GoTo(label)]})
		})
	}

	/// Expressions
	schemata[nt.FUNCTION] = function(){
		return this;
	}
	schemata[nt.OBJECT] = function(){
		for(var j = 0; j < this.args.length; j++){
			this.args[j] = pep(this.args[j]);
		};
		return this;
	}

	var bindFunctionPart = function(){
		switch (this.type) {
			case nt.MEMBER:
				return new Node(nt.MEMBER, {
					left: pep(this.left),
					right: pep(this.right)
				})
			case nt.CTOR:
				return new Node(nt.CTOR, {
					expression: pep(this.expression)
				});
			default:
				return pep(this)
		}
	};

	schemata[nt.CALL] = function () {
		if(this.func && this.func.type === nt.BINDPOINT) return awaitCall.apply(this, arguments);

		this.func = bindFunctionPart.call(this.func);
		for(var i = 0; i < this.args.length; i++){
			this.args[i] = pep(this.args[i]);
		};
		return this;
	};

	var awaitCall = function(){
		if(this.func.expression){
			var f = bindFunctionPart.call(this.func.expression);
		}
		for(var i = 0; i < this.args.length; i++){
			this.args[i] = pep(this.args[i]);
		};
		if(f){
			this.func = new Node(nt.MEMBER, {
				left: new Node(nt.TEMPVAR, {name: 'SCHEMATA'}),
				right: new Node(nt.LITERAL, {value: 'bindYield'})
			});
			if(f.type === nt.MEMBER){
				this.args.unshift(f.left);
				this.args.unshift(f);
			} else {
				this.args.unshift(new Node(nt.LITERAL, {value: {map: 'null'}}))
				this.args.unshift(f);
			}
		} else {
			this.func = new Node(nt.MEMBER, {
				left: new Node(nt.TEMPVAR, {name: 'SCHEMATA'}),
				right: new Node(nt.LITERAL, {value: 'bind'})
			});
		};
		var l = makeT();
		var e = makeT();
		this.args.push(new Node(nt.TEMPVAR, {name: l}));
		flow.pushStatement(new Node(nt.RETURN, {
			expression: this
		}));
		flow.label(l, e);
		return new Node(nt.TEMPVAR, {name: e});
	};

	schemata[nt.BINDPOINT] = function(){
		return awaitCall.call(new Node(nt.CALL, {
			func: this,
			args: [],
			names: []
		}))
	}

	schemata[nt.CALLBLOCK] = function(){
		var l = makeT();
		var e = makeT();
		flow.pushStatement(new Node(nt.RETURN, {
			expression: new Node(nt.CALL, {
				func: new Node(nt.MEMBER, {
					left: new Node(nt.TEMPVAR, {name: 'SCHEMATA'}),
					right: new Node(nt.LITERAL, {value: 'resend'})
				}),
				args: [
					pep(this.func),
					new Node(nt.TEMPVAR, {name: l})
				],
				names: [null, null, null]
			})
		}));
		flow.label(l);
		return new Node(nt.TEMPVAR, {name: e});
	}

	schemata[nt.GROUP] = NaturalTransform('operand');
	schemata[nt.NEGATIVE] = NaturalTransform('operand');
	schemata[nt.NOT] = NaturalTransform('operand');
	schemata[nt.CTOR] = NaturalTransform('expression');
	schemata[nt.ASSIGN] = function(){
		if(this.left && this.left.type === nt.MEMBER){
			this.left.left = pep(this.left.left);
			this.left.right = pep(this.left.right);
		};
		this.right = pep(this.right)
		return this;
	}

	var binoper = function(s){
		schemata[nt[s]] = NaturalTransform('left', 'right');
	}
	binoper('+');
	binoper('-');
	binoper('*');
	binoper('/');
	binoper('%');
	binoper('<');
	binoper('>');
	binoper('<=');
	binoper('>=');
	binoper('==');
	binoper('=~');
	binoper('===');
	binoper('!==');
	binoper('!=');
	binoper('!~');
	binoper('is');
	binoper('as');
	binoper('..');
	binoper('...');
	binoper('MEMBER');

	schemata[nt['and']] = schemata[nt['&&']] = function(){
		var left = pep(this.left);
		var lElse = makeT();
		flow.pushStatement(BN(left, lElse));
		var right = pep(this.right);
		var lEnd = makeT();
		flow.pushStatement(flow.GoTo(lEnd));
		flow.label(lElse);
		flow.pushStatement(new Node(nt.ASSIGN, {
			left: right, 
			right: new Node(nt.LITERAL, {value: {map: 'false'}})
		}));
		flow.label(lEnd);
		this.left = left;
		this.right = right;
		return this;
	}
	schemata[nt['or']] = schemata[nt['||']] = function(){
		var left = pep(this.left);
		var lElse = makeT();
		flow.pushStatement(BT(left, lElse));
		var right = pep(this.right);
		var lEnd = makeT();
		flow.pushStatement(flow.GoTo(lEnd));
		flow.label(lElse);
		flow.pushStatement(new Node(nt.ASSIGN, {
			left: right, 
			right: new Node(nt.LITERAL, {value: {map: 'true'}})
		}));
		flow.label(lEnd);
		this.left = left;
		this.right = right;
		return this;
	}
	schemata[nt['CONDITIONAL']] = function(){
		var condition = pep(this.condition);
		var lElse = makeT();
		flow.pushStatement(BN(condition, lElse));
		var thenPart = pep(this.thenPart);
		var lEnd = makeT();
		flow.pushStatement(flow.GoTo(lEnd));
		flow.label(lElse);
		var elsePart = pep(this.elsePart);
		flow.label(lEnd);

		this.condition = condition;
		this.thenPart = thenPart;
		this.elsePart = elsePart;
		return this;
	}
	schemata[nt['then']] = NaturalTransform('*args')



	/// STATEMENTS

	var labelStatements = aux.labelStatements || {};
	var lNearestLoop = aux.lNearestLoop || null;

	schemata[nt.SCRIPT] = function(){
		for(var i = 0; i < this.content.length; i++){
			pct(this.content[i]);
		}
	}
	schemata[nt.IF] = function(){
		var lElse = makeT();
		flow.pushStatement(BN(ct(this.condition), lElse));
		pct(this.thenPart);
		if(this.elsePart){
			var lEnd = makeT();
			flow.pushStatement(flow.GoTo(lEnd));
			flow.label(lElse);
			pct(this.elsePart);
			flow.label(lEnd);
		} else {
			flow.label(lElse);
		}
	}
	schemata[nt.WHILE] = function(){
		var lLoop = makeT();
		var lLoopEnd = makeT();
		var bk = lNearestLoop;
		lNearestLoop = lLoopEnd;

		flow.label(lLoop);
		flow.pushStatement(BN(ct(this.condition), lLoopEnd));
		pct(this.body);
		flow.pushStatement(flow.GoTo(lLoop));
		flow.label(lLoopEnd);
		lNearestLoop = bk;
	}
	schemata[nt.REPEAT] = function(){
		var lLoop = makeT();
		var lLoopEnd = makeT();
		var bk = lNearestLoop;
		lNearestLoop = lLoopEnd;

		flow.label(lLoop);
		pct(this.body);
		flow.pushStatement(BT(ct(this.condition), lLoop));
		flow.label(lLoopEnd);
		lNearestLoop = bk;
	}
	schemata[nt.LABEL] = function(){
		var l = labelStatements[this.name] = makeT();
		pct(this.body);
		flow.label(l);
	}
	schemata[nt.BREAK] = function(){
		flow.pushStatement(flow.GoTo(this.destination ? labelStatements[this.destination] : lNearestLoop));
	}
	schemata[nt.RETURN] = function(){
		flow.pushStatement(new Node(nt.RETURN, {
			expression: new Node(nt.CALL, {
				func: new Node(nt.TEMPVAR, {name: lReturn}),
				args: [ct(this.expression)],
				names: []
			})
		}))
	}
	schemata[nt.TRY] = function(){
		var auxInfo = {
			makeT: makeT,
			labelStatements : labelStatements,
			lNearestLoop : lNearestLoop,
			lReturn: lReturn,
			nested: true
		};
		var bTry = makeT();
		var bCatch = makeT();
		flow.pushStatement(new Node(nt.ASSIGN, {
			left: new Node(nt.TEMPVAR, {name: bTry}),
			right: new Node(nt.BLOCK, {
				arg: new Node(nt.TEMPVAR, {name: 'SCHEMATA'}),
				code: transform(this.attemption, scope, config, auxInfo)
			})
		}));
		var catcherCode;
		if(this.eid){
			auxInfo.enterTID = makeT();
			catcherCode = transform(new Node(nt.SCRIPT, {
				content: [new Node(nt.ASSIGN, {
					left: this.eid,
					right: new Node(nt.TEMPVAR, {name: auxInfo.enterTID})
				})].concat(this.catcher.content),
				bindPoint: true
			}), scope, config, auxInfo)
		} else {
			catcherCode = transform(this.catcher, scope, config, auxInfo)
		}
		flow.pushStatement(new Node(nt.ASSIGN, {
			left: new Node(nt.TEMPVAR, {name: bCatch}),
			right: new Node(nt.BLOCK, {
				arg: new Node(nt.TEMPVAR, {name: 'SCHEMATA'}),
				code: catcherCode
			})
		}));
		var l = makeT();
		flow.pushStatement(new Node(nt.RETURN, {
			expression: new Node(nt.CALL, {
				func: new Node(nt.MEMBER, {
					left: new Node(nt.TEMPVAR, {name: 'SCHEMATA'}),
					right: new Node(nt.LITERAL, {value: 'try'})
				}),
				args: [
					new Node(nt.TEMPVAR, {name: bTry}),
					new Node(nt.TEMPVAR, {name: bCatch}),
					new Node(nt.TEMPVAR, {name: l})
				],
				names: [null, null, null]
			})
		}));
		flow.label(l);
	}





	/// HERE WE GO
	
	var lInit = makeT();
	var lReturn = aux.lReturn || makeT();
	var tReturn = aux.tReturn || makeT();

	flow.label(lInit, aux.enterTID);
	code.bindPoint = true;
	ct(code);
	if(!aux.nested){
		flow.label(lReturn, tReturn);
		flow.pushStatement(new Node(nt.RETURN, {
			expression: new Node(nt.CALL, {
				func: new Node(nt.MEMBER, {
					left: new Node(nt.TEMPVAR, {name: 'SCHEMATA'}),
					right: new Node(nt.LITERAL, {value: 'return'})
				}),
				args: [new Node(nt.TEMPVAR, {name: tReturn})],
				names: [null]
			})
		}))
	} else {
		flow.pushStatement(new Node(nt.RETURN, {
			expression: new Node(nt.CALL, {
				func: new Node(nt.MEMBER, {
					left: new Node(nt.TEMPVAR, {name: 'SCHEMATA'}),
					right: new Node(nt.LITERAL, {value: 'return'})
				}),
				args: [],
				names: [null]
			})
		}))
	}

	return flow.join();
}