var assembler = (function(exports){
  "use strict";
  var util      = require('util');

  var objects   = require('./lib/objects'),
      functions = require('./lib/functions'),
      iteration = require('./lib/iteration'),
      utility   = require('./lib/utility'),
      traversal = require('./lib/traversal'),
      Stack     = require('./lib/Stack'),
      HashMap   = require('./lib/HashMap');

  var walk          = traversal.walk,
      collector     = traversal.collector,
      clone         = traversal.clone,
      Visitor       = traversal.Visitor,
      fname         = functions.fname,
      define        = objects.define,
      assign        = objects.assign,
      create        = objects.create,
      copy          = objects.copy,
      inherit       = objects.inherit,
      ownKeys       = objects.keys,
      hasOwn        = objects.hasOwn,
      isObject      = objects.isObject,
      Hash          = objects.Hash,
      Iterator      = iteration.Iterator,
      StopIteration = iteration.StopIteration,
      each          = iteration.each,
      repeat        = iteration.repeat,
      map           = iteration.map,
      fold          = iteration.fold,
      generate      = iteration.generate,
      quotes        = utility.quotes,
      uid           = utility.uid,
      pushAll       = utility.pushAll;

  var CONTINUE = walk.CONTINUE,
      RECURSE  = walk.RECURSE,
      BREAK    = walk.BREAK;

  var proto = Math.random().toString(36).slice(2),
      context,
      _push = [].push,
      opcodes = 0;

  function StandardOpCode(params, name){
    var func = this.creator();
    this.id = func.id = opcodes++;
    this.params = func.params = params;
    this.name = func.opname = name;
    func.opcode = this;
    return func;
  }

  define(StandardOpCode.prototype, [
    function creator(){
      var opcode = this;
      return function(){
        return context.code.createDirective(opcode, arguments);
      };
    },
    function inspect(){
      return this.name;
    },
    function toString(){
      return this.name
    },
    function valueOf(){
      return this.id;
    },
    function toJSON(){
      return this.id;
    }
  ]);


  function InternedOpCode(params, name){
    return StandardOpCode.call(this, params, name);
  }

  inherit(InternedOpCode, StandardOpCode, [
    function creator(){
      var opcode = this;
      return function(a, b, c){
        //return context.code.createDirective(opcode, [context.intern(arg)]);
        return context.code.createDirective(opcode, [a, b, c]);
      };
    }
  ]);


  function macro(name){
    var params = [],
        ops = [];

    var body = map(arguments, function(arg, a){
      if (!a) return '';
      arg instanceof Array || (arg = [arg]);
      var opcode = arg.shift();
      ops.push(opcode);
      return opcode.opname + '('+generate(opcode.params, function(i){
        if (i in arg) {
          if (typeof arg[i] === 'string') {
            return quotes(arg[i]);
          }
          return arg[i] + '';
        } else {
          var param = '$'+String.fromCharCode(a + 96) + String.fromCharCode(i + 97);
          params.push(param);
          return param;
        }
      }).join(', ') + ');';
    }).join('');

    var src = 'return function '+name+'('+params.join(', ')+'){'+body+'}';
    var func = Function.apply(null, map(ops, function(op){ return op.opname }).concat(src)).apply(null, ops);
    func.params = func.length;
    func.opname = name;
    return func;
  }



  var ADD              = new StandardOpCode(1, 'ADD'),
      AND              = new StandardOpCode(1, 'AND'),
      ARRAY            = new StandardOpCode(0, 'ARRAY'),
      ARG              = new StandardOpCode(0, 'ARG'),
      ARGS             = new StandardOpCode(0, 'ARGS'),
      ARGUMENTS        = new StandardOpCode(0, 'ARGUMENTS'),
      ARRAY_DONE       = new StandardOpCode(0, 'ARRAY_DONE'),
      BINARY           = new StandardOpCode(1, 'BINARY'),
      BINDING          = new StandardOpCode(2, 'BINDING'),
      CALL             = new StandardOpCode(1, 'CALL'),
      CASE             = new StandardOpCode(1, 'CASE'),
      CLASS_DECL       = new StandardOpCode(1, 'CLASS_DECL'),
      CLASS_EXPR       = new StandardOpCode(1, 'CLASS_EXPR'),
      COMPLETE         = new StandardOpCode(0, 'COMPLETE'),
      CONST            = new StandardOpCode(1, 'CONST'),
      CONSTRUCT        = new StandardOpCode(0, 'CONSTRUCT'),
      DEBUGGER         = new StandardOpCode(0, 'DEBUGGER'),
      DEFAULT          = new StandardOpCode(1, 'DEFAULT'),
      DEFINE           = new StandardOpCode(1, 'DEFINE'),
      DUP              = new StandardOpCode(0, 'DUP'),
      ELEMENT          = new StandardOpCode(0, 'ELEMENT'),
      ENUM             = new StandardOpCode(0, 'ENUM'),
      EXTENSIBLE       = new StandardOpCode(1, 'EXTENSIBLE'),
      EVAL             = new StandardOpCode(0, 'EVAL'),
      FLIP             = new StandardOpCode(1, 'FLIP'),
      FUNCTION         = new StandardOpCode(3, 'FUNCTION'),
      GET              = new StandardOpCode(0, 'GET'),
      GET_GLOBAL       = new InternedOpCode(1, 'GET_GLOBAL'),
      HAS_BINDING      = new StandardOpCode(1, 'HAS_BINDING'),
      HAS_GLOBAL       = new InternedOpCode(1, 'HAS_GLOBAL'),
      INC              = new StandardOpCode(0, 'INC'),
      INDEX            = new StandardOpCode(1, 'INDEX'),
      INTERNAL_MEMBER  = new InternedOpCode(1, 'INTERNAL_MEMBER'),
      ITERATE          = new StandardOpCode(0, 'ITERATE'),
      JUMP             = new StandardOpCode(1, 'JUMP'),
      JEQ_NULL         = new StandardOpCode(1, 'JEQ_NULL'),
      JEQ_UNDEFINED    = new StandardOpCode(1, 'JEQ_UNDEFINED'),
      JFALSE           = new StandardOpCode(1, 'JFALSE'),
      JLT              = new StandardOpCode(2, 'JLT'),
      JLTE             = new StandardOpCode(2, 'JLTE'),
      JGT              = new StandardOpCode(2, 'JGT'),
      JGTE             = new StandardOpCode(2, 'JGTE'),
      JNEQ_NULL        = new StandardOpCode(1, 'JNEQ_NULL'),
      JNEQ_UNDEFINED   = new StandardOpCode(1, 'JNEQ_UNDEFINED'),
      JTRUE            = new StandardOpCode(1, 'JTRUE'),
      LET              = new StandardOpCode(1, 'LET'),
      LITERAL          = new StandardOpCode(1, 'LITERAL'),
      LOG              = new StandardOpCode(0, 'LOG'),
      LOOP             = new StandardOpCode(0, 'LOOP'),
      MEMBER           = new InternedOpCode(1, 'MEMBER'),
      METHOD           = new StandardOpCode(3, 'METHOD'),
      MOVE             = new StandardOpCode(1, 'MOVE'),
      NATIVE_CALL      = new StandardOpCode(1, 'NATIVE_CALL'),
      NATIVE_REF       = new InternedOpCode(1, 'NATIVE_REF'),
      OBJECT           = new StandardOpCode(0, 'OBJECT'),
      OR               = new StandardOpCode(1, 'OR'),
      POP              = new StandardOpCode(0, 'POP'),
      POPN             = new StandardOpCode(1, 'POPN'),
      PROPERTY         = new InternedOpCode(1, 'PROPERTY'),
      PROTO            = new StandardOpCode(0, 'PROTO'),
      PUT              = new StandardOpCode(0, 'PUT'),
      PUT_GLOBAL       = new StandardOpCode(2, 'PUT_GLOBAL'),
      REF              = new InternedOpCode(1, 'REF'),
      REFSYMBOL        = new InternedOpCode(1, 'REFSYMBOL'),
      REGEXP           = new StandardOpCode(1, 'REGEXP'),
      REST             = new StandardOpCode(1, 'REST'),
      RETURN           = new StandardOpCode(0, 'RETURN'),
      RETURN_CHECK     = new StandardOpCode(0, 'RETURN_CHECK'),
      RETURN_FINALLY   = new StandardOpCode(0, 'RETURN_FINALLY'),
      ROTATE           = new StandardOpCode(1, 'ROTATE'),
      SAVE             = new StandardOpCode(0, 'SAVE'),
      SCOPE_CLONE      = new StandardOpCode(0, 'SCOPE_CLONE'),
      SCOPE_POP        = new StandardOpCode(0, 'SCOPE_POP'),
      SCOPE_PUSH       = new StandardOpCode(0, 'SCOPE_PUSH'),
      SPREAD           = new StandardOpCode(1, 'SPREAD'),
      SPREAD_ARG       = new StandardOpCode(0, 'SPREAD_ARG'),
      SPREAD_ARRAY     = new StandardOpCode(1, 'SPREAD_ARRAY'),
      STRING           = new InternedOpCode(1, 'STRING'),
      SUPER_ELEMENT    = new StandardOpCode(0, 'SUPER_ELEMENT'),
      SUPER_MEMBER     = new StandardOpCode(1, 'SUPER_MEMBER'),
      SWAP             = new StandardOpCode(0, 'SWAP'),
      SYMBOL           = new InternedOpCode(3, 'SYMBOL'),
      TEMPLATE         = new StandardOpCode(1, 'TEMPLATE'),
      THIS             = new StandardOpCode(0, 'THIS'),
      THROW            = new StandardOpCode(0, 'THROW'),
      TO_OBJECT        = new StandardOpCode(0, 'TO_OBJECT'),
      UNARY            = new StandardOpCode(1, 'UNARY'),
      UNDEFINED        = new StandardOpCode(0, 'UNDEFINED'),
      UPDATE           = new StandardOpCode(1, 'UPDATE'),
      VAR              = new StandardOpCode(1, 'VAR'),
      WITH             = new StandardOpCode(0, 'WITH'),
      YIELD            = new StandardOpCode(1, 'YIELD');

  var ASSIGN = macro('ASSIGN', REF, [ROTATE, 1], PUT, POP);

  function serializeLocation(loc){
    if (loc) {
      if (loc.start) {
        if (loc.start.line === loc.end.line) {
          return [loc.start.line, loc.start.column, loc.end.column];
        } else {
          return [loc.start.line, loc.start.column, loc.end.line, loc.end.column];
        }
      } else if (loc.line) {
        return [loc.line, loc.column];
      }
    }
    return [];
  }

  var Code = exports.code = (function(){
    function Directives(){
      this.length = 0;
    }

    inherit(Directives, Array, [
      function toJSON(){
        return this.map(function(op){
          return op.toJSON ? op.toJSON() : null;
        });
      },
      Array.prototype.forEach || function forEach(callback, context){
        context || (context = this);
        for (var i=0; i < this.length; i++) {
          callback.call(context, this[i], i, this);
        }
      },
      Array.prototype.map || function map(callback, context){
        var result = [];
        context || (context = this);
        for (var i=0; i < this.length; i++) {
          result[i] = callback.call(context, this[i], i, this);
        }
        return result;
      },
      function inspect(){
        var space = new Array((''+this.length).length + 1).join(' ');
        return this.map(function(op, i){
          return (space + i).slice(-space.length) + ' ' + op.inspect();
        }).join('\n');
      }
    ]);

    var Directive = (function(){
      function Directive(op, args){
        this.op = op;
        this.loc = loc();
        this.range = range();
        for (var i=0; i < op.params; i++) {
          this[i] = args[i];
        }
      }

      define(Directive.prototype, [
        function toJSON(){
          var out = {
            op: this.op.name,
            range: this.range
          };

          for (var i=0; i < this.op.params; i++) {
            var item = this[i];
            out[i] = item && item.toJSON ? item.toJSON() : item;
          }

          return out;
        },
        function inspect(){
          var out = [];
          for (var i=0; i < this.op.params; i++) {
            out.push(util.inspect(this[i]));
          }
          return util.inspect(this.op)+'('+out.join(', ')+')';
        }
      ]);

      return Directive;
    })();

    var Parameters = (function(){
      function ParametersIterator(params){
        this.params = params;
        this.index = 0;
      }

      inherit(ParametersIterator, Iterator, [
        function next(){
          if (this.index >= this.params.length) {
            throw StopIteration;
          }
          return this.params[this.index++];
        }
      ]);

      function Parameters(node){
        this.length = 0;
        if (node.params) {
          pushAll(this, node.params);
          this.boundNames = boundNames(node.params);
          this.reduced = reducer(node);
        } else {
          this.reduced = [];
          this.boundNames = [];
        }
        if (node.rest) {
          this.boundNames.push(node.rest.name);
        }
        this.loc = node.loc;
        this.range = node.range;
        this.defaults = node.defaults || [];
        this.Rest = node.rest;
        this.ExpectedArgumentCount = this.length - this.defaults.length;
      }

      define(Parameters.prototype, [
        function getIndex(name){
          return this.boundNames.indexOf(name);
        },
        function __iterator__(){
          return new ParametersIterator(this);
        }
      ]);

      return Parameters;
    })();


    function Code(node, source, lexicalType, scopeType, strict){
      function Instruction(opcode, args){
        Directive.call(this, opcode, args);
      }

      inherit(Instruction, Directive, {
        code: this
      });

      var body = node;

      this.flags = {};
      if (node.type === 'Program') {
        this.flags.topLevel = true;
        this.imports = getImports(node);
        this.scope = scope.create('global');
      } else {
        this.flags.topLevel = false;
        body = body.body;
        if (node.type === 'ModuleDeclaration') {
          this.imports = getImports(body);
          this.scope = scope.create('module', context.currentScope);
          body = body.body;
        } else if (scopeType === 'eval') {
          this.scope = scope.create('eval', context.currentScope);
        } else {
          this.scope = scope.create('normal', context.currentScope);
        }
      }

      define(this, {
        body: body,
        source: source == null ? context.code.source : source,
        script: context.script,
        children: [],
        createDirective: function(opcode, args){
          var op = new Instruction(opcode, args);
          this.ops.push(op);
          return op;
        }
      });

      if (node.id) {
        this.name = node.id.name;
      }

      if (node.generator) {
        this.flags.generator = true;
      }

      this.path = [];
      this.range = node.range;
      this.loc = node.loc;
      this.unwinders = [];
      this.scopeType = scopeType;
      this.lexicalType = lexicalType || 'normal';
      this.flags.usesSuper = referencesSuper(this.body);

      this.LexicalDeclarations = lexDecls(body);
      this.VarScopedDeclarations = varDecls(body);
      this.LexicallyDeclaredNames = [];
      this.VarDeclaredNames = [];

      this.flags.strict = strict || (context.code && context.code.flags.strict) || isStrict(node);
      if (scopeType === 'module') {
        this.exportedNames = getExports(this.body);
        this.flags.strict = true;
      }
      this.ops = new Directives;
      if (node.params) {
        this.params = new Parameters(node);
        this.scope.varDeclare('arguments', 'arguments');
        each(this.params.boundNames, function(name){
          this.varDeclare(name, 'param');
        }, this.scope);
      }
    }


    define(Code.prototype, [
      function derive(code){
        if (code) {
          this.strings = code.strings;
          this.hash = code.hash;
          this.natives = code.natives;
          if (this.natives) {
            this.strict = false;
          }
        }
      },
      function lookup(id){
        return id;
        // if (typeof id === 'number') {
        //   return this.strings[id];
        // } else {
        //   return id;
        // }
      }
    ]);

    return Code;
  })();


  var ClassDefinition = (function(){
    var ctor = require('../third_party/esprima').parse('class X { constructor(...args){ super(...args) } }').body[0].body.body[0];

    function ClassDefinition(node, name){
      var self = this;
      this.name = name || (node.id ? node.id.name : null);
      this.methods = [];
      this.symbols = [[], []];
      this.scope = scope.create('normal', context.currentScope);
      if (node.type === 'ClassExpression' && this.name) {
         this.scope.varDeclare(this.name);
       }

      each(node.body.body, function(node){
        if (node.type === 'SymbolDeclaration') {
          self.defineSymbols(node);
        } else {
          self.defineMethod(node);
        }
      });

      if (!this.ctor) {
        var constructor = clone(ctor);
        node.body.body.push(constructor);
        this.defineMethod(constructor);
      }

      this.hasSuper = !!node.superClass;
      if (this.hasSuper) {
        recurse(node.superClass);
        GET();
      }
    }

    define(ClassDefinition.prototype, [
      function defineSymbols(node){
        var isPublic = node.kind !== 'private',
            self = this;

        each(node.declarations, function(decl){
          var name = decl.id.name;
          self.symbols[0].push(name);
          self.symbols[1].push(isPublic);
        });
      },
      function defineMethod(node){
        var code = new Code(node.value, context.source, 'method', 'class', context.code.flags.strict),
            name = code.name = symbol(node.key);

        code.scope.outer = this.scope;
        code.range = node.range;
        code.loc = node.loc;

        context.queue(code);
        code.displayName = this.name ? this.name+'#'+name.join('') : name.join('');
        if (!name[0]) name = name[1];
        node.kind = node.kind || 'method';

        if (name === 'constructor') {
          this.ctor = code;
          code.classDefinition = this;
        } else {
          this.methods.push({
            kind: node.kind,
            code: code,
            name: name
          });
        }
      }
    ]);

    return ClassDefinition;
  })();

  var Unwinder = (function(){
    function Unwinder(type, begin, end){
      this.type = type;
      this.begin = begin;
      this.end = end;
    }

    define(Unwinder.prototype, [
    ]);

    return Unwinder;
  })();

  var ControlTransfer = (function(){
    function ControlTransfer(labels){
      this.labels = labels;
      this.breaks = [];
      this.continues = [];
    }

    define(ControlTransfer.prototype, {
      labels: null,
      breaks: null,
      continues: null
    });

    define(ControlTransfer.prototype, [
      function updateContinues(ip){
        if (ip !== undefined) {
          each(this.continues, function(item){ item[0] = ip });
        }
      },
      function updateBreaks(ip){
        if (ip !== undefined) {
          each(this.breaks, function(item){ item[0] = ip });
        }
      }
    ]);

    return ControlTransfer;
  })();


  var scope = (function(){
    var types = new Hash;

    var Scope = types.normal = (function(){
      function Scope(outer){
        this.varNames = new Hash;
        this.lexNames = new Hash;
        this.outer = outer;
        //this.children = [];
      }

      define(Scope.prototype, {
        type: 'normal'
      });

      define(Scope.prototype, [
        function varDeclare(name, type){
          this.varNames[name] = type;
        },
        function lexDeclare(name, type){
          if (type === 'function') {
            this.varNames[name] = type;
          } else {
            this.lexNames[name] = type;
          }
        },
        function has(name){
          return name in this.varNames || name in this.lexNames;
        },
        function pop(){
          if (this === context.currentScope) {
            context.currentScope = this.outer;
          }
        }
      ]);

      return Scope;
    })();


    var BlockScope = types.block = (function(){
      function BlockScope(outer){
        this.lexNames = new Hash;
        this.outer = outer;
        //this.children = [];
      }

      inherit(BlockScope, Scope, {
        type: 'block'
      }, [
        function varDeclare(name, type){
          this.outer.varDeclare(name, type);
        },
        function lexDeclare(name, type){
          this.lexNames[name] = type;
        },
        function has(name){
          return name in this.lexNames;
        }
      ]);

      return BlockScope;
    })();


    var GlobalScope = types.global = (function(){
      function GlobalScope(){
        Scope.call(this, null);
      }

      inherit(GlobalScope, Scope, {
        type: 'global'
      });

      return GlobalScope;
    })();

    var ModuleScope = types.module = (function(){
      function ModuleScope(outer){
        Scope.call(this, outer);
      }

      inherit(ModuleScope, GlobalScope, {
        type: 'module'
      });

      return ModuleScope;
    })();


    var EvalScope = types.eval = (function(){
      function EvalScope(outer){
        Scope.call(this, outer);
      }

      inherit(EvalScope, Scope, {
        type: 'eval'
      });

      return EvalScope;
    })();

    return define({}, [
      function resolve(scope, name){
        while (scope) {
          if (scope.has(name)) {
            return scope;
          }
          scope = scope.outer;
        }
      },
      (function(){
        return function create(type, outer){
          var child = new types[type](outer);
          if (outer) {
            //outer.children.push(child);
          }
          return child;
        };
      })()
    ]);
  })();


  function isSuperReference(node) {
    return !!node && node.type === 'Identifier' && node.name === 'super';
  }

  function isPattern(node){
    return !!node && node.type === 'ObjectPattern' || node.type === 'ArrayPattern';
  }

  function isLexicalDeclaration(node){
    return !!node && node.type === 'VariableDeclaration' && node.kind !== 'var';
  }

  function isFunction(node){
    return node.type === 'FunctionExpression'
        || node.type === 'FunctionDeclaration'
        || node.type === 'ArrowFunctionExpression';
  }

  function isDeclaration(node){
    return node.type === 'ClassDeclaration'
        || node.type === 'FunctionDeclaration'
        || node.type === 'VariableDeclaration';
  }

  function isAnonymous(node){
    return !!node && !(node.id && node.id.name)
        && node.type === 'ClassExpression'
        || node.type === 'FunctionExpression'
        || node.type === 'ArrowFunctionExpression';
  }

  var renameables = define({}, [FunctionExpression, ArrowFunctionExpression, ClassExpression]);

  function isUseStrictDirective(node){
    return node.type === 'ExpressionStatement'
        && node.expression.type === 'Literal'
        && node.expression.value === 'use strict';
  }

  function isStrict(node){
    if (isFunction(node)) {
      node = node.body.body;
    } else if (node.type === 'Program') {
      node = node.body;
    }
    if (node instanceof Array) {
      for (var i=0, element; element = node[i]; i++) {
        if (isUseStrictDirective(element)) {
          return true;
        } else if (element.type !== 'EmptyStatement' && element.type !== 'FunctionDeclaration') {
          return false;
        }
      }
    }
    return false;
  }

  function isGlobalOrEval(){
    return context.code.scopeType === 'eval' || context.code.scopeType === 'global';
  }

  var referencesSuper = (function(found){
    function nodeReferencesSuper(node){
      if (node.type === 'MemberExpression') {
        if (isSuperReference(node.object)) {
          found = true;
          return BREAK;
        }
        return RECURSE;
      } else if (node.type === 'CallExpression') {
        if (isSuperReference(node.callee)) {
          found = true;
          return BREAK;
        }
        return RECURSE;
      } else if (isFunction(node)) {
        return CONTINUE;
      } else {
        return RECURSE;
      }
    }

    return function referencesSuper(node){
      found = false;
      walk(node, nodeReferencesSuper);
      return found;
    };
  })()

  var boundNamesCollector = collector({
    ObjectPattern      : 'properties',
    ArrayPattern       : 'elements',
    VariableDeclaration: 'declarations',
    BlockStatement     : RECURSE,
    Program            : RECURSE,
    ForStatement       : RECURSE,
    Property           : 'value',
    ExportDeclaration  : 'declaration',
    ExportSpecifierSet : 'specifiers',
    ImportDeclaration  : 'specifiers',
    Identifier         : ['name'],
    ImportSpecifier    : 'id',
    VariableDeclarator : 'id',
    ModuleDeclaration  : 'id',
    SpreadElement      : 'argument',
    FunctionDeclaration: 'id',
    ClassDeclaration   : 'id'
  });


  function boundNames(node){
    return boundNamesCollector(node);
  }

  var lexDecls = (function(){
    var LexicalDeclarations = (function(lexical){
      return collector({
        ClassDeclaration: lexical(false),
        FunctionDeclaration: lexical(false),
        ExportDeclaration: RECURSE,
        SwitchCase: RECURSE,
        Program: RECURSE,
        VariableDeclaration: lexical(function(node){
          return node.kind === 'const';
        })
      });
    })(function(isConst){
      if (typeof isConst !== 'function') {
        isConst = (function(v){
          return function(){ return v };
        })(isConst);
      }
      return function(node){
        node.IsConstantDeclaration = isConst(node);
        node.boundNames || (node.boundNames = boundNames(node));
        if (node.kind !== 'var') {
          return node;
        }
      };
    });

    return function lexDecls(node){
      if (!node) return [];
      if (!node.LexicalDeclarations) {
        node.LexicalDeclarations = LexicalDeclarations(node);
      }
      return node.LexicalDeclarations;
    };
  })();

  var varDecls = (function(){
    var variableDeclarations = collector({
      VariableDeclaration: function(node){
        if (node.kind === 'var') {
          return node;
        }
      },
      BlockStatement   : RECURSE,
      CatchClause      : RECURSE,
      DoWhileStatement : RECURSE,
      ExportDeclaration: RECURSE,
      ForInStatement   : RECURSE,
      ForOfStatement   : RECURSE,
      ForStatement     : RECURSE,
      IfStatement      : RECURSE,
      SwitchCase       : RECURSE,
      SwitchStatement  : RECURSE,
      TryStatement     : RECURSE,
      WhileStatement   : RECURSE,
      WithStatement    : RECURSE
    });

    return function varDecls(node){
      var decls = variableDeclarations(node);
      each(node.body, function(statement){
        if (statement.type === 'FunctionDeclaration') {
          decls.push(statement);
        }
      });

      return decls;
    };
  })();


  var getExports = (function(){
    var collectExportDecls = collector({
      Program          : RECURSE,
      BlockStatement   : RECURSE,
      ExportDeclaration: true
    });

    var getExportedDecls = collector({
      ClassDeclaration   : true,
      ExportDeclaration  : RECURSE,
      ExportSpecifier    : true,
      ExportSpecifierSet : RECURSE,
      FunctionDeclaration: true,
      ModuleDeclaration  : true,
      VariableDeclaration: RECURSE,
      VariableDeclarator : true
    });


    var getExportedNames = collector({
      ArrayPattern       : 'elements',
      ObjectPattern      : 'properties',
      Property           : 'value',
      ClassDeclaration   : 'id',
      ExportSpecifier    : 'id',
      FunctionDeclaration: 'id',
      ModuleDeclaration  : 'id',
      VariableDeclarator : 'id',
      Glob               : true,
      Identifier         : ['name']
    });

    return function getExports(node){
      return getExportedNames(getExportedDecls(collectExportDecls(node)));
    };
  })();


  var getImports = (function(){
    var collectImportDecls = collector({
      Program          : RECURSE,
      BlockStatement   : RECURSE,
      ImportDeclaration: true,
      ModuleDeclaration: true
    });

    function Import(origin, name, specifiers, node){
      this.origin = origin;
      this.name = name;
      this.specifiers = specifiers;
      if (node) {
        node.imported = this;
      }
    }

    var handlers = {
      AtSymbol: function(node){
        return (node.internal ? '@@' : '@') + node.name;
      },
      Glob: function(){
        return ['*', '*'];
      },
      Path: function(node){
        return map(node.body, function(subpath){
          return handlers[subpath.type](subpath);
        });
      },
      ImportSpecifier: function(node){
        var name = handlers[node.id.type](node.id);
        var from = node.from === null ? name : handlers[node.from.type](node.from);
        return [name, from];
      },
      Identifier: function(node){
        return node.name;
      },
      Literal: function(node){
        return node.value;
      }
    };

    return function getImports(node){
      var decls = collectImportDecls(node),
          imported = [];

      each(decls, function(decl, i){
        if (decl.body) {
          var origin = name = decl.id.name;
          var code = decl;

        } else {
          var origin = handlers[decl.from.type](decl.from);

          if (decl.type === 'ModuleDeclaration') {
            var name = decl.id.name;
          } else {
            var specifiers = new Hash;
            each(decl.specifiers, function(specifier){
              var result = handlers[specifier.type](specifier);
              result = typeof result === 'string' ? [result, result] : result;
              if (!(result[1] instanceof Array)) {
                result[1] = [result[1]];
              }
              specifiers[result[0]] = result[1];
            });
          }
        }

        imported.push(new Import(origin, name, specifiers, code));
      });

      return imported;
    };
  })();


  var reducer = (function(){
    var _ = {};

    function convert(node){
      if (!node) return node;
      var handler = handlers[node.type];
      if (handler) return handler(node);
    }

    function functions(node){
      return {
        name: convert(node.id),
        params: map(node.params, convert),
        defaults: map(node.defaults || [], convert),
        rest: convert(node.rest)
      };
    }
    function objects(node){
      var out = {};
      each(node.properties, function(prop){
        out[convert(prop.key)] = convert(prop.value);
      });
      return out;
    }
    function arrays(node){
      return map(node.elements, convert);
    }
    function operation(left, right, operator){
      var result = { operator: operator };
      if (left !== _) result.left = convert(left);
      if (right !== _) result.right = convert(right);
      return result;
    }
    function binary(node){
      return { left: convert(node.left),
               right: convert(node.right),
               operator: node.operator };
    }

    var handlers = {
      ArrayExpression: arrays,
      ArrayPattern: arrays,
      BinaryExpression: binary,
      AssignmentExpression: binary,
      LogicalExpression: binary,
      UnaryExpression: function(node){
        return operation(_, node.argument, node.operator);
      },
      UpdateExpression: function(node){
        if (node.prefix) {
          return operation(_, node.argument, node.operator);
        } else {
          return operation(node.argument, _, node.operator);
        }
      },
      Identifier: function(node){
        return node.name;
      },
      Literal: function(node){
        return { value: node.value };
      },
      ObjectExpression: objects,
      ObjectPattern: objects,
      FunctionDeclaration: functions,
      FunctionExpression: functions,
      ArrowFunctionExpression: functions,
      CallExpression: function(node){
        return {
          callee: convert(node.callee),
          args: map(node.arguments, convert)
        }
      },
      MemberExpression: function(node){
        return {
          object: convert(node.object),
          member: convert(node.property)
        };
      },
      ThisExpression: function(node){
        return 'this';
      },
      SpreadElement: function(node){
        return { spread: convert(node.arguments) };
      },
      Program: function(node){
        var out = {
          functions: [],
          vars: []
        };
        each(node.body, function(node){
          if (node.type === 'FunctionDeclaration') {
            out.functions.push(convert(node));
          } else if (node.type === 'VariableDeclaration' && node.kind === 'var') {
            each(node.declarations, function(decl){
              out.vars.push({ binding: convert(decl.id), init: convert(decl.init) });
            });
          }
        });
        return out;
      }
    };

    return convert;
  })();


  var isWrapped, isntWrapped, isTail, isntTail, wrap, tail, copyWrap, copyTail;

  void function(){
    function set(name, value){
      return function(obj){
        if (isObject(obj)) {
          obj[name] = value;
        }
      };
    }

    function either(consequent, alternate){
      return function(test){
        return test ? consequent : alternate;
      };
    }

    function copier(field){
      return function(a, b){
        if (isObject(a) && isObject(b)) {
          b[field] = a[field];
        }
      };
    }

    isWrapped   = set('wrapped', true);
    isntWrapped = set('wrapped', false);
    isTail      = set('tail', true);
    isntTail    = set('tail', false);
    wrap        = either(isWrapped, isntWrapped);
    tail        = either(isTail, isntTail);
    copyWrap    = copier('wrapped');
    copyTail    = copier('tail');
  }();



  var nodeStack = [],
      currentNode;

  function pushNode(node){
    currentNode && nodeStack.push(currentNode);
    currentNode = node;
  }
  function popNode(){
    var node = nodeStack.pop();
    if (node) currentNode = node;
  }

  function recurse(node){
    if (node) {
      pushNode(node);
      if (node.type) {
        handlers[node.type](node);
      } else if (node.length) {
        each(node, recurse);
      }
      popNode();
    }
  }

  var emptyLoc = { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
      emptyRange = [0, 0];

  function loc(){
    var node = currentNode,
        index = nodeStack.length;
    while (node) {
      if (node.loc) {
        return node.loc;
      }
      node = nodeStack[--index];
    }
    return emptyLoc;
  }

  function range(){
    var node = currentNode,
        index = nodeStack.length;

    while (node) {
      if (node.range) {
        return node.range;
      }
      node = nodeStack[--index];
    }
    return emptyRange;
  }


  function intern(str){
    return str;//context.intern(string);
  }

  function current(){
    return context.code.ops.length;
  }

  function last(){
    return context.code.ops[context.code.ops.length - 1];
  }

  function pop(){
    return context.code.ops.pop();
  }

  function adjust(op){
    if (op) {
      return op[0] = context.code.ops.length;
    }
  }

  function initBindingIfNew(name){
    HAS_BINDING(name);
    var jump = JTRUE(0);
    BINDING(name, false);
    UNDEFINED();
    VAR(name);
    adjust(jump);
  }

  function createBindingIfNew(name){
    HAS_BINDING(name);
    var jump = JTRUE(0);
    BINDING(name, false);
    adjust(jump);
  }

  function initFunctionDecl(decl){
    pushNode(decl);
    FunctionDeclaration(decl);
    FUNCTION(false, decl.id.name, decl.code);
    VAR(decl.id.name);
    POP();
    popNode();
  }

  function bindingDestructuring(node){
    pushNode(node);
    if (node.type === 'Identifier') {
      initBindingIfNew(node.name);
    } else if (node.type === 'ObjectPattern') {
      each(node.properties, bindingDestructuring);
    } else if (node.type === 'Property') {
      bindingDestructuring(node.value);
    } else if (node.type === 'ArrayPattern') {
      each(node.elements, bindingDestructuring);
    }
    popNode();
  }

  var symbol = (function(){
    function Symbol(node){
      this[0] = '';
      if (!node) {
        this[1] = '';
      } else if (typeof node === 'string') {
        this[1] = node;
      } else if (node.type === 'AtSymbol') {
        this[0] = '@';
        this[1] = (node.internal ? '@' : '') + node.name;
      } else if (node.type === 'Literal') {
        this[1] = ''+node.value;
      } else {
        this[1] = node.name;
      }
    }

    define(Symbol.prototype, 'length', 2);
    define(Symbol.prototype, [
      Array.prototype.join
    ]);

    return function symbol(node){
      return new Symbol(node);
    };
  })();

  function TopLevelDeclarationInstantiation(code){
    var configurable = code.scopeType === 'eval',
        functions = new Hash;

    pushNode(code.body);

    each(code.VarScopedDeclarations, function(decl){
      if (decl.type === 'FunctionDeclaration') {
        pushNode(decl);
        var name = decl.id.name;
        functions[name] = true;
        HAS_BINDING(name);
        var jump = JTRUE(0);
        BINDING(name, configurable);
        var jump2 = JUMP();
        adjust(jump);
        HAS_GLOBAL(name);
        var jump3 = JTRUE(0);
        UNDEFINED();
        PUT_GLOBAL(name, configurable);
        adjust(jump2);
        adjust(jump3);
        FunctionDeclaration(decl);
        FUNCTION(false, decl.id.name, decl.code);
        VAR(decl.id.name);
        POP();
        popNode();
      } else {
        each(decl.boundNames, function(name){
          HAS_BINDING(name);
          var jump = JFALSE(0);
          BINDING(name);
          UNDEFINED();
          VAR(name);
          var jump2 = JUMP();
          adjust(jump);
          HAS_GLOBAL(name);
          var jump3 = JTRUE(0);
          UNDEFINED();
          PUT_GLOBAL(name, configurable);
          adjust(jump2);
          adjust(jump3);
        });
      }
    });

    popNode();
  }


  function FunctionDeclarationInstantiation(code){
    pushNode(code.body);
    var decls  = code.VarScopedDeclarations,
        len    = decls.length,
        strict = code.flags.strict,
        funcs  = [],
        noArgs = true;

    while (len--) {
      var decl = decls[len];
      pushNode(decl);
      if (decl.type === 'FunctionDeclaration') {
        funcs.push(decl);

        decl.boundNames || (decl.boundNames = boundNames(decl));
        var name = decl.boundNames[0];
        if (name === 'arguments') {
          noArgs = true;
        }
        HAS_BINDING(name);
        var jump = JTRUE(0);
        BINDING(name, false);
        adjust(jump);
      }
      popNode();
    }

    each(code.params, bindingDestructuring);

    //if (!noArgs) {
      BINDING('arguments', strict);
    //}

    each(code.VarDeclaredNames, initBindingIfNew);

    initLexicalDecls(code.body);

    each(funcs, initFunctionDecl);

    pushNode(code.params);
    ARGUMENTS();
    var defaultStart = code.params.length - code.params.defaults.length;
    each(code.params, function(param, i){
      pushNode(param);
      DUP();
      INTERNAL_MEMBER(i);
      if (i >= defaultStart) {
        var skipDefault = JNEQ_UNDEFINED(0);
        recurse(code.params.defaults[i - defaultStart]);
        GET();
        adjust(skipDefault);
      }
      ROTATE(1);
      ROTATE(2);
      if (param.type === 'Identifier') {
        VAR(param.name);
      } else {
        destructure(param, VAR);
        POP();
      }
      ROTATE(1);
      popNode();
    });

    var rest = code.params.Rest;
    if (rest) {
      pushNode(rest);
      REST(code.params.ExpectedArgumentCount);
      if (rest.type === 'Identifier') {
        VAR(rest.name);
      } else {
        destructure(rest, VAR);
        POP();
      }
      popNode();
    } else {
      POP();
    }

    VAR('arguments');
    popNode();
    popNode();
  }


  function initLexicalDecls(node){
    each(lexDecls(node), function(decl){
      pushNode(decl);
      each(decl.boundNames, function(name){
        BINDING(name, decl.IsConstantDeclaration);
      });
      popNode();
    });
  }

  function loop(callback){
    var transfer = new ControlTransfer(context.labels);
    context.jumps.push(transfer);
    context.labels = new Hash;
    transfer.updateContinues(callback());
    transfer.updateBreaks(current());
    context.jumps.pop();
    context.labels = transfer.labels;
  }

  function unwinder(type, callback){
    var begin = current();
    callback();
    context.code.unwinders.push(new Unwinder(type, begin, current()));
  }

  var scopeStack = [];

  function pushScope(type){
    context.currentScope = scope.create('block', context.currentScope);
    scopeStack.push(current());
    type === 'with' ? WITH() : SCOPE_PUSH();
  }


   function popScope(){
    context.currentScope.pop();
    context.code.unwinders.push(new Unwinder('scope', scopeStack.pop(), current()));
    SCOPE_POP();
  }


  function iter(node, KIND){
    unwinder('iteration', function(){
      loop(function(){
        if (isLexicalDeclaration(node.left)) {
          var lexical = true;
          pushScope('block');
          initLexicalDecls(node.left);
        }
        recurse(node.right);
        GET();
        KIND();
        MEMBER('next');
        var update = current();
        DUP();
        DUP();
        GET();
        ARGS();
        CALL();
        if (node.left.type === 'VariableDeclaration') {
          VariableDeclaration(node.left, true);
        } else {
          recurse(node.left);
          ROTATE(1);
          PUT();
          POP();
        }
        recurse(node.body);
        lexical && SCOPE_CLONE();
        JUMP(update);
        lexical && popScope();
        return update;
      });
    });
  }

  function move(node, set, pos){
    if (node.label) {
      var transfer = context.jumps.find(function(jump){
        return node.label.name in jump.labels;
      });
    } else {
      var transfer = context.jumps.find(function(jump){
        return jump.continues;
      });
    }
    transfer && transfer[set].push(pos);
  }

  var destructure = (function(){
    var elementAt = {
      elements: function(node, index){
        return node.elements[index];
      },
      properties: function(node, index){
        return node.properties[index].value;
      }
    };

    return function destructure(left, STORE){
      var key = left.type === 'ArrayPattern' ? 'elements' : 'properties';
      pushNode(left);
      TO_OBJECT();
      pushNode(left[key]);
      each(left[key], function(item, i){
        if (!item) return;
        pushNode(item);
        DUP();
        if (item.type === 'Property') {
          pushNode(item.key);
          MEMBER(symbol(item.key));
          GET();
          popNode();
          pushNode(item.value);
          if (isPattern(item.value)) {
            destructure(item.value, STORE);
          } else if (item.value.type === 'Identifier') {
            STORE(item.value.name);
          }
          popNode();
        } else if (item.type === 'ArrayPattern') {
          LITERAL(i);
          ELEMENT();
          GET();
          destructure(item, STORE);
        } else if (item.type === 'Identifier') {
          LITERAL(i);
          ELEMENT();
          GET();
          STORE(item.name);
        } else if (item.type === 'SpreadElement') {
          pushNode(item.argument);
          GET();
          SPREAD(i);
          STORE(item.argument.name);
          popNode();
        }
        popNode();
      });
      popNode();
      popNode();
    };
  })();


  function args(node){
    pushNode(node)
    ARGS();
    each(node, function(item, i){
      pushNode(item);
      if (item && item.type === 'SpreadElement') {
        recurse(item.argument);
        GET();
        SPREAD_ARG();
      } else {
        recurse(item);
        GET();
        ARG();
      }
      popNode();
    });
    popNode();
  }


  function AssignmentExpression(node){
    if (node.operator === '='){
      if (isPattern(node.left)){
        recurse(node.right);
        GET();
        destructure(node.left, ASSIGN);
      } else {
        recurse(node.left);
        recurse(node.right);
        GET();
        PUT();
      }
    } else {
      recurse(node.left);
      DUP();
      GET();
      recurse(node.right);
      GET();
      BINARY(node.operator.slice(0, -1));
      PUT();
    }
  }

  function ArrayExpression(node){
    ARRAY();
    var holes = 0;
    each(node.elements, function(item){
      if (!item){
        holes++;
      } else if (item.type === 'SpreadElement'){
        recurse(item.argument);
        GET();
        SPREAD_ARRAY(holes);
        holes = 0;
      } else {
        recurse(item);
        GET();
        INDEX(holes);
        holes = 0;
      }
    });
    ARRAY_DONE();
  }

  function ArrayPattern(node){}

  function ArrowFunctionExpression(node, name){
    isntWrapped(node.body);

    var code = new Code(node, null, 'arrow', 'function');
    if (name) {
      code.name = name.name || name;
    }
    context.queue(code);
    FUNCTION(false, null, code);
    return code;
  }

  function AtSymbol(node){
    if (node.internal) {
      if (!context.code.natives) {
        context.earlyError('illegal_internal_symbol', ['@@'+node.name]);
      } else {
        REFSYMBOL('@'+node.name);
      }
    } else {
      REFSYMBOL(node.name);
    }
  }

  function BinaryExpression(node){
    recurse(node.left);
    GET();
    recurse(node.right);
    GET();
    BINARY(node.operator);
  }

  function BreakStatement(node){
    move(node, 'breaks', JUMP());
  }

  function BlockStatement(node){
    pushNode(node.body);
    pushScope('block');

    var transfer;
    for (var label in context.labels) {
      transfer = new ControlTransfer(context.labels);
      break;
    }
    if (transfer) {
      context.jumps.push(transfer);
      context.labels = new Hash;
    }

    initLexicalDecls(node.body);
    each(lexDecls(node.body), function(decl){
      pushNode(decl);
      each(decl.boundNames, function(name){
        if (decl.type === 'FunctionDeclaration') {
          FunctionDeclaration(decl);
          FUNCTION(false, decl.id.name, decl.code);
          LET(decl.id.name);
        }
      });
      popNode();
    });

    var wrapper = wrap(node.wrapped);
    each(node.body, function(child){
      wrapper(child);
      recurse(child);
    });

    if (transfer) {
      transfer.updateBreaks(current());
      context.jumps.pop();
      context.labels = transfer.labels;
    }

    popScope();
    popNode();
  }

  function CallExpression(node){
    if (isSuperReference(node.callee)) {
      if (context.code.scopeType !== 'function') {
        context.earlyError(node, 'illegal_super');
      }
      SUPER_MEMBER(context.code.name);
    } else {
      recurse(node.callee);
    }
    DUP();
    GET();
    args(node.arguments);
    if (node.callee.type === 'Identifier' && node.callee.name === 'eval') {
      EVAL();
    } else {
      (node.callee.type === 'NativieIdentifier' ? NATIVE_CALL : CALL)(!!node.tail);
    }
  }

  function CatchClause(node){
    copyWrap(node, node.body);
    pushNode(node.body);
    pushScope('block');
    pushNode(node.param);
    context.currentScope.lexDeclare(node.param.name, 'catch');
    BINDING(node.param.name, false);
    LET(node.param.name);
    popNode();
    initLexicalDecls(node.body);
    each(node.body, recurse);
    popScope();
    popNode();
  }

  function ClassBody(node){}

  function ClassDeclaration(node){
    context.currentScope.lexDeclare(node.id.name, 'class');
    CLASS_DECL(new ClassDefinition(node));
  }

  function ClassExpression(node, methodName){
    var definition = new ClassDefinition(node, methodName);
    CLASS_EXPR(definition);
    return definition.ctor;
  }

  function ClassHeritage(node){}

  function comprehension(expression, index){
    var node = expression.blocks[index++];
    unwinder('iteration', function(){
      loop(function(){
        pushScope('block');
        var fakeLeft = {
          type: 'VariableDeclaration',
          declarations: [{
            type: 'VariableDeclarator',
            kind: 'let',
            id: node.left
          }]
        };
        initLexicalDecls(fakeLeft);
        recurse(node.right);
        GET();
        node.of ? ITERATE() : ENUM();
        MEMBER('next');
        var update = current();
        DUP();
        DUP();
        GET();
        ARGS();
        CALL(false);
        VariableDeclaration(fakeLeft, true);

        if (expression.blocks[index]) {
          comprehension(expression, index);
        } else {
          if (expression.filter) {
            recurse(expression.filter);
            GET();
            var test = JFALSE(0);
          }
          MOVE(false);
          MOVE(false);
          recurse(expression.body);
          GET();
          INDEX(0);
          MOVE(true);
          MOVE(true);
          expression.filter && adjust(test);
        }

        SCOPE_CLONE();
        JUMP(update);
        popScope();
        return update;
      });
    });
  }

  function ComprehensionExpression(node){
    ARRAY();
    MOVE(true);
    MOVE(true);
    comprehension(node, 0);
    MOVE(false);
    MOVE(false);
    POP();
  }

  function ComprehensionBlock(node){}

  function ConditionalExpression(node){
    copyTail(node, node.consequent);
    copyTail(node, node.alternate);
    each(node, wrap(node.wrapped));

    recurse(node.test);
    GET();
    var test = JFALSE(0);
    recurse(node.consequent)
    GET();
    var alt = JUMP();
    adjust(test);
    recurse(node.alternate);
    GET();
    adjust(alt);
  }

  function ContinueStatement(node){
    move(node, 'continues', JUMP());
  }

  function DoWhileStatement(node){
    loop(function(){
      isntTail(node.test);
      isntTail(node.body);
      copyWrap(node, node.body);

      var start = current();
      recurse(node.body);
      var cond = current();
      recurse(node.test);
      GET();
      JTRUE(start);
      return cond;
    });
  }

  function DebuggerStatement(node){
    DEBUGGER();
  }

  function EmptyStatement(node){}

  function ExportSpecifier(node){}

  function ExportSpecifierSet(node){}

  function ExportDeclaration(node){
    if (node.declaration) {
      recurse(node.declaration);
    }
  }

  function ExpressionStatement(node){
    copyWrap(node, node.expression);

    recurse(node.expression);
    GET();
    isGlobalOrEval() ? SAVE() : POP();
  }

  function ForStatement(node){
    copyWrap(node, node.body);

    loop(function(){
      if (node.init){
        if (node.init.type === 'VariableDeclaration') {
          if (node.init.kind !== 'var') {
            var lexical = true;
            pushScope('block');
            initLexicalDecls(node.init);
          }
          recurse(node.init);
        } else {
          recurse(node.init);
          GET();
          POP();
        }
      }

      var repeat = current();

      if (node.test) {
        recurse(node.test);
        GET();
        var test = JFALSE(0);
      }

      recurse(node.body);

      lexical && SCOPE_CLONE();
      if (node.update) {
        recurse(node.update);
        GET();
      }

      POP();
      JUMP(repeat);
      adjust(test);
      lexical && popScope();

      return repeat;
    });
  }

  function ForInStatement(node){
    copyWrap(node, node.body);
    iter(node, ENUM);
  }

  function ForOfStatement(node){
    copyWrap(node, node.body);
    iter(node, ITERATE);
  }

  function FunctionDeclaration(node){
    isntWrapped(node.body);
    if (!node.code) {
      context.currentScope.lexDeclare(node.id.name, 'function');
      node.code = new Code(node, null, 'normal', 'function');
      context.queue(node.code);
    }
    return node.code;
  }

  function FunctionExpression(node, methodName){
    isntWrapped(node.body);
    var code = new Code(node, null, 'normal', 'function');
    if (node.id) {
      code.scope.varDeclare(node.id.name, 'funcname');
    }
    if (methodName) {
      code.name = methodName.name || methodName;
    }
    context.queue(code);
    FUNCTION(true, intern(node.id ? node.id.name : ''), code);
    return code;
  }

  function Glob(node){}

  var nativeMatch = /^\$__/;

  function Identifier(node){
    if (context.code.natives && nativeMatch.test(node.name)) {
      node.type = 'NativeIdentifier';
      node.name = node.name.slice(3);
      NATIVE_REF(node.name);
    } else {
      REF(node.name);
    }
  }

  function IfStatement(node){
    copyWrap(node, node.consequent);
    copyWrap(node, node.alternate);

    recurse(node.test);
    GET();
    var test = JFALSE(0);
    recurse(node.consequent);

    if (node.alternate) {
      var alt = JUMP();
      adjust(test);
      recurse(node.alternate);
      adjust(alt);
    } else {
      adjust(test);
    }
  }

  function ImportDeclaration(node){}

  function ImportSpecifier(node){}

  function Literal(node){
    if (node.value instanceof RegExp) {
      REGEXP(node.value);
    } else if (typeof node.value === 'string') {
      STRING(node.value);
    } else {
      LITERAL(node.value);
    }
  }

  function LabeledStatement(node){
    copyWrap(node, node.statement);

    if (!context.labels){
      context.labels = new Hash;
    } else if (label in context.labels) {
      context.earlyError(node, 'duplicate_label');
    }
    context.labels[node.label.name] = true;
    recurse(node.body);
    context.labels = null;
  }

  function LogicalExpression(node){
    recurse(node.left);
    GET();
    var op = node.operator === '||' ? OR(0) : AND(0);
    recurse(node.right);
    GET();
    adjust(op);
  }

  function MemberExpression(node){
    var isSuper = isSuperReference(node.object);
    if (isSuper){
      if (context.code.scopeType !== 'function') {
        context.earlyError(node, 'illegal_super_reference');
      }
    } else {
      recurse(node.object);
      GET();
    }

    if (node.computed){
      recurse(node.property);
      GET();
      isSuper ? SUPER_ELEMENT() : ELEMENT();
    } else {
      var prop = symbol(node.property);
      isSuper ? SUPER_MEMBER(prop) : MEMBER(prop);
    }
  }

  function MethodDefinition(node){}

  function ModuleDeclaration(node){
    if (node.body) {
      each(node.body, isntWrapped);
      var code = node.imported.code = new Code(node, null, 'normal', 'module');
      code.path = context.code.path.concat(node.id.name);
      context.queue(code);
    }
  }

  function NativeIdentifier(node){
    NATIVE_REF(node.name);
  }

  function NewExpression(node){
    recurse(node.callee);
    GET();
    args(node.arguments);
    CONSTRUCT();
  }

  function ObjectExpression(node){
    OBJECT();
    each(node.properties, recurse);
  }

  function ObjectPattern(node){}

  function Path(node){}

  function Program(node){
    pushNode(node.body);
    each(node.body, function(child){
      isntWrapped(child);
      recurse(child);
    });
    popNode();
  }

  function Property(node){
    var value = node.value;
    if (node.kind === 'init'){
      var key  = node.key.type === 'Identifier' ? node.key : node.key.value,
          name = key && key.name || key;

      if (node.method) {
        pushNode(value);
        FunctionExpression(value, symbol(node.key));
        popNode();
      } else if (isAnonymous(value)) {
        renameables[value.type](value, key).flags.writableName = true;
      } else {
        recurse(value);
      }
      GET();
      if (name === '__proto__') {
        PROTO();
      } else {
        PROPERTY(symbol(node.key));
      }
    } else {
      var code = new Code(value, null, 'normal', 'function');
      context.queue(code);
      METHOD(node.kind, code, symbol(node.key));
    }
  }

  function ReturnStatement(node){
    if (node.argument){
      tail(!node.wrapped)(node.argument);
      recurse(node.argument);
      GET();
    } else {
      UNDEFINED();
    }

    context.code.inFinally ? RETURN_FINALLY() : RETURN();
  }

  function SequenceExpression(node){
    var wrapper = wrap(node.wrapped);

    each(node.expressions, function(item, i, a){
      wrapper(item);
      recurse(item)
      GET();
      if (i < a.length - 1) {
        POP();
      }
    });

    copyTail(node, node.expressions[node.expressions.length - 1]);
  }

  function SwitchStatement(node){
    var defaultFound = null;
    recurse(node.discriminant);
    GET();

    pushScope('block');

    var transfer = new ControlTransfer(context.labels);
    context.jumps.push(transfer);
    context.labels = new Hash;

    if (node.cases){
      each(node.cases, initLexicalDecls);
      var cases = [];
      each(node.cases, function(item, i){
        if (item.test){
          recurse(item.test);
          GET();
          cases.push(CASE(0));
        } else {
          defaultFound = i;
          cases.push(0);
        }
      });

      if (defaultFound !== null){
        DEFAULT(cases[defaultFound]);
      } else {
        POP();
        var last = JUMP();
      }

      var wrapper = wrap(node.wrapped);
      each(node.cases, function(item, i){
        adjust(cases[i]);
        wrapper(item);
        each(item.consequent, function(child){
          wrapper(child);
          recurse(child);
        });
      });

      last && adjust(last);
    } else {
      POP();
    }

    transfer.updateBreaks(current());
    context.jumps.pop();
    context.labels = transfer.labels;

    popScope();
  }


  function SymbolDeclaration(node){
    // TODO early errors for duplicates
    var symbols = node.AtSymbols = [],
        pub = node.kind === 'symbol';

    each(node.declarations, function(item){
      var init = item.init;
      if (init) {
        recurse(init);
        GET();
      }

      if (item.id.internal) {
        if (!context.code.natives) {
          context.earlyError('illegal_internal_symbol', ['@@'+item.id.name]);
        } else {
          var name = '@'+item.id.name;
        }
      } else {
        var name = item.id.name;
      }
      SYMBOL(name, pub, !!init);
      symbols.push(name);
    });
  }

  function SymbolDeclarator(node){}

  function TemplateElement(node){}

  function TemplateLiteral(node, tagged){
    if (node.quasis) {
      node.templates = node.quasis;
      delete node.quasis;
    }
    each(node.templates, function(element, i){
      STRING(element.value.raw);
      if (!element.tail) {
        recurse(node.expressions[i]);
        GET();
        BINARY('string+');
      }
      i && BINARY('string+');
    });
  }


  function TaggedTemplateExpression(node){
    var template = [];
    if (node.quasi) {
      node.template = node.quasi;
      delete node.quasi;
    }
    each(node.template.templates, function(element){
      template.push(element.value);
    });

    UNDEFINED();
    recurse(node.tag);
    GET();
    ARGS();
    TEMPLATE(template);
    GET();
    ARG();
    each(node.template.expressions, function(node){
      recurse(node);
      GET();
      ARG();
    });
    CALL(false);
  }

  function ThisExpression(node){
    THIS();
  }

  function ThrowStatement(node){
    recurse(node.argument);
    GET();
    THROW();
  }

  function TryStatement(node){
    isWrapped(node.block);

    if (node.finalizer) {
      context.code.inFinally = true;
    }
    var begin = current();

    unwinder('try', function(){
      each(node.block.body, recurse);
    });

    var handlers = [JUMP()],
        wrapper  = wrap(node.finalizer || node.wrapped);

    each(node.handlers, function(handler){
      wrapper(handler);
      recurse(handler);
      handlers.push(JUMP());
    });

    each(handlers, adjust)

    if (node.finalizer) {
      context.code.inFinally = false;
      isntWrapped(node.finalizer);
      recurse(node.finalizer);
      RETURN_CHECK();
    }
  }

  function UnaryExpression(node){
    recurse(node.argument);
    UNARY(node.operator);
  }

  function UpdateExpression(node){
    recurse(node.argument);
    UPDATE(!!node.prefix | ((node.operator === '++') << 1));
  }

  function VariableDeclaration(node, forin){
    if (node.kind === 'var') {
      var DECLARE = function(name){
        context.currentScope.varDeclare(name, 'var');
        VAR(name);
      };
    } else {
      var OP = node.kind === 'const' ? CONST : LET;
      var DECLARE = function(name){
        context.currentScope.lexDeclare(name, node.kind);
        OP(name);
      };
    }


    each(node.declarations, function(item){
      if (node.kind === 'var') {
        pushAll(context.code.VarDeclaredNames, boundNames(item.id));
      }

      if (item.init) {
        if (item.id && item.id.type === 'Identifier' && isAnonymous(item.init)) {
          recurse(item.id);
          renameables[item.init.type](item.init, item.id.name).flags.writableName = true;
        } else {
          recurse(item.init);
          GET();
        }
      } else if (!forin) {
        UNDEFINED();
      }
      if (isPattern(item.id)){
        destructure(item.id, DECLARE);
        POP();
      } else {
        DECLARE(item.id.name);
      }
    });
  }

  function VariableDeclarator(node){}

  function WhileStatement(node){
    copyWrap(node, node.body);

    loop(function(){
      var start = current();
      recurse(node.test);
      GET();
      var test = JFALSE(0)
      recurse(node.body);
      JUMP(start);
      adjust(test);
      return start;
    });
  }

  function WithStatement(node){
    copyWrap(node, node.object);

    recurse(node.object);
    pushScope('with');
    recurse(node.body);
    popScope();
  }

  function YieldExpression(node){
    if (node.argument){
      recurse(node.argument);
      GET();
    } else {
      UNDEFINED();
    }

    YIELD(node.delegate);
  }

  var handlers = {};

  each([ArrayExpression, ArrayPattern, ArrowFunctionExpression, AssignmentExpression,
    AtSymbol, BinaryExpression, BlockStatement, BreakStatement, CallExpression, CatchClause,
    ClassBody, ClassDeclaration, ClassExpression, ClassHeritage, ComprehensionExpression,
    ConditionalExpression, ContinueStatement,
    DebuggerStatement, DoWhileStatement, EmptyStatement, ExportDeclaration, ExportSpecifier,
    ExportSpecifierSet, ExpressionStatement, ForInStatement, ForOfStatement, ForStatement,
    FunctionDeclaration, FunctionExpression, Glob, Identifier, IfStatement, ImportDeclaration,
    ImportSpecifier, LabeledStatement, Literal, LogicalExpression, MemberExpression, MethodDefinition,
    ModuleDeclaration, NativeIdentifier, NewExpression, ObjectExpression, ObjectPattern, Path, Program,
    Property, ReturnStatement, SequenceExpression, SwitchStatement, SymbolDeclaration, SymbolDeclarator,
    TaggedTemplateExpression, TemplateElement, TemplateLiteral, ThisExpression, ThrowStatement,
    TryStatement, UnaryExpression, UpdateExpression, VariableDeclaration, VariableDeclarator,
    WhileStatement, WithStatement, YieldExpression],
    function(handler){
    handlers[fname(handler)] = handler;
  });




  var Assembler = exports.Assembler = (function(){
    function annotateParent(node, parent){
      walk(node, function(node){
        if (isObject(node) && parent) {
          define(node, 'parent', parent);
        }
        return RECURSE;
      });
    }

    function reinterpretNatives(node){
      walk(node, function(node){
        if (node.type === 'Identifier' && /^\$__/.test(node.name)) {
          node.type = 'NativeIdentifier';
          node.name = node.name.slice(3);
        } else {
          return RECURSE;
        }
      });
    }


    function AssemblerOptions(o){
      o = Object(o);
      for (var k in this)
        this[k] = k in o ? o[k] : this[k];
    }

    AssemblerOptions.prototype = {
      scope: 'global',
      natives: false,
      filename: null
    };


    function Assembler(script){
      this.script = new AssemblerOptions(script);
      define(this, {
        strings: [],
        hash: new Hash
      });
    }

    define(Assembler.prototype, {
      source: null,
      node: null,
      code: null,
      pending: null,
      jumps: null,
      labels: null
    });

    define(Assembler.prototype, [
      function assemble(node, source){
        context = this;
        this.pending = new Stack;
        this.jumps = new Stack;
        this.labels = null;
        this.source = source;

        if (this.script.scope === 'function') {
          node = node.body[0].expression;
        }

        var code = new Code(node, source, 'normal', this.script.scope);
        define(code, {
          strings: this.strings,
          hash: this.hash
        });

        code.topLevel = true;

        if (this.script.natives) {
          code.natives = true;
          code.flags.strict = false;
        }

        this.queue(code);

        while (this.pending.length) {
          this.process(this.pending.pop(), this.code);
        }

        return code;
      },
      function process(code, parent){
        this.code = code;
        this.code.filename = this.filename;
        parent && code.derive(parent);
        this.currentScope = code.scope;

        if (code.params) {
          FunctionDeclarationInstantiation(code);
        }

        recurse(code.body);

        var lastOp = last();

        if (code.scopeType === 'global' || code.scopeType === 'eval'){
          COMPLETE();
        } else {
          if (lastOp && lastOp.op.name !== 'RETURN') {
            if (code.lexicalType === 'arrow' && code.body.type !== 'BlockStatement') {
              GET();
              RETURN();
            } else {
              UNDEFINED();
              RETURN();
            }
          }
        }
        this.currentScope = this.currentScope.outer;
      },
      function queue(code){
        if (this.code) {
          this.code.children.push(code);
        }
        this.pending.push(code);
      },
      function intern(name){
        return name;
        /*if (name === '__proto__') {
          if (!this.hash[proto]) {
            var index = this.hash[proto] = this.strings.length;
            this.strings[index] = '__proto__';
          }
          name = proto;
        }

        if (name in this.hash) {
          return this.hash[name];
        } else {
          var index = this.hash[name] = this.strings.length;
          this.strings[index] = name;
          return index;
        }*/
      },
      function earlyError(node, error){
        this.code.errors || (this.code.errors = []);
        this.code.errors.push(error);
        // TODO handle this
      }
    ]);

    return Assembler;
  })();

  exports.assemble = function assemble(script){
    var assembler = new Assembler(script);
    return assembler.assemble(script.ast, script.source);
  };

  return exports;
})(typeof module !== 'undefined' ? module.exports : {});
