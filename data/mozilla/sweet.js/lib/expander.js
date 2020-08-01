(function (root, factory) {
    if (typeof exports === 'object') {
        // CommonJS
        factory(exports, require('underscore'), require('./parser'), require('./syntax'), require('./scopedEval'), require('./patterns'), require('escodegen'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([
            'exports',
            'underscore',
            'parser',
            'syntax',
            'scopedEval',
            'patterns'
        ], factory);
    }
}(this, function (exports$2, _, parser, syn, se, patternModule, gen) {
    'use strict';
    var // escodegen still doesn't quite support AMD: https://github.com/Constellation/escodegen/issues/115
    codegen = typeof escodegen !== 'undefined' ? escodegen : gen;
    var assert = syn.assert;
    var throwSyntaxError = syn.throwSyntaxError;
    var throwSyntaxCaseError = syn.throwSyntaxCaseError;
    var SyntaxCaseError = syn.SyntaxCaseError;
    var unwrapSyntax = syn.unwrapSyntax;
    // used to export "private" methods for unit testing
    exports$2._test = {};
    function StringMap(o) {
        this.__data = o || {};
    }
    StringMap.prototype = {
        has: function (key) {
            return Object.prototype.hasOwnProperty.call(this.__data, key);
        },
        get: function (key) {
            return this.has(key) ? this.__data[key] : void 0;
        },
        set: function (key, value) {
            this.__data[key] = value;
        },
        extend: function () {
            var args = _.map(_.toArray(arguments), function (x) {
                return x.__data;
            });
            _.extend.apply(_, [this.__data].concat(args));
            return this;
        }
    };
    var scopedEval = se.scopedEval;
    var Rename = syn.Rename;
    var Mark = syn.Mark;
    var Def = syn.Def;
    var syntaxFromToken = syn.syntaxFromToken;
    var joinSyntax = syn.joinSyntax;
    var builtinMode = false;
    var expandCount = 0;
    var maxExpands;
    var push = Array.prototype.push;
    function remdup(mark, mlist) {
        if (mark === _.first(mlist)) {
            return _.rest(mlist, 1);
        }
        return [mark].concat(mlist);
    }
    function marksof(ctx, stopName, originalName) {
        while (ctx) {
            if (ctx.constructor === Mark) {
                return remdup(ctx.mark, marksof(ctx.context, stopName, originalName));
            }
            if (ctx.constructor === Def) {
                ctx = ctx.context;
                continue;
            }
            if (ctx.constructor === Rename) {
                if (stopName === originalName + '$' + ctx.name) {
                    return [];
                }
                ctx = ctx.context;
                continue;
            }
        }
        return [];
    }
    function resolve(stx) {
        return resolveCtx(stx.token.value, stx.context, [], [], {});
    }
    function resolveCtx(originalName, ctx, stop_spine, stop_branch, cache) {
        if (!ctx) {
            return originalName;
        }
        var key = ctx.instNum;
        return cache[key] || (cache[key] = resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache));
    }
    function resolveCtxFull(originalName, ctx, stop_spine, stop_branch, cache) {
        while (true) {
            if (!ctx) {
                return originalName;
            }
            if (ctx.constructor === Mark) {
                ctx = ctx.context;
                continue;
            }
            if (ctx.constructor === Def) {
                if (stop_spine.indexOf(ctx.defctx) !== -1) {
                    ctx = ctx.context;
                    continue;
                } else {
                    stop_branch = unionEl(stop_branch, ctx.defctx);
                    ctx = renames(ctx.defctx, ctx.context, originalName);
                    continue;
                }
            }
            if (ctx.constructor === Rename) {
                if (originalName === ctx.id.token.value) {
                    var idName = resolveCtx(ctx.id.token.value, ctx.id.context, stop_branch, stop_branch, cache);
                    var subName = resolveCtx(originalName, ctx.context, unionEl(stop_spine, ctx.def), stop_branch, cache);
                    if (idName === subName) {
                        var idMarks = marksof(ctx.id.context, originalName + '$' + ctx.name, originalName);
                        var subMarks = marksof(ctx.context, originalName + '$' + ctx.name, originalName);
                        if (arraysEqual(idMarks, subMarks)) {
                            return originalName + '$' + ctx.name;
                        }
                    }
                }
                ctx = ctx.context;
                continue;
            }
            return originalName;
        }
    }
    function arraysEqual(a, b) {
        if (a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    function renames(defctx, oldctx, originalName) {
        var acc = oldctx;
        for (var i = 0; i < defctx.length; i++) {
            if (defctx[i].id.token.value === originalName) {
                acc = new Rename(defctx[i].id, defctx[i].name, acc, defctx);
            }
        }
        return acc;
    }
    function unionEl(arr, el) {
        if (arr.indexOf(el) === -1) {
            var res = arr.slice(0);
            res.push(el);
            return res;
        }
        return arr;
    }
    var nextFresh = 0;
    function fresh() {
        return nextFresh++;
    }
    function wrapDelim(towrap, delimSyntax) {
        assert(delimSyntax.token.type === parser.Token.Delimiter, 'expecting a delimiter token');
        return syntaxFromToken({
            type: parser.Token.Delimiter,
            value: delimSyntax.token.value,
            inner: towrap,
            range: delimSyntax.token.range,
            startLineNumber: delimSyntax.token.startLineNumber,
            lineStart: delimSyntax.token.lineStart
        }, delimSyntax);
    }
    function getParamIdentifiers(argSyntax) {
        if (argSyntax.token.type === parser.Token.Delimiter) {
            return _.filter(argSyntax.token.inner, function (stx) {
                return stx.token.value !== ',';
            });
        } else if (argSyntax.token.type === parser.Token.Identifier) {
            return [argSyntax];
        } else {
            assert(false, 'expecting a delimiter or a single identifier for function parameters');
        }
    }
    function inherit(parent, child, methods) {
        var P = function () {
        };
        P.prototype = parent.prototype;
        child.prototype = new P();
        child.prototype.constructor = child;
        _.extend(child.prototype, methods);
    }
    function TermTree() {
    }
    TermTree.properties = [];
    TermTree.create = function () {
        return new TermTree();
    };
    TermTree.prototype = {
        'isTermTree': true,
        'destruct': function () {
            var self = this;
            return _.reduce(this.constructor.properties, function (acc, prop) {
                if (self[prop] && self[prop].isTermTree) {
                    push.apply(acc, self[prop].destruct());
                    return acc;
                } else if (self[prop] && self[prop].token && self[prop].token.inner) {
                    var src = self[prop].token;
                    var keys = Object.keys(src);
                    var newtok = {};
                    for (var i = 0, len = keys.length, key; i < len; i++) {
                        key = keys[i];
                        newtok[key] = src[key];
                    }
                    var clone = syntaxFromToken(newtok, self[prop]);
                    clone.token.inner = _.reduce(clone.token.inner, function (acc$2, t) {
                        if (t && t.isTermTree) {
                            push.apply(acc$2, t.destruct());
                            return acc$2;
                        }
                        acc$2.push(t);
                        return acc$2;
                    }, []);
                    acc.push(clone);
                    return acc;
                } else if (Array.isArray(self[prop])) {
                    var destArr = _.reduce(self[prop], function (acc$2, t) {
                        if (t && t.isTermTree) {
                            push.apply(acc$2, t.destruct());
                            return acc$2;
                        }
                        acc$2.push(t);
                        return acc$2;
                    }, []);
                    push.apply(acc, destArr);
                    return acc;
                } else if (self[prop]) {
                    acc.push(self[prop]);
                    return acc;
                } else {
                    return acc;
                }
            }, []);
        },
        'addDefCtx': function (def) {
            var self = this;
            _.each(this.constructor.properties, function (prop) {
                if (Array.isArray(self[prop])) {
                    self[prop] = _.map(self[prop], function (item) {
                        return item.addDefCtx(def);
                    });
                } else if (self[prop]) {
                    self[prop] = self[prop].addDefCtx(def);
                }
            });
            return this;
        },
        'rename': function (id, name) {
            var self = this;
            _.each(this.constructor.properties, function (prop) {
                if (Array.isArray(self[prop])) {
                    self[prop] = _.map(self[prop], function (item) {
                        return item.rename(id, name);
                    });
                } else if (self[prop]) {
                    self[prop] = self[prop].rename(id, name);
                }
            });
            return this;
        }
    };
    function EOF(eof) {
        this.eof = eof;
    }
    EOF.properties = ['eof'];
    EOF.create = function (eof) {
        return new EOF(eof);
    };
    inherit(TermTree, EOF, { 'isEOF': true });
    function Keyword(keyword) {
        this.keyword = keyword;
    }
    Keyword.properties = ['keyword'];
    Keyword.create = function (keyword) {
        return new Keyword(keyword);
    };
    inherit(TermTree, Keyword, { 'isKeyword': true });
    function Punc(punc) {
        this.punc = punc;
    }
    Punc.properties = ['punc'];
    Punc.create = function (punc) {
        return new Punc(punc);
    };
    inherit(TermTree, Punc, { 'isPunc': true });
    function Delimiter(delim) {
        this.delim = delim;
    }
    Delimiter.properties = ['delim'];
    Delimiter.create = function (delim) {
        return new Delimiter(delim);
    };
    inherit(TermTree, Delimiter, { 'isDelimiter': true });
    function LetMacro(name, body) {
        this.name = name;
        this.body = body;
    }
    LetMacro.properties = [
        'name',
        'body'
    ];
    LetMacro.create = function (name, body) {
        return new LetMacro(name, body);
    };
    inherit(TermTree, LetMacro, { 'isLetMacro': true });
    function Macro(name, body) {
        this.name = name;
        this.body = body;
    }
    Macro.properties = [
        'name',
        'body'
    ];
    Macro.create = function (name, body) {
        return new Macro(name, body);
    };
    inherit(TermTree, Macro, { 'isMacro': true });
    function AnonMacro(body) {
        this.body = body;
    }
    AnonMacro.properties = ['body'];
    AnonMacro.create = function (body) {
        return new AnonMacro(body);
    };
    inherit(TermTree, AnonMacro, { 'isAnonMacro': true });
    function OperatorDefinition(type, name, prec, assoc, body) {
        this.type = type;
        this.name = name;
        this.prec = prec;
        this.assoc = assoc;
        this.body = body;
    }
    OperatorDefinition.properties = [
        'type',
        'name',
        'prec',
        'assoc',
        'body'
    ];
    OperatorDefinition.create = function (type, name, prec, assoc, body) {
        return new OperatorDefinition(type, name, prec, assoc, body);
    };
    inherit(TermTree, OperatorDefinition, { 'isOperatorDefinition': true });
    function Module(body, exports$3) {
        this.body = body;
        this.exports = exports$3;
    }
    Module.properties = [
        'body',
        'exports'
    ];
    Module.create = function (body, exports$3) {
        return new Module(body, exports$3);
    };
    inherit(TermTree, Module, { 'isModule': true });
    function Export(name) {
        this.name = name;
    }
    Export.properties = ['name'];
    Export.create = function (name) {
        return new Export(name);
    };
    inherit(TermTree, Export, { 'isExport': true });
    function VariableDeclaration(ident, eq, init, comma) {
        this.ident = ident;
        this.eq = eq;
        this.init = init;
        this.comma = comma;
    }
    VariableDeclaration.properties = [
        'ident',
        'eq',
        'init',
        'comma'
    ];
    VariableDeclaration.create = function (ident, eq, init, comma) {
        return new VariableDeclaration(ident, eq, init, comma);
    };
    inherit(TermTree, VariableDeclaration, { 'isVariableDeclaration': true });
    function Statement() {
    }
    Statement.properties = [];
    Statement.create = function () {
        return new Statement();
    };
    inherit(TermTree, Statement, { 'isStatement': true });
    function Empty() {
    }
    Empty.properties = [];
    Empty.create = function () {
        return new Empty();
    };
    inherit(Statement, Empty, { 'isEmpty': true });
    function CatchClause(keyword, params, body) {
        this.keyword = keyword;
        this.params = params;
        this.body = body;
    }
    CatchClause.properties = [
        'keyword',
        'params',
        'body'
    ];
    CatchClause.create = function (keyword, params, body) {
        return new CatchClause(keyword, params, body);
    };
    inherit(Statement, CatchClause, { 'isCatchClause': true });
    function ForStatement(keyword, cond) {
        this.keyword = keyword;
        this.cond = cond;
    }
    ForStatement.properties = [
        'keyword',
        'cond'
    ];
    ForStatement.create = function (keyword, cond) {
        return new ForStatement(keyword, cond);
    };
    inherit(Statement, ForStatement, { 'isForStatement': true });
    function ReturnStatement(keyword, expr) {
        this.keyword = keyword;
        this.expr = expr;
    }
    ReturnStatement.properties = [
        'keyword',
        'expr'
    ];
    ReturnStatement.create = function (keyword, expr) {
        return new ReturnStatement(keyword, expr);
    };
    inherit(Statement, ReturnStatement, {
        'isReturnStatement': true,
        'destruct': function () {
            var expr = this.expr.destruct();
            // need to adjust the line numbers to make sure that the expr
            // starts on the same line as the return keyword. This might
            // not be the case if an operator or infix macro perturbed the
            // line numbers during expansion.
            expr = adjustLineContext(expr, this.keyword.keyword);
            return this.keyword.destruct().concat(expr);
        }
    });
    function Expr() {
    }
    Expr.properties = [];
    Expr.create = function () {
        return new Expr();
    };
    inherit(Statement, Expr, { 'isExpr': true });
    function UnaryOp(op, expr) {
        this.op = op;
        this.expr = expr;
    }
    UnaryOp.properties = [
        'op',
        'expr'
    ];
    UnaryOp.create = function (op, expr) {
        return new UnaryOp(op, expr);
    };
    inherit(Expr, UnaryOp, { 'isUnaryOp': true });
    function PostfixOp(expr, op) {
        this.expr = expr;
        this.op = op;
    }
    PostfixOp.properties = [
        'expr',
        'op'
    ];
    PostfixOp.create = function (expr, op) {
        return new PostfixOp(expr, op);
    };
    inherit(Expr, PostfixOp, { 'isPostfixOp': true });
    function BinOp(left, op, right) {
        this.left = left;
        this.op = op;
        this.right = right;
    }
    BinOp.properties = [
        'left',
        'op',
        'right'
    ];
    BinOp.create = function (left, op, right) {
        return new BinOp(left, op, right);
    };
    inherit(Expr, BinOp, { 'isBinOp': true });
    function AssignmentExpression(left, op, right) {
        this.left = left;
        this.op = op;
        this.right = right;
    }
    AssignmentExpression.properties = [
        'left',
        'op',
        'right'
    ];
    AssignmentExpression.create = function (left, op, right) {
        return new AssignmentExpression(left, op, right);
    };
    inherit(Expr, AssignmentExpression, { 'isAssignmentExpression': true });
    function ConditionalExpression(cond, question, tru, colon, fls) {
        this.cond = cond;
        this.question = question;
        this.tru = tru;
        this.colon = colon;
        this.fls = fls;
    }
    ConditionalExpression.properties = [
        'cond',
        'question',
        'tru',
        'colon',
        'fls'
    ];
    ConditionalExpression.create = function (cond, question, tru, colon, fls) {
        return new ConditionalExpression(cond, question, tru, colon, fls);
    };
    inherit(Expr, ConditionalExpression, { 'isConditionalExpression': true });
    function NamedFun(keyword, star, name, params, body) {
        this.keyword = keyword;
        this.star = star;
        this.name = name;
        this.params = params;
        this.body = body;
    }
    NamedFun.properties = [
        'keyword',
        'star',
        'name',
        'params',
        'body'
    ];
    NamedFun.create = function (keyword, star, name, params, body) {
        return new NamedFun(keyword, star, name, params, body);
    };
    inherit(Expr, NamedFun, { 'isNamedFun': true });
    function AnonFun(keyword, star, params, body) {
        this.keyword = keyword;
        this.star = star;
        this.params = params;
        this.body = body;
    }
    AnonFun.properties = [
        'keyword',
        'star',
        'params',
        'body'
    ];
    AnonFun.create = function (keyword, star, params, body) {
        return new AnonFun(keyword, star, params, body);
    };
    inherit(Expr, AnonFun, { 'isAnonFun': true });
    function ArrowFun(params, arrow, body) {
        this.params = params;
        this.arrow = arrow;
        this.body = body;
    }
    ArrowFun.properties = [
        'params',
        'arrow',
        'body'
    ];
    ArrowFun.create = function (params, arrow, body) {
        return new ArrowFun(params, arrow, body);
    };
    inherit(Expr, ArrowFun, { 'isArrowFun': true });
    function ObjDotGet(left, dot, right) {
        this.left = left;
        this.dot = dot;
        this.right = right;
    }
    ObjDotGet.properties = [
        'left',
        'dot',
        'right'
    ];
    ObjDotGet.create = function (left, dot, right) {
        return new ObjDotGet(left, dot, right);
    };
    inherit(Expr, ObjDotGet, { 'isObjDotGet': true });
    function ObjGet(left, right) {
        this.left = left;
        this.right = right;
    }
    ObjGet.properties = [
        'left',
        'right'
    ];
    ObjGet.create = function (left, right) {
        return new ObjGet(left, right);
    };
    inherit(Expr, ObjGet, { 'isObjGet': true });
    function Template(template) {
        this.template = template;
    }
    Template.properties = ['template'];
    Template.create = function (template) {
        return new Template(template);
    };
    inherit(Expr, Template, { 'isTemplate': true });
    function Call(fun, args) {
        this.fun = fun;
        this.args = args;
    }
    Call.properties = [
        'fun',
        'args'
    ];
    Call.create = function (fun, args) {
        return new Call(fun, args);
    };
    inherit(Expr, Call, { 'isCall': true });
    function PrimaryExpression() {
    }
    PrimaryExpression.properties = [];
    PrimaryExpression.create = function () {
        return new PrimaryExpression();
    };
    inherit(Expr, PrimaryExpression, { 'isPrimaryExpression': true });
    function ThisExpression(keyword) {
        this.keyword = keyword;
    }
    ThisExpression.properties = ['keyword'];
    ThisExpression.create = function (keyword) {
        return new ThisExpression(keyword);
    };
    inherit(PrimaryExpression, ThisExpression, { 'isThisExpression': true });
    function Lit(lit) {
        this.lit = lit;
    }
    Lit.properties = ['lit'];
    Lit.create = function (lit) {
        return new Lit(lit);
    };
    inherit(PrimaryExpression, Lit, { 'isLit': true });
    function Block(body) {
        this.body = body;
    }
    Block.properties = ['body'];
    Block.create = function (body) {
        return new Block(body);
    };
    inherit(PrimaryExpression, Block, { 'isBlock': true });
    function ArrayLiteral(array) {
        this.array = array;
    }
    ArrayLiteral.properties = ['array'];
    ArrayLiteral.create = function (array) {
        return new ArrayLiteral(array);
    };
    inherit(PrimaryExpression, ArrayLiteral, { 'isArrayLiteral': true });
    function Id(id) {
        this.id = id;
    }
    Id.properties = ['id'];
    Id.create = function (id) {
        return new Id(id);
    };
    inherit(PrimaryExpression, Id, { 'isId': true });
    function Partial() {
    }
    Partial.properties = [];
    Partial.create = function () {
        return new Partial();
    };
    inherit(TermTree, Partial, { 'isPartial': true });
    function PartialOperation(stx, left) {
        this.stx = stx;
        this.left = left;
    }
    PartialOperation.properties = [
        'stx',
        'left'
    ];
    PartialOperation.create = function (stx, left) {
        return new PartialOperation(stx, left);
    };
    inherit(Partial, PartialOperation, { 'isPartialOperation': true });
    function PartialExpression(stx, left, combine) {
        this.stx = stx;
        this.left = left;
        this.combine = combine;
    }
    PartialExpression.properties = [
        'stx',
        'left',
        'combine'
    ];
    PartialExpression.create = function (stx, left, combine) {
        return new PartialExpression(stx, left, combine);
    };
    inherit(Partial, PartialExpression, { 'isPartialExpression': true });
    function BindingStatement(keyword, decls) {
        this.keyword = keyword;
        this.decls = decls;
    }
    BindingStatement.properties = [
        'keyword',
        'decls'
    ];
    BindingStatement.create = function (keyword, decls) {
        return new BindingStatement(keyword, decls);
    };
    inherit(Statement, BindingStatement, {
        'isBindingStatement': true,
        'destruct': function () {
            return this.keyword.destruct().concat(_.reduce(this.decls, function (acc, decl) {
                push.apply(acc, decl.destruct());
                return acc;
            }, []));
        }
    });
    function VariableStatement(keyword, decls) {
        this.keyword = keyword;
        this.decls = decls;
    }
    VariableStatement.properties = [
        'keyword',
        'decls'
    ];
    VariableStatement.create = function (keyword, decls) {
        return new VariableStatement(keyword, decls);
    };
    inherit(BindingStatement, VariableStatement, { 'isVariableStatement': true });
    function LetStatement(keyword, decls) {
        this.keyword = keyword;
        this.decls = decls;
    }
    LetStatement.properties = [
        'keyword',
        'decls'
    ];
    LetStatement.create = function (keyword, decls) {
        return new LetStatement(keyword, decls);
    };
    inherit(BindingStatement, LetStatement, { 'isLetStatement': true });
    function ConstStatement(keyword, decls) {
        this.keyword = keyword;
        this.decls = decls;
    }
    ConstStatement.properties = [
        'keyword',
        'decls'
    ];
    ConstStatement.create = function (keyword, decls) {
        return new ConstStatement(keyword, decls);
    };
    inherit(BindingStatement, ConstStatement, { 'isConstStatement': true });
    function ParenExpression(args, delim, commas) {
        this.args = args;
        this.delim = delim;
        this.commas = commas;
    }
    ParenExpression.properties = [
        'args',
        'delim',
        'commas'
    ];
    ParenExpression.create = function (args, delim, commas) {
        return new ParenExpression(args, delim, commas);
    };
    inherit(PrimaryExpression, ParenExpression, {
        'isParenExpression': true,
        'destruct': function () {
            var commas = this.commas.slice();
            var src = this.delim.token;
            var keys = Object.keys(src);
            var newtok = {};
            for (var i = 0, len = keys.length, key; i < len; i++) {
                key = keys[i];
                newtok[key] = src[key];
            }
            var delim = syntaxFromToken(newtok, this.delim);
            delim.token.inner = _.reduce(this.args, function (acc, term) {
                assert(term && term.isTermTree, 'expecting term trees in destruct of ParenExpression');
                push.apply(acc, term.destruct());
                if (// add all commas except for the last one
                    commas.length > 0) {
                    acc.push(commas.shift());
                }
                return acc;
            }, []);
            return Delimiter.create(delim).destruct();
        }
    });
    function stxIsUnaryOp(stx) {
        var staticOperators = [
            '+',
            '-',
            '~',
            '!',
            'delete',
            'void',
            'typeof',
            'yield',
            'new',
            '++',
            '--'
        ];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }
    function stxIsBinOp(stx) {
        var staticOperators = [
            '+',
            '-',
            '*',
            '/',
            '%',
            '||',
            '&&',
            '|',
            '&',
            '^',
            '==',
            '!=',
            '===',
            '!==',
            '<',
            '>',
            '<=',
            '>=',
            'in',
            'instanceof',
            '<<',
            '>>',
            '>>>'
        ];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }
    function getUnaryOpPrec(op) {
        var operatorPrecedence = {
            'new': 16,
            '++': 15,
            '--': 15,
            '!': 14,
            '~': 14,
            '+': 14,
            '-': 14,
            'typeof': 14,
            'void': 14,
            'delete': 14,
            'yield': 2
        };
        return operatorPrecedence[op];
    }
    function getBinaryOpPrec(op) {
        var operatorPrecedence = {
            '*': 13,
            '/': 13,
            '%': 13,
            '+': 12,
            '-': 12,
            '>>': 11,
            '<<': 11,
            '>>>': 11,
            '<': 10,
            '<=': 10,
            '>': 10,
            '>=': 10,
            'in': 10,
            'instanceof': 10,
            '==': 9,
            '!=': 9,
            '===': 9,
            '!==': 9,
            '&': 8,
            '^': 7,
            '|': 6,
            '&&': 5,
            '||': 4
        };
        return operatorPrecedence[op];
    }
    function getBinaryOpAssoc(op) {
        var operatorAssoc = {
            '*': 'left',
            '/': 'left',
            '%': 'left',
            '+': 'left',
            '-': 'left',
            '>>': 'left',
            '<<': 'left',
            '>>>': 'left',
            '<': 'left',
            '<=': 'left',
            '>': 'left',
            '>=': 'left',
            'in': 'left',
            'instanceof': 'left',
            '==': 'left',
            '!=': 'left',
            '===': 'left',
            '!==': 'left',
            '&': 'left',
            '^': 'left',
            '|': 'left',
            '&&': 'left',
            '||': 'left'
        };
        return operatorAssoc[op];
    }
    function stxIsAssignOp(stx) {
        var staticOperators = [
            '=',
            '+=',
            '-=',
            '*=',
            '/=',
            '%=',
            '<<=',
            '>>=',
            '>>>=',
            '|=',
            '^=',
            '&='
        ];
        return _.contains(staticOperators, unwrapSyntax(stx));
    }
    function enforestVarStatement(stx, context, varStx) {
        var decls = [];
        var rest = stx;
        var rhs;
        if (!rest.length) {
            throwSyntaxError('enforest', 'Unexpected end of input', varStx);
        }
        if (expandCount >= maxExpands) {
            return null;
        }
        while (rest.length) {
            if (rest[0].token.type === parser.Token.Identifier) {
                if (rest[1] && rest[1].token.type === parser.Token.Punctuator && rest[1].token.value === '=') {
                    rhs = get_expression(rest.slice(2), context);
                    if (rhs.result == null) {
                        throwSyntaxError('enforest', 'Unexpected token', rhs.rest[0]);
                    }
                    if (rhs.rest[0] && rhs.rest[0].token.type === parser.Token.Punctuator && rhs.rest[0].token.value === ',') {
                        decls.push(VariableDeclaration.create(rest[0], rest[1], rhs.result, rhs.rest[0]));
                        rest = rhs.rest.slice(1);
                        continue;
                    } else {
                        decls.push(VariableDeclaration.create(rest[0], rest[1], rhs.result, null));
                        rest = rhs.rest;
                        break;
                    }
                } else if (rest[1] && rest[1].token.type === parser.Token.Punctuator && rest[1].token.value === ',') {
                    decls.push(VariableDeclaration.create(rest[0], null, null, rest[1]));
                    rest = rest.slice(2);
                } else {
                    decls.push(VariableDeclaration.create(rest[0], null, null, null));
                    rest = rest.slice(1);
                    break;
                }
            } else {
                throwSyntaxError('enforest', 'Unexpected token', rest[0]);
            }
        }
        return {
            result: decls,
            rest: rest
        };
    }
    function enforestAssignment(stx, context, left, prevStx, prevTerms) {
        var op = stx[0];
        var rightStx = stx.slice(1);
        var opTerm = Punc.create(stx[0]);
        var opPrevStx = tagWithTerm(opTerm, [stx[0]]).concat(tagWithTerm(left, left.destruct().reverse()), prevStx);
        var opPrevTerms = [
            opTerm,
            left
        ].concat(prevTerms);
        var opRes = enforest(rightStx, context, opPrevStx, opPrevTerms);
        if (opRes.result) {
            if (// Lookbehind was matched, so it may not even be a binop anymore.
                opRes.prevTerms.length < opPrevTerms.length) {
                return opRes;
            }
            var right = opRes.result;
            if (// only a binop if the right is a real expression
                // so 2+2++ will only match 2+2
                right.isExpr) {
                var term = AssignmentExpression.create(left, op, right);
                return {
                    result: term,
                    rest: opRes.rest,
                    prevStx: prevStx,
                    prevTerms: prevTerms
                };
            }
        } else {
            return opRes;
        }
    }
    function enforestParenExpression(parens, context) {
        var argRes, enforestedArgs = [], commas = [];
        var innerTokens = parens.expose().token.inner;
        while (innerTokens.length > 0) {
            argRes = enforest(innerTokens, context);
            if (!argRes.result || !argRes.result.isExpr) {
                return null;
            }
            enforestedArgs.push(argRes.result);
            innerTokens = argRes.rest;
            if (innerTokens[0] && innerTokens[0].token.value === ',') {
                // record the comma for later
                commas.push(innerTokens[0]);
                // but dump it for the next loop turn
                innerTokens = innerTokens.slice(1);
            } else {
                // either there are no more tokens or
                // they aren't a comma, either way we
                // are done with the loop
                break;
            }
        }
        return innerTokens.length ? null : ParenExpression.create(enforestedArgs, parens, commas);
    }
    function adjustLineContext(stx, original, current) {
        if (// short circuit when the array is empty;
            stx.length === 0) {
            return stx;
        }
        current = current || {
            lastLineNumber: stx[0].token.lineNumber || stx[0].token.startLineNumber,
            lineNumber: original.token.lineNumber
        };
        return _.map(stx, function (stx$2) {
            if (stx$2.token.type === parser.Token.Delimiter) {
                // handle tokens with missing line info
                stx$2.token.startLineNumber = typeof stx$2.token.startLineNumber == 'undefined' ? original.token.lineNumber : stx$2.token.startLineNumber;
                stx$2.token.endLineNumber = typeof stx$2.token.endLineNumber == 'undefined' ? original.token.lineNumber : stx$2.token.endLineNumber;
                stx$2.token.startLineStart = typeof stx$2.token.startLineStart == 'undefined' ? original.token.lineStart : stx$2.token.startLineStart;
                stx$2.token.endLineStart = typeof stx$2.token.endLineStart == 'undefined' ? original.token.lineStart : stx$2.token.endLineStart;
                stx$2.token.startRange = typeof stx$2.token.startRange == 'undefined' ? original.token.range : stx$2.token.startRange;
                stx$2.token.endRange = typeof stx$2.token.endRange == 'undefined' ? original.token.range : stx$2.token.endRange;
                stx$2.token.sm_startLineNumber = typeof stx$2.token.sm_startLineNumber == 'undefined' ? stx$2.token.startLineNumber : stx$2.token.sm_startLineNumber;
                stx$2.token.sm_endLineNumber = typeof stx$2.token.sm_endLineNumber == 'undefined' ? stx$2.token.endLineNumber : stx$2.token.sm_endLineNumber;
                stx$2.token.sm_startLineStart = typeof stx$2.token.sm_startLineStart == 'undefined' ? stx$2.token.startLineStart : stx$2.token.sm_startLineStart;
                stx$2.token.sm_endLineStart = typeof stx$2.token.sm_endLineStart == 'undefined' ? stx$2.token.endLineStart : stx$2.token.sm_endLineStart;
                stx$2.token.sm_startRange = typeof stx$2.token.sm_startRange == 'undefined' ? stx$2.token.startRange : stx$2.token.sm_startRange;
                stx$2.token.sm_endRange = typeof stx$2.token.sm_endRange == 'undefined' ? stx$2.token.endRange : stx$2.token.sm_endRange;
                if (stx$2.token.startLineNumber !== current.lineNumber) {
                    if (stx$2.token.startLineNumber !== current.lastLineNumber) {
                        current.lineNumber++;
                        current.lastLineNumber = stx$2.token.startLineNumber;
                        stx$2.token.startLineNumber = current.lineNumber;
                    } else {
                        current.lastLineNumber = stx$2.token.startLineNumber;
                        stx$2.token.startLineNumber = current.lineNumber;
                    }
                }
                return stx$2;
            }
            // handle tokens with missing line info
            stx$2.token.lineNumber = typeof stx$2.token.lineNumber == 'undefined' ? original.token.lineNumber : stx$2.token.lineNumber;
            stx$2.token.lineStart = typeof stx$2.token.lineStart == 'undefined' ? original.token.lineStart : stx$2.token.lineStart;
            stx$2.token.range = typeof stx$2.token.range == 'undefined' ? original.token.range : stx$2.token.range;
            // Only set the sourcemap line info once. Necessary because a single
            // syntax object can go through expansion multiple times. If at some point
            // we want to write an expansion stepper this might be a good place to store
            // intermediate expansion line info (ie push to a stack instead of
            // just write once).
            stx$2.token.sm_lineNumber = typeof stx$2.token.sm_lineNumber == 'undefined' ? stx$2.token.lineNumber : stx$2.token.sm_lineNumber;
            stx$2.token.sm_lineStart = typeof stx$2.token.sm_lineStart == 'undefined' ? stx$2.token.lineStart : stx$2.token.sm_lineStart;
            stx$2.token.sm_range = typeof stx$2.token.sm_range == 'undefined' ? stx$2.token.range.slice() : stx$2.token.sm_range;
            if (// move the line info to line up with the macro name
                // (line info starting from the macro name)
                stx$2.token.lineNumber !== current.lineNumber) {
                if (stx$2.token.lineNumber !== current.lastLineNumber) {
                    current.lineNumber++;
                    current.lastLineNumber = stx$2.token.lineNumber;
                    stx$2.token.lineNumber = current.lineNumber;
                } else {
                    current.lastLineNumber = stx$2.token.lineNumber;
                    stx$2.token.lineNumber = current.lineNumber;
                }
            }
            return stx$2;
        });
    }
    function getName(head, rest) {
        var idx = 0;
        var curr = head;
        var next = rest[idx];
        var name = [head];
        while (true) {
            if (next && (next.token.type === parser.Token.Punctuator || next.token.type === parser.Token.Identifier || next.token.type === parser.Token.Keyword) && (curr.token.sm_range && next.token.sm_range && curr.token.sm_range[1] === next.token.sm_range[0] || curr.token.range[1] === next.token.range[0])) {
                name.push(next);
                curr = next;
                next = rest[++idx];
            } else {
                return name;
            }
        }
    }
    function getMacroInEnv(head, rest, env) {
        if (!(head.token.type === parser.Token.Identifier || head.token.type === parser.Token.Keyword || head.token.type === parser.Token.Punctuator)) {
            return null;
        }
        var name = getName(head, rest);
        if (// simple case, don't need to create a new syntax object
            name.length === 1) {
            if (env.names.get(unwrapSyntax(name[0]))) {
                var resolvedName = resolve(name[0]);
                if (env.has(resolvedName) && !env.get(resolvedName).varTransform) {
                    return env.get(resolvedName);
                }
            }
            return null;
        } else {
            while (name.length > 0) {
                var nameStr = name.map(unwrapSyntax).join('');
                if (env.names.get(nameStr)) {
                    var nameStx = syn.makeIdent(nameStr, name[0]);
                    var resolvedName = resolve(nameStx);
                    if (env.has(resolvedName) && !env.get(resolvedName).varTransform) {
                        return env.get(resolvedName);
                    }
                }
                name.pop();
            }
            return null;
        }
    }
    function nameInEnv(head, rest, env) {
        return getMacroInEnv(head, rest, env) !== null;
    }
    function resolveFast(stx, env) {
        var name = unwrapSyntax(stx);
        return env.names.get(name) ? resolve(stx) : name;
    }
    function expandMacro(stx, context, opCtx, opType, macroObj) {
        var // pull the macro transformer out the environment
        head = stx[0];
        var rest = stx.slice(1);
        macroObj = macroObj || getMacroInEnv(head, rest, context.env);
        var stxArg = rest.slice(macroObj.fullName.length - 1);
        var transformer;
        if (opType != null) {
            assert(opType === 'binary' || opType === 'unary', 'operator type should be either unary or binary: ' + opType);
            transformer = macroObj[opType].fn;
        } else {
            transformer = macroObj.fn;
        }
        assert(typeof transformer === 'function', 'Macro transformer not bound for: ' + head.token.value);
        var // create a new mark to be used for the input to
        // the macro
        newMark = fresh();
        var transformerContext = makeExpanderContext(_.defaults({ mark: newMark }, context));
        // apply the transformer
        var rt;
        try {
            rt = transformer([head].concat(stxArg), transformerContext, opCtx.prevStx, opCtx.prevTerms);
        } catch (e) {
            if (e instanceof SyntaxCaseError) {
                var // add a nicer error for syntax case
                nameStr = macroObj.fullName.map(function (stx$2) {
                    return stx$2.token.value;
                }).join('');
                if (opType != null) {
                    var argumentString = '`' + stxArg.slice(0, 5).map(function (stx$2) {
                        return stx$2.token.value;
                    }).join(' ') + '...`';
                    throwSyntaxError('operator', 'Operator `' + nameStr + '` could not be matched with ' + argumentString, head);
                } else {
                    var argumentString = '`' + stxArg.slice(0, 5).map(function (stx$2) {
                        return stx$2.token.value;
                    }).join(' ') + '...`';
                    throwSyntaxError('macro', 'Macro `' + nameStr + '` could not be matched with ' + argumentString, head);
                }
            } else {
                // just rethrow it
                throw e;
            }
        }
        if (!builtinMode && !macroObj.builtin) {
            expandCount++;
        }
        if (!Array.isArray(rt.result)) {
            throwSyntaxError('enforest', 'Macro must return a syntax array', stx[0]);
        }
        if (rt.result.length > 0) {
            var adjustedResult = adjustLineContext(rt.result, head);
            if (stx[0].token.leadingComments) {
                if (adjustedResult[0].token.leadingComments) {
                    adjustedResult[0].token.leadingComments = adjustedResult[0].token.leadingComments.concat(head.token.leadingComments);
                } else {
                    adjustedResult[0].token.leadingComments = head.token.leadingComments;
                }
            }
            rt.result = adjustedResult;
        }
        return rt;
    }
    function comparePrec(left, right, assoc) {
        if (assoc === 'left') {
            return left <= right;
        }
        return left < right;
    }
    function enforest(toks, context, prevStx, prevTerms) {
        assert(toks.length > 0, 'enforest assumes there are tokens to work with');
        prevStx = prevStx || [];
        prevTerms = prevTerms || [];
        if (expandCount >= maxExpands) {
            return {
                result: null,
                rest: toks
            };
        }
        function step(head, rest, opCtx) {
            var innerTokens;
            assert(Array.isArray(rest), 'result must at least be an empty array');
            if (head.isTermTree) {
                var isCustomOp = false;
                var uopMacroObj;
                var uopSyntax;
                if (head.isPunc || head.isKeyword || head.isId) {
                    if (head.isPunc) {
                        uopSyntax = head.punc;
                    } else if (head.isKeyword) {
                        uopSyntax = head.keyword;
                    } else if (head.isId) {
                        uopSyntax = head.id;
                    }
                    uopMacroObj = getMacroInEnv(uopSyntax, rest, context.env);
                    isCustomOp = uopMacroObj && uopMacroObj.isOp;
                }
                // look up once (we want to check multiple properties on bopMacroObj
                // without repeatedly calling getMacroInEnv)
                var bopMacroObj;
                if (rest[0] && rest[1]) {
                    bopMacroObj = getMacroInEnv(rest[0], rest.slice(1), context.env);
                }
                if (// unary operator
                    isCustomOp && uopMacroObj.unary || uopSyntax && stxIsUnaryOp(uopSyntax)) {
                    var uopPrec;
                    if (isCustomOp && uopMacroObj.unary) {
                        uopPrec = uopMacroObj.unary.prec;
                    } else {
                        uopPrec = getUnaryOpPrec(unwrapSyntax(uopSyntax));
                    }
                    var opRest = rest;
                    var uopMacroName;
                    if (uopMacroObj) {
                        uopMacroName = [uopSyntax].concat(rest.slice(0, uopMacroObj.fullName.length - 1));
                        opRest = rest.slice(uopMacroObj.fullName.length - 1);
                    } else if (unwrapSyntax(uopSyntax) === 'yield' && unwrapSyntax(opRest[0]) === '*') {
                        uopSyntax = [
                            uopSyntax,
                            opRest[0]
                        ];
                        opRest = opRest.slice(1);
                    }
                    var leftLeft = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartial ? opCtx.prevTerms[0] : null;
                    var unopTerm = PartialOperation.create(head, leftLeft);
                    var unopPrevStx = tagWithTerm(unopTerm, head.destruct().reverse()).concat(opCtx.prevStx);
                    var unopPrevTerms = [unopTerm].concat(opCtx.prevTerms);
                    var unopOpCtx = _.extend({}, opCtx, {
                        combine: function (t) {
                            if (t.isExpr) {
                                if (isCustomOp && uopMacroObj.unary) {
                                    var rt$2 = expandMacro(uopMacroName.concat(t.destruct()), context, opCtx, 'unary');
                                    var newt = get_expression(rt$2.result, context);
                                    assert(newt.rest.length === 0, 'should never have left over syntax');
                                    return opCtx.combine(newt.result);
                                }
                                return opCtx.combine(UnaryOp.create(uopSyntax, t));
                            } else {
                                // not actually an expression so don't create
                                // a UnaryOp term just return with the punctuator
                                return opCtx.combine(head);
                            }
                        },
                        prec: uopPrec,
                        prevStx: unopPrevStx,
                        prevTerms: unopPrevTerms,
                        op: unopTerm
                    });
                    return step(opRest[0], opRest.slice(1), unopOpCtx);
                } else if (head.isExpr && (rest[0] && rest[1] && (stxIsBinOp(rest[0]) && !bopMacroObj || bopMacroObj && bopMacroObj.isOp && bopMacroObj.binary))) {
                    var opRes;
                    var op = rest[0];
                    var left = head;
                    var rightStx = rest.slice(1);
                    var leftLeft = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartial ? opCtx.prevTerms[0] : null;
                    var leftTerm = PartialExpression.create(head.destruct(), leftLeft, function () {
                        return step(head, [], opCtx);
                    });
                    var opTerm = PartialOperation.create(op, leftTerm);
                    var opPrevStx = tagWithTerm(opTerm, [rest[0]]).concat(tagWithTerm(leftTerm, head.destruct()).reverse(), opCtx.prevStx);
                    var opPrevTerms = [
                        opTerm,
                        leftTerm
                    ].concat(opCtx.prevTerms);
                    var isCustomOp = bopMacroObj && bopMacroObj.isOp && bopMacroObj.binary;
                    var bopPrec;
                    var bopAssoc;
                    if (isCustomOp && bopMacroObj.binary) {
                        bopPrec = bopMacroObj.binary.prec;
                        bopAssoc = bopMacroObj.binary.assoc;
                    } else {
                        bopPrec = getBinaryOpPrec(unwrapSyntax(op));
                        bopAssoc = getBinaryOpAssoc(unwrapSyntax(op));
                    }
                    assert(bopPrec !== undefined, 'expecting a precedence for operator: ' + op);
                    var newStack;
                    if (comparePrec(bopPrec, opCtx.prec, bopAssoc)) {
                        var bopCtx = opCtx;
                        var combResult = opCtx.combine(head);
                        if (opCtx.stack.length > 0) {
                            return step(combResult.term, rest, opCtx.stack[0]);
                        }
                        left = combResult.term;
                        newStack = opCtx.stack;
                        opPrevStx = combResult.prevStx;
                        opPrevTerms = combResult.prevTerms;
                    } else {
                        newStack = [opCtx].concat(opCtx.stack);
                    }
                    assert(opCtx.combine !== undefined, 'expecting a combine function');
                    var opRightStx = rightStx;
                    var bopMacroName;
                    if (isCustomOp) {
                        bopMacroName = rest.slice(0, bopMacroObj.fullName.length);
                        opRightStx = rightStx.slice(bopMacroObj.fullName.length - 1);
                    }
                    var bopOpCtx = _.extend({}, opCtx, {
                        combine: function (right) {
                            if (right.isExpr) {
                                if (isCustomOp && bopMacroObj.binary) {
                                    var leftStx = left.destruct();
                                    var rightStx$2 = right.destruct();
                                    var rt$2 = expandMacro(bopMacroName.concat(syn.makeDelim('()', leftStx, leftStx[0]), syn.makeDelim('()', rightStx$2, rightStx$2[0])), context, opCtx, 'binary');
                                    var newt = get_expression(rt$2.result, context);
                                    assert(newt.rest.length === 0, 'should never have left over syntax');
                                    return {
                                        term: newt.result,
                                        prevStx: opPrevStx,
                                        prevTerms: opPrevTerms
                                    };
                                }
                                return {
                                    term: BinOp.create(left, op, right),
                                    prevStx: opPrevStx,
                                    prevTerms: opPrevTerms
                                };
                            } else {
                                return {
                                    term: head,
                                    prevStx: opPrevStx,
                                    prevTerms: opPrevTerms
                                };
                            }
                        },
                        prec: bopPrec,
                        op: opTerm,
                        stack: newStack,
                        prevStx: opPrevStx,
                        prevTerms: opPrevTerms
                    });
                    return step(opRightStx[0], opRightStx.slice(1), bopOpCtx);
                } else if (head.isExpr && (rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()')) {
                    var parenRes = enforestParenExpression(rest[0], context);
                    if (parenRes) {
                        return step(Call.create(head, parenRes), rest.slice(1), opCtx);
                    }
                } else if (head.isExpr && (rest[0] && resolveFast(rest[0], context.env) === '?')) {
                    var question = rest[0];
                    var condRes = enforest(rest.slice(1), context);
                    if (condRes.result) {
                        var truExpr = condRes.result;
                        var condRight = condRes.rest;
                        if (truExpr.isExpr && condRight[0] && resolveFast(condRight[0], context.env) === ':') {
                            var colon = condRight[0];
                            var flsRes = enforest(condRight.slice(1), context);
                            var flsExpr = flsRes.result;
                            if (flsExpr.isExpr) {
                                if (// operators are combined before the ternary
                                    opCtx.prec >= 4) {
                                    var // ternary is like a operator with prec 4
                                    headResult = opCtx.combine(head);
                                    var condTerm = ConditionalExpression.create(headResult.term, question, truExpr, colon, flsExpr);
                                    if (opCtx.stack.length > 0) {
                                        return step(condTerm, flsRes.rest, opCtx.stack[0]);
                                    } else {
                                        return {
                                            result: condTerm,
                                            rest: flsRes.rest,
                                            prevStx: headResult.prevStx,
                                            prevTerms: headResult.prevTerms
                                        };
                                    }
                                } else {
                                    var condTerm = ConditionalExpression.create(head, question, truExpr, colon, flsExpr);
                                    return step(condTerm, flsRes.rest, opCtx);
                                }
                            }
                        }
                    }
                } else if (head.isDelimiter && head.delim.token.value === '()' && rest[0] && rest[0].token.type === parser.Token.Punctuator && resolveFast(rest[0], context.env) === '=>') {
                    var arrowRes = enforest(rest.slice(1), context);
                    if (arrowRes.result && arrowRes.result.isExpr) {
                        return step(ArrowFun.create(head.delim, rest[0], arrowRes.result.destruct()), arrowRes.rest, opCtx);
                    } else {
                        throwSyntaxError('enforest', 'Body of arrow function must be an expression', rest.slice(1));
                    }
                } else if (head.isId && rest[0] && rest[0].token.type === parser.Token.Punctuator && resolveFast(rest[0], context.env) === '=>') {
                    var res = enforest(rest.slice(1), context);
                    if (res.result && res.result.isExpr) {
                        return step(ArrowFun.create(head.id, rest[0], res.result.destruct()), res.rest, opCtx);
                    } else {
                        throwSyntaxError('enforest', 'Body of arrow function must be an expression', rest.slice(1));
                    }
                } else if (head.isDelimiter && head.delim.token.value === '()') {
                    if (// empty parens are acceptable but enforest
                        // doesn't accept empty arrays so short
                        // circuit here
                        head.delim.token.inner.length === 0) {
                        return step(ParenExpression.create([Empty.create()], head.delim.expose(), []), rest, opCtx);
                    } else {
                        var parenRes = enforestParenExpression(head.delim, context);
                        if (parenRes) {
                            return step(parenRes, rest, opCtx);
                        }
                    }
                } else if (head.isExpr && ((head.isId || head.isObjGet || head.isObjDotGet || head.isThisExpression) && rest[0] && rest[1] && !bopMacroObj && opCtx.op === null && stxIsAssignOp(rest[0]))) {
                    var opRes = enforestAssignment(rest, context, head, prevStx, prevTerms);
                    if (opRes && opRes.result) {
                        return step(opRes.result, opRes.rest, _.extend({}, opCtx, {
                            prevStx: opRes.prevStx,
                            prevTerms: opRes.prevTerms
                        }));
                    }
                } else if (head.isExpr && (rest[0] && (unwrapSyntax(rest[0]) === '++' || unwrapSyntax(rest[0]) === '--'))) {
                    if (// Check if the operator is a macro first.
                        context.env.has(resolveFast(rest[0], context.env))) {
                        var headStx = tagWithTerm(head, head.destruct().reverse());
                        var opPrevStx = headStx.concat(prevStx);
                        var opPrevTerms = [head].concat(prevTerms);
                        var opRes = enforest(rest, context, opPrevStx, opPrevTerms);
                        if (opRes.prevTerms.length < opPrevTerms.length) {
                            return opRes;
                        } else if (opRes.result) {
                            return step(head, opRes.result.destruct().concat(opRes.rest), opCtx);
                        }
                    }
                    return step(PostfixOp.create(head, rest[0]), rest.slice(1), opCtx);
                } else if (head.isExpr && (rest[0] && rest[0].token.value === '[]')) {
                    return step(ObjGet.create(head, Delimiter.create(rest[0].expose())), rest.slice(1), opCtx);
                } else if (head.isExpr && (rest[0] && unwrapSyntax(rest[0]) === '.' && !context.env.has(resolveFast(rest[0], context.env)) && rest[1] && (rest[1].token.type === parser.Token.Identifier || rest[1].token.type === parser.Token.Keyword))) {
                    if (// Check if the identifier is a macro first.
                        context.env.has(resolveFast(rest[1], context.env)) && nameInEnv(rest[1], [], context.env)) {
                        var headStx = tagWithTerm(head, head.destruct().reverse());
                        var dotTerm = Punc.create(rest[0]);
                        var dotTerms = [dotTerm].concat(head, prevTerms);
                        var dotStx = tagWithTerm(dotTerm, [rest[0]]).concat(headStx, prevStx);
                        var dotRes = enforest(rest.slice(1), context, dotStx, dotTerms);
                        if (dotRes.prevTerms.length < dotTerms.length) {
                            return dotRes;
                        } else if (dotRes.result) {
                            return step(head, [rest[0]].concat(dotRes.result.destruct(), dotRes.rest), opCtx);
                        }
                    }
                    return step(ObjDotGet.create(head, rest[0], rest[1]), rest.slice(2), opCtx);
                } else if (head.isDelimiter && head.delim.token.value === '[]') {
                    return step(ArrayLiteral.create(head), rest, opCtx);
                } else if (head.isDelimiter && head.delim.token.value === '{}') {
                    return step(Block.create(head), rest, opCtx);
                } else if (head.isId && unwrapSyntax(head.id) === '#quoteSyntax' && rest[0] && rest[0].token.value === '{}') {
                    var tempId = fresh();
                    context.templateMap.set(tempId, rest[0].token.inner);
                    return step(syn.makeIdent('getTemplate', head.id), [syn.makeDelim('()', [syn.makeValue(tempId, head.id)], head.id)].concat(rest.slice(1)), opCtx);
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'return') {
                    if (rest[0] && rest[0].token.lineNumber === head.keyword.token.lineNumber) {
                        var returnPrevStx = tagWithTerm(head, head.destruct()).concat(opCtx.prevStx);
                        var returnPrevTerms = [head].concat(opCtx.prevTerms);
                        var returnExpr = enforest(rest, context, returnPrevStx, returnPrevTerms);
                        if (returnExpr.prevTerms.length < opCtx.prevTerms.length) {
                            return returnExpr;
                        }
                        if (returnExpr.result.isExpr) {
                            return step(ReturnStatement.create(head, returnExpr.result), returnExpr.rest, opCtx);
                        }
                    } else {
                        return step(ReturnStatement.create(head, Empty.create()), rest, opCtx);
                    }
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'let') {
                    var nameTokens = [];
                    if (rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()') {
                        nameTokens = rest[0].token.inner;
                    } else {
                        nameTokens.push(rest[0]);
                    }
                    if (// Let macro
                        rest[1] && rest[1].token.value === '=' && rest[2] && rest[2].token.value === 'macro') {
                        var mac = enforest(rest.slice(2), context);
                        if (mac.result) {
                            if (!mac.result.isAnonMacro) {
                                throwSyntaxError('enforest', 'expecting an anonymous macro definition in syntax let binding', rest.slice(2));
                            }
                            return step(LetMacro.create(nameTokens, mac.result.body), mac.rest, opCtx);
                        }
                    } else {
                        var lsRes = enforestVarStatement(rest, context, head.keyword);
                        if (lsRes && lsRes.result) {
                            return step(LetStatement.create(head, lsRes.result), lsRes.rest, opCtx);
                        }
                    }
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'var' && rest[0]) {
                    var vsRes = enforestVarStatement(rest, context, head.keyword);
                    if (vsRes && vsRes.result) {
                        return step(VariableStatement.create(head, vsRes.result), vsRes.rest, opCtx);
                    }
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'const' && rest[0]) {
                    var csRes = enforestVarStatement(rest, context, head.keyword);
                    if (csRes && csRes.result) {
                        return step(ConstStatement.create(head, csRes.result), csRes.rest, opCtx);
                    }
                } else if (head.isKeyword && unwrapSyntax(head.keyword) === 'for' && rest[0] && rest[0].token.value === '()') {
                    return step(ForStatement.create(head.keyword, rest[0]), rest.slice(1), opCtx);
                }
            } else {
                assert(head && head.token, 'assuming head is a syntax object');
                var macroObj = expandCount < maxExpands && getMacroInEnv(head, rest, context.env);
                if (// macro invocation
                    macroObj && !macroObj.isOp) {
                    var rt = expandMacro([head].concat(rest), context, opCtx, null, macroObj);
                    var newOpCtx = opCtx;
                    if (rt.prevTerms && rt.prevTerms.length < opCtx.prevTerms.length) {
                        newOpCtx = rewindOpCtx(opCtx, rt);
                    }
                    if (rt.result.length > 0) {
                        return step(rt.result[0], rt.result.slice(1).concat(rt.rest), newOpCtx);
                    } else {
                        return step(Empty.create(), rt.rest, newOpCtx);
                    }
                } else if (head.token.type === parser.Token.Identifier && resolve(head) === 'macro' && rest[0] && rest[0].token.value === '{}') {
                    return step(AnonMacro.create(rest[0].expose().token.inner), rest.slice(1), opCtx);
                } else if (head.token.type === parser.Token.Identifier && resolve(head) === 'macro') {
                    var nameTokens = [];
                    if (rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()') {
                        nameTokens = rest[0].expose().token.inner;
                    } else {
                        nameTokens.push(rest[0]);
                    }
                    if (rest[1] && rest[1].token.type === parser.Token.Delimiter) {
                        return step(Macro.create(nameTokens, rest[1].expose().token.inner), rest.slice(2), opCtx);
                    } else {
                        throwSyntaxError('enforest', 'Macro declaration must include body', rest[1]);
                    }
                } else if (head.token.type === parser.Token.Identifier && head.token.value === 'unaryop' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()' && rest[1] && rest[1].token.type === parser.Token.NumericLiteral && rest[2] && rest[2].token.type === parser.Token.Delimiter && rest[2] && rest[2].token.value === '{}') {
                    var trans = enforest(rest[2].expose().token.inner, context);
                    return step(OperatorDefinition.create('unary', rest[0].expose().token.inner, rest[1], null, trans.result.body), rest.slice(3), opCtx);
                } else if (head.token.type === parser.Token.Identifier && head.token.value === 'binaryop' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()' && rest[1] && rest[1].token.type === parser.Token.NumericLiteral && rest[2] && rest[2].token.type === parser.Token.Identifier && rest[3] && rest[3].token.type === parser.Token.Delimiter && rest[3] && rest[3].token.value === '{}') {
                    var trans = enforest(rest[3].expose().token.inner, context);
                    return step(OperatorDefinition.create('binary', rest[0].expose().token.inner, rest[1], rest[2], trans.result.body), rest.slice(4), opCtx);
                } else if (unwrapSyntax(head) === 'module' && rest[0] && rest[0].token.value === '{}') {
                    return step(Module.create(rest[0], []), rest.slice(1), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'function' && rest[0] && rest[0].token.type === parser.Token.Identifier && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '()' && rest[2] && rest[2].token.type === parser.Token.Delimiter && rest[2].token.value === '{}') {
                    rest[1].token.inner = rest[1].expose().token.inner;
                    rest[2].token.inner = rest[2].expose().token.inner;
                    return step(NamedFun.create(head, null, rest[0], rest[1], rest[2]), rest.slice(3), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'function' && rest[0] && rest[0].token.type === parser.Token.Punctuator && rest[0].token.value === '*' && rest[1] && rest[1].token.type === parser.Token.Identifier && rest[2] && rest[2].token.type === parser.Token.Delimiter && rest[2].token.value === '()' && rest[3] && rest[3].token.type === parser.Token.Delimiter && rest[3].token.value === '{}') {
                    rest[2].token.inner = rest[2].expose().token.inner;
                    rest[3].token.inner = rest[3].expose().token.inner;
                    return step(NamedFun.create(head, rest[0], rest[1], rest[2], rest[3]), rest.slice(4), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'function' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()' && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '{}') {
                    rest[0].token.inner = rest[0].expose().token.inner;
                    rest[1].token.inner = rest[1].expose().token.inner;
                    return step(AnonFun.create(head, null, rest[0], rest[1]), rest.slice(2), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'function' && rest[0] && rest[0].token.type === parser.Token.Punctuator && rest[0].token.value === '*' && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '()' && rest[2] && rest[2].token.type === parser.Token.Delimiter && rest[2].token.value === '{}') {
                    rest[1].token.inner = rest[1].expose().token.inner;
                    rest[2].token.inner = rest[2].expose().token.inner;
                    return step(AnonFun.create(head, rest[0], rest[1], rest[2]), rest.slice(3), opCtx);
                } else if ((head.token.type === parser.Token.Delimiter && head.token.value === '()' || head.token.type === parser.Token.Identifier) && rest[0] && rest[0].token.type === parser.Token.Punctuator && resolveFast(rest[0], context.env) === '=>' && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '{}') {
                    return step(ArrowFun.create(head, rest[0], rest[1]), rest.slice(2), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'catch' && rest[0] && rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()' && rest[1] && rest[1].token.type === parser.Token.Delimiter && rest[1].token.value === '{}') {
                    rest[0].token.inner = rest[0].expose().token.inner;
                    rest[1].token.inner = rest[1].expose().token.inner;
                    return step(CatchClause.create(head, rest[0], rest[1]), rest.slice(2), opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'this') {
                    return step(ThisExpression.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.NumericLiteral || head.token.type === parser.Token.StringLiteral || head.token.type === parser.Token.BooleanLiteral || head.token.type === parser.Token.RegularExpression || head.token.type === parser.Token.NullLiteral) {
                    return step(Lit.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'export' && rest[0] && (rest[0].token.type === parser.Token.Identifier || rest[0].token.type === parser.Token.Keyword || rest[0].token.type === parser.Token.Punctuator || rest[0].token.type === parser.Token.Delimiter && rest[0].token.value === '()')) {
                    if (// Consume optional semicolon
                        unwrapSyntax(rest[1]) === ';') {
                        rest.splice(1, 1);
                    }
                    return step(Export.create(rest[0]), rest.slice(1), opCtx);
                } else if (head.token.type === parser.Token.Identifier) {
                    return step(Id.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Punctuator) {
                    return step(Punc.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Keyword && unwrapSyntax(head) === 'with') {
                    throwSyntaxError('enforest', 'with is not supported in sweet.js', head);
                } else if (head.token.type === parser.Token.Keyword) {
                    return step(Keyword.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.Delimiter) {
                    return step(Delimiter.create(head.expose()), rest, opCtx);
                } else if (head.token.type === parser.Token.Template) {
                    return step(Template.create(head), rest, opCtx);
                } else if (head.token.type === parser.Token.EOF) {
                    assert(rest.length === 0, 'nothing should be after an EOF');
                    return step(EOF.create(head), [], opCtx);
                } else {
                    // todo: are we missing cases?
                    assert(false, 'not implemented');
                }
            }
            if (// Potentially an infix macro
                // This should only be invoked on runtime syntax terms
                !head.isMacro && !head.isLetMacro && !head.isAnonMacro && !head.isOperatorDefinition && rest.length && nameInEnv(rest[0], rest.slice(1), context.env) && getMacroInEnv(rest[0], rest.slice(1), context.env).isOp === false) {
                var infLeftTerm = opCtx.prevTerms[0] && opCtx.prevTerms[0].isPartial ? opCtx.prevTerms[0] : null;
                var infTerm = PartialExpression.create(head.destruct(), infLeftTerm, function () {
                    return step(head, [], opCtx);
                });
                var infPrevStx = tagWithTerm(infTerm, head.destruct()).reverse().concat(opCtx.prevStx);
                var infPrevTerms = [infTerm].concat(opCtx.prevTerms);
                var infRes = expandMacro(rest, context, {
                    prevStx: infPrevStx,
                    prevTerms: infPrevTerms
                });
                if (infRes.prevTerms && infRes.prevTerms.length < infPrevTerms.length) {
                    var infOpCtx = rewindOpCtx(opCtx, infRes);
                    return step(infRes.result[0], infRes.result.slice(1).concat(infRes.rest), infOpCtx);
                } else {
                    return step(head, infRes.result.concat(infRes.rest), opCtx);
                }
            }
            var // done with current step so combine and continue on
            combResult = opCtx.combine(head);
            if (opCtx.stack.length === 0) {
                return {
                    result: combResult.term,
                    rest: rest,
                    prevStx: combResult.prevStx,
                    prevTerms: combResult.prevTerms
                };
            } else {
                return step(combResult.term, rest, opCtx.stack[0]);
            }
        }
        return step(toks[0], toks.slice(1), {
            combine: function (t) {
                return {
                    term: t,
                    prevStx: prevStx,
                    prevTerms: prevTerms
                };
            },
            prec: 0,
            stack: [],
            op: null,
            prevStx: prevStx,
            prevTerms: prevTerms
        });
    }
    function rewindOpCtx(opCtx, res) {
        if (// If we've consumed all pending operators, we can just start over.
            // It's important that we always thread the new prevStx and prevTerms
            // through, otherwise the old ones will still persist.
            !res.prevTerms.length || !res.prevTerms[0].isPartial) {
            return _.extend({}, opCtx, {
                combine: function (t) {
                    return {
                        term: t,
                        prevStx: res.prevStx,
                        prevTerms: res.prevTerms
                    };
                },
                prec: 0,
                op: null,
                stack: [],
                prevStx: res.prevStx,
                prevTerms: res.prevTerms
            });
        }
        // To rewind, we need to find the first (previous) pending operator. It
        // acts as a marker in the opCtx to let us know how far we need to go
        // back.
        var op = null;
        for (var i = 0; i < res.prevTerms.length; i++) {
            if (!res.prevTerms[i].isPartial) {
                break;
            }
            if (res.prevTerms[i].isPartialOperation) {
                op = res.prevTerms[i];
                break;
            }
        }
        if (// If the op matches the current opCtx, we don't need to rewind
            // anything, but we still need to persist the prevStx and prevTerms.
            opCtx.op === op) {
            return _.extend({}, opCtx, {
                prevStx: res.prevStx,
                prevTerms: res.prevTerms
            });
        }
        for (var i = 0; i < opCtx.stack.length; i++) {
            if (opCtx.stack[i].op === op) {
                return _.extend({}, opCtx.stack[i], {
                    prevStx: res.prevStx,
                    prevTerms: res.prevTerms
                });
            }
        }
        assert(false, 'Rewind failed.');
    }
    function get_expression(stx, context) {
        if (stx[0].term) {
            for (var termLen = 1; termLen < stx.length; termLen++) {
                if (stx[termLen].term !== stx[0].term) {
                    break;
                }
            }
            if (// Guard the termLen because we can have a multi-token term that
                // we don't want to split. TODO: is there something we can do to
                // get around this safely?
                stx[0].term.isPartialExpression && termLen === stx[0].term.stx.length) {
                var expr = stx[0].term.combine().result;
                for (var i = 1, term = stx[0].term; i < stx.length; i++) {
                    if (stx[i].term !== term) {
                        if (term && term.isPartial) {
                            term = term.left;
                            i--;
                        } else {
                            break;
                        }
                    }
                }
                return {
                    result: expr,
                    rest: stx.slice(i)
                };
            } else if (stx[0].term.isExpr) {
                return {
                    result: stx[0].term,
                    rest: stx.slice(termLen)
                };
            } else {
                return {
                    result: null,
                    rest: stx
                };
            }
        }
        var res = enforest(stx, context);
        if (!res.result || !res.result.isExpr) {
            return {
                result: null,
                rest: stx
            };
        }
        return res;
    }
    function tagWithTerm(term, stx) {
        return stx.map(function (s) {
            var src = s.token;
            var keys = Object.keys(src);
            var newtok = {};
            for (var i = 0, len = keys.length, key; i < len; i++) {
                key = keys[i];
                newtok[key] = src[key];
            }
            s = syntaxFromToken(newtok, s);
            s.term = term;
            return s;
        });
    }
    function applyMarkToPatternEnv(newMark, env) {
        function dfs(match) {
            if (match.level === 0) {
                // replace the match property with the marked syntax
                match.match = _.map(match.match, function (stx) {
                    return stx.mark(newMark);
                });
            } else {
                _.each(match.match, function (match$2) {
                    dfs(match$2);
                });
            }
        }
        _.keys(env).forEach(function (key) {
            dfs(env[key]);
        });
    }
    function markIn(arr, mark) {
        return arr.map(function (stx) {
            return stx.mark(mark);
        });
    }
    function markDefOut(arr, mark, def) {
        return arr.map(function (stx) {
            return stx.mark(mark).addDefCtx(def);
        });
    }
    function loadMacroDef(def, context, rest) {
        var body = def.body;
        if (!(// raw function primitive form
            body[0] && body[0].token.type === parser.Token.Keyword && body[0].token.value === 'function')) {
            throwSyntaxError('load macro', 'Primitive macro form must contain a function for the macro body', body);
        }
        var stub = parser.read('()');
        stub[0].token.inner = body;
        var expanded = expand(stub, context);
        expanded = expanded[0].destruct().concat(expanded[1].eof);
        var flattend = flatten(expanded);
        var bodyCode = codegen.generate(parser.parse(flattend));
        var localCtx, matchedTokens;
        var macroFn = scopedEval(bodyCode, {
            makeValue: syn.makeValue,
            makeRegex: syn.makeRegex,
            makeIdent: syn.makeIdent,
            makeKeyword: syn.makeKeyword,
            makePunc: syn.makePunc,
            makeDelim: syn.makeDelim,
            filename: context.filename,
            require: function (id) {
                if (context.requireModule) {
                    return context.requireModule(id, context.filename);
                }
                return require(id);
            },
            localExpand: function (stx, stop) {
                assert(!stop || stop.length === 0, 'localExpand stop lists are not currently supported');
                var markedStx = markIn(stx, localCtx.mark);
                var terms = expand(markedStx, localCtx);
                var newStx = terms.reduce(function (acc, term) {
                    acc.push.apply(acc, term.destruct());
                    return acc;
                }, []);
                return markDefOut(newStx, localCtx.mark, localCtx.defscope);
            },
            getExpr: function (stx) {
                if (stx.length === 0) {
                    return {
                        success: false,
                        result: [],
                        rest: []
                    };
                }
                var markedStx = markIn(stx, localCtx.mark);
                var r = get_expression(markedStx, localCtx);
                return {
                    success: r.result !== null,
                    result: r.result === null ? [] : markDefOut(r.result.destruct(), localCtx.mark, localCtx.defscope),
                    rest: markDefOut(r.rest, localCtx.mark, localCtx.defscope)
                };
            },
            getIdent: function (stx) {
                if (stx[0] && stx[0].token.type === parser.Token.Identifier) {
                    return {
                        success: true,
                        result: [stx[0]],
                        rest: stx.slice(1)
                    };
                }
                return {
                    success: false,
                    result: [],
                    rest: stx
                };
            },
            getLit: function (stx) {
                if (stx[0] && patternModule.typeIsLiteral(stx[0].token.type)) {
                    return {
                        success: true,
                        result: [stx[0]],
                        rest: stx.slice(1)
                    };
                }
                return {
                    success: false,
                    result: [],
                    rest: stx
                };
            },
            matchPatterns: function (syntax, topLevel, reverse) {
                function flatMap(input, selector) {
                    var output = [], outputCount = 0, index$2 = -1, count$2 = input.length, elem, index2, count2;
                    while (++index$2 < count$2) {
                        elem = selector(input[index$2], index$2, input);
                        index2 = -1;
                        count2 = elem.length;
                        while (++index2 < count2) {
                            output[outputCount++] = elem[index2];
                        }
                    }
                    return output;
                }
                var patterns = Array.prototype.slice.call(arguments, 1 + // 1 if topLevel is boolean, else 0
                Number(typeof topLevel !== 'boolean' === false) + // 1 if reverse is boolean, else 0
                Number(typeof reverse !== 'boolean' === false));
                // Default topLevel to true
                topLevel = topLevel === false ? false : true;
                // Default reverse to false
                reverse = reverse === true || false;
                patterns = flatMap(patterns, function flatten$2(pattern$2) {
                    if (Array.isArray(pattern$2)) {
                        if (Array.isArray(pattern$2[0])) {
                            return flatMap(pattern$2, flatten$2);
                        }
                        return [pattern$2];
                    }
                    return pattern$2;
                }).map(function (pattern$2) {
                    return patternModule.loadPattern(pattern$2, reverse);
                });
                var result, pattern, index = -1, count = patterns.length;
                while (++index < count) {
                    result = patternModule.matchPatterns(patterns[index], syntax, localCtx, topLevel);
                    if (result.success) {
                        return result;
                    }
                }
                return {
                    success: false,
                    result: [],
                    rest: [],
                    patternEnv: {}
                };
            },
            unwrapSyntax: syn.unwrapSyntax,
            throwSyntaxError: throwSyntaxError,
            throwSyntaxCaseError: throwSyntaxCaseError,
            prettyPrint: syn.prettyPrint,
            parser: parser,
            __fresh: fresh,
            _: _,
            patternModule: patternModule,
            getPattern: function (id) {
                return context.patternMap.get(id);
            },
            getTemplate: function (id) {
                return syn.cloneSyntaxArray(context.templateMap.get(id));
            },
            applyMarkToPatternEnv: applyMarkToPatternEnv,
            mergeMatches: function (newMatch, oldMatch) {
                newMatch.patternEnv = _.extend({}, oldMatch.patternEnv, newMatch.patternEnv);
                return newMatch;
            }
        });
        if (context.log) {
            context.log.push({
                name: def.name[0].token,
                matchedTokens: matchedTokens = [],
                next: rest[0] && rest[0].token || undefined
            });
        }
        return function (stx, context$2, prevStx, prevTerms) {
            localCtx = context$2;
            var result = macroFn(stx, context$2, prevStx, prevTerms);
            if (matchedTokens) {
                var
                    // from = stx.takeUntil (x) -> x == rest[0]
                    i = 0, next = result.rest[0];
                while (stx[i] !== next)
                    matchedTokens.push(stx[i++].token);
            }
            return result;
        };
    }
    function expandToTermTree(stx, context) {
        assert(context, 'expander context is required');
        var f, head, prevStx, restStx, prevTerms, macroDefinition;
        var rest = stx;
        while (rest.length > 0) {
            assert(rest[0].token, 'expecting a syntax object');
            f = enforest(rest, context, prevStx, prevTerms);
            // head :: TermTree
            head = f.result;
            // rest :: [Syntax]
            rest = f.rest;
            if (!head) {
                // no head means the expansions stopped prematurely (for stepping)
                restStx = rest;
                break;
            }
            if (head.isMacro && expandCount < maxExpands) {
                // load the macro definition into the environment and continue expanding
                macroDefinition = loadMacroDef(head, context, rest);
                var name = head.name.map(unwrapSyntax).join('');
                var nameStx = syn.makeIdent(name, head.name[0]);
                addToDefinitionCtx([nameStx], context.defscope, false, context.paramscope);
                context.env.names.set(name, true);
                context.env.set(resolve(nameStx), {
                    fn: macroDefinition,
                    isOp: false,
                    builtin: builtinMode,
                    fullName: head.name
                });
                continue;
            }
            if (head.isLetMacro && expandCount < maxExpands) {
                // load the macro definition into the environment and continue expanding
                macroDefinition = loadMacroDef(head, context, rest);
                var freshName = fresh();
                var name = head.name.map(unwrapSyntax).join('');
                var nameStx = syn.makeIdent(name, head.name[0]);
                var renamedName = nameStx.rename(nameStx, freshName);
                rest = _.map(rest, function (stx$2) {
                    return stx$2.rename(nameStx, freshName);
                });
                context.env.names.set(name, true);
                context.env.set(resolve(renamedName), {
                    fn: macroDefinition,
                    isOp: false,
                    builtin: builtinMode,
                    fullName: head.name
                });
                continue;
            }
            if (head.isOperatorDefinition) {
                var opDefinition = loadMacroDef(head, context, rest);
                var name = head.name.map(unwrapSyntax).join('');
                var nameStx = syn.makeIdent(name, head.name[0]);
                addToDefinitionCtx([nameStx], context.defscope, false, context.paramscope);
                var resolvedName = resolve(nameStx);
                var opObj = context.env.get(resolvedName);
                if (!opObj) {
                    opObj = {
                        isOp: true,
                        builtin: builtinMode,
                        fullName: head.name
                    };
                }
                assert(head.type === 'binary' || head.type === 'unary', 'operator must either be binary or unary');
                opObj[head.type] = {
                    fn: opDefinition,
                    prec: head.prec.token.value,
                    assoc: head.assoc ? head.assoc.token.value : null
                };
                context.env.names.set(name, true);
                context.env.set(resolvedName, opObj);
                continue;
            }
            var // We build the newPrevTerms/Stx here (instead of at the beginning) so
            // that macro definitions don't get added to it.
            destructed = tagWithTerm(head, f.result.destruct());
            prevTerms = [head].concat(f.prevTerms);
            prevStx = destructed.reverse().concat(f.prevStx);
            if (head.isNamedFun) {
                addToDefinitionCtx([head.name], context.defscope, true, context.paramscope);
            }
            if (head.isVariableStatement || head.isLetStatement || head.isConstStatement) {
                addToDefinitionCtx(_.map(head.decls, function (decl) {
                    return decl.ident;
                }), context.defscope, true, context.paramscope);
            }
            if (head.isBlock && head.body.isDelimiter) {
                head.body.delim.token.inner.forEach(function (term) {
                    if (term.isVariableStatement) {
                        addToDefinitionCtx(_.map(term.decls, function (decl) {
                            return decl.ident;
                        }), context.defscope, true, context.paramscope);
                    }
                });
            }
            if (head.isDelimiter) {
                head.delim.token.inner.forEach(function (term) {
                    if (term.isVariableStatement) {
                        addToDefinitionCtx(_.map(term.decls, function (decl) {
                            return decl.ident;
                        }), context.defscope, true, context.paramscope);
                    }
                });
            }
            if (head.isForStatement) {
                head.cond.expose();
                var forCond = head.cond.token.inner;
                if (forCond[0] && resolve(forCond[0]) === 'let' && forCond[1] && forCond[1].token.type === parser.Token.Identifier) {
                    var letNew = fresh();
                    var letId = forCond[1];
                    forCond = forCond.map(function (stx$2) {
                        return stx$2.rename(letId, letNew);
                    });
                    // hack: we want to do the let renaming here, not
                    // in the expansion of `for (...)` so just remove the `let`
                    // keyword
                    head.cond.token.inner = expand([forCond[0]], context).concat(expand(forCond.slice(1), context));
                    if (// nice and easy case: `for (...) { ... }`
                        rest[0] && rest[0].token.value === '{}') {
                        rest[0] = rest[0].rename(letId, letNew);
                    } else {
                        var // need to deal with things like `for (...) if (...) log(...)`
                        bodyEnf = enforest(rest, context);
                        var bodyDestructed = bodyEnf.result.destruct();
                        var renamedBodyTerm = bodyEnf.result.rename(letId, letNew);
                        tagWithTerm(renamedBodyTerm, bodyDestructed);
                        rest = bodyEnf.rest;
                        prevStx = bodyDestructed.reverse().concat(prevStx);
                        prevTerms = [renamedBodyTerm].concat(prevTerms);
                    }
                } else {
                    head.cond.token.inner = expand(head.cond.token.inner, context);
                }
            }
        }
        return {
            // prevTerms are stored in reverse for the purposes of infix
            // lookbehind matching, so we need to re-reverse them.
            terms: prevTerms ? prevTerms.reverse() : [],
            restStx: restStx,
            context: context
        };
    }
    function addToDefinitionCtx(idents, defscope, skipRep, paramscope) {
        assert(idents && idents.length > 0, 'expecting some variable identifiers');
        // flag for skipping repeats since we reuse this function to place both
        // variables declarations (which need to skip redeclarations) and
        // macro definitions which don't
        skipRep = skipRep || false;
        _.chain(idents).filter(function (id) {
            if (skipRep) {
                var /*
                       When var declarations repeat in the same function scope:

                       var x = 24;
                       ...
                       var x = 42;

                       we just need to use the first renaming and leave the
                       definition context as is.
                    */
                varDeclRep = _.find(defscope, function (def) {
                    return def.id.token.value === id.token.value && arraysEqual(marksof(def.id.context), marksof(id.context));
                });
                var /*
                        When var declaration repeat one of the function parameters:

                        function foo(x) {
                            var x;
                        }

                        we don't need to add the var to the definition context.
                    */
                paramDeclRep = _.find(paramscope, function (param) {
                    return param.token.value === id.token.value && arraysEqual(marksof(param.context), marksof(id.context));
                });
                return typeof varDeclRep === 'undefined' && typeof paramDeclRep === 'undefined';
            }
            return true;
        }).each(function (id) {
            var name = fresh();
            defscope.push({
                id: id,
                name: name
            });
        });
    }
    function expandTermTreeToFinal(term, context) {
        assert(context && context.env, 'environment map is required');
        if (term.isArrayLiteral) {
            term.array.delim.token.inner = expand(term.array.delim.expose().token.inner, context);
            return term;
        } else if (term.isBlock) {
            term.body.delim.token.inner = expand(term.body.delim.expose().token.inner, context);
            return term;
        } else if (term.isParenExpression) {
            term.args = _.map(term.args, function (arg) {
                return expandTermTreeToFinal(arg, context);
            });
            return term;
        } else if (term.isCall) {
            term.fun = expandTermTreeToFinal(term.fun, context);
            term.args = expandTermTreeToFinal(term.args, context);
            return term;
        } else if (term.isReturnStatement) {
            term.expr = expandTermTreeToFinal(term.expr, context);
            return term;
        } else if (term.isUnaryOp) {
            term.expr = expandTermTreeToFinal(term.expr, context);
            return term;
        } else if (term.isBinOp || term.isAssignmentExpression) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right = expandTermTreeToFinal(term.right, context);
            return term;
        } else if (term.isObjGet) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right.delim.token.inner = expand(term.right.delim.expose().token.inner, context);
            return term;
        } else if (term.isObjDotGet) {
            term.left = expandTermTreeToFinal(term.left, context);
            term.right = expandTermTreeToFinal(term.right, context);
            return term;
        } else if (term.isConditionalExpression) {
            term.cond = expandTermTreeToFinal(term.cond, context);
            term.tru = expandTermTreeToFinal(term.tru, context);
            term.fls = expandTermTreeToFinal(term.fls, context);
            return term;
        } else if (term.isVariableDeclaration) {
            if (term.init) {
                term.init = expandTermTreeToFinal(term.init, context);
            }
            return term;
        } else if (term.isVariableStatement || term.isLetStatement || term.isConstStatement) {
            term.decls = _.map(term.decls, function (decl) {
                return expandTermTreeToFinal(decl, context);
            });
            return term;
        } else if (term.isDelimiter) {
            // expand inside the delimiter and then continue on
            term.delim.token.inner = expand(term.delim.expose().token.inner, context);
            return term;
        } else if (term.isId) {
            var trans = context.env.get(resolve(term.id));
            if (trans && trans.varTransform) {
                term.id = syntaxFromToken(term.id.token, trans.varTransform);
            }
            return term;
        } else if (term.isNamedFun || term.isAnonFun || term.isCatchClause || term.isArrowFun || term.isModule) {
            // function definitions need a bunch of hygiene logic
            // push down a fresh definition context
            var newDef = [];
            var paramSingleIdent = term.params && term.params.token.type === parser.Token.Identifier;
            var params;
            if (term.params && term.params.token.type === parser.Token.Delimiter) {
                params = term.params.expose();
            } else if (paramSingleIdent) {
                params = term.params;
            } else {
                params = syn.makeDelim('()', [], null);
            }
            var bodies;
            if (Array.isArray(term.body)) {
                bodies = syn.makeDelim('{}', term.body, null);
            } else {
                bodies = term.body;
            }
            bodies = bodies.addDefCtx(newDef);
            var paramNames = _.map(getParamIdentifiers(params), function (param) {
                var freshName = fresh();
                var renamed = param.rename(param, freshName);
                context.env.names.set(renamed.token.value, true);
                context.env.set(resolve(renamed), { varTransform: renamed });
                return {
                    freshName: freshName,
                    originalParam: param,
                    renamedParam: renamed
                };
            });
            var bodyContext = makeExpanderContext(_.defaults({
                defscope: newDef,
                // paramscope is used to filter out var redeclarations
                paramscope: paramNames.map(function (p) {
                    return p.renamedParam;
                })
            }, context));
            var // rename the function body for each of the parameters
            renamedBody = _.reduce(paramNames, function (accBody, p) {
                return accBody.rename(p.originalParam, p.freshName);
            }, bodies);
            renamedBody = renamedBody.expose();
            var expandedResult = expandToTermTree(renamedBody.token.inner, bodyContext);
            var bodyTerms = expandedResult.terms;
            if (expandedResult.restStx) {
                // The expansion was halted prematurely. Just stop and
                // return what we have so far, along with the rest of the syntax
                renamedBody.token.inner = expandedResult.terms.concat(expandedResult.restStx);
                if (Array.isArray(term.body)) {
                    term.body = renamedBody.token.inner;
                } else {
                    term.body = renamedBody;
                }
                return term;
            }
            var renamedParams = _.map(paramNames, function (p) {
                return p.renamedParam;
            });
            var flatArgs;
            if (paramSingleIdent) {
                flatArgs = renamedParams[0];
            } else {
                var puncCtx = term.params || null;
                flatArgs = syn.makeDelim('()', joinSyntax(renamedParams, syn.makePunc(',', puncCtx)), puncCtx);
            }
            var expandedArgs = expand([flatArgs], bodyContext);
            assert(expandedArgs.length === 1, 'should only get back one result');
            if (// stitch up the function with all the renamings
                term.params) {
                term.params = expandedArgs[0];
            }
            bodyTerms = _.map(bodyTerms, function (bodyTerm) {
                if (// add the definition context to the result of
                    // expansion (this makes sure that syntax objects
                    // introduced by expansion have the def context)
                    bodyTerm.isBlock) {
                    var // we need to expand blocks before adding the defctx since
                    // blocks defer macro expansion.
                    blockFinal = expandTermTreeToFinal(bodyTerm, expandedResult.context);
                    return blockFinal.addDefCtx(newDef);
                } else {
                    var termWithCtx = bodyTerm.addDefCtx(newDef);
                    // finish expansion
                    return expandTermTreeToFinal(termWithCtx, expandedResult.context);
                }
            });
            if (term.isModule) {
                bodyTerms = _.filter(bodyTerms, function (bodyTerm) {
                    if (bodyTerm.isExport) {
                        term.exports.push(bodyTerm);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            renamedBody.token.inner = bodyTerms;
            if (Array.isArray(term.body)) {
                term.body = renamedBody.token.inner;
            } else {
                term.body = renamedBody;
            }
            // and continue expand the rest
            return term;
        }
        // the term is fine as is
        return term;
    }
    function expand(stx, context) {
        assert(context, 'must provide an expander context');
        var trees = expandToTermTree(stx, context);
        var terms = _.map(trees.terms, function (term) {
            return expandTermTreeToFinal(term, trees.context);
        });
        if (trees.restStx) {
            terms.push.apply(terms, trees.restStx);
        }
        return terms;
    }
    function makeExpanderContext(o) {
        o = o || {};
        var env = o.env || new StringMap();
        if (!env.names) {
            env.names = new StringMap();
        }
        return Object.create(Object.prototype, {
            filename: {
                value: o.filename,
                writable: false,
                enumerable: true,
                configurable: false
            },
            requireModule: {
                value: o.requireModule,
                writable: false,
                enumerable: true,
                configurable: false
            },
            env: {
                value: env,
                writable: false,
                enumerable: true,
                configurable: false
            },
            defscope: {
                value: o.defscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            paramscope: {
                value: o.paramscope,
                writable: false,
                enumerable: true,
                configurable: false
            },
            templateMap: {
                value: o.templateMap || new StringMap(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            patternMap: {
                value: o.patternMap || new StringMap(),
                writable: false,
                enumerable: true,
                configurable: false
            },
            mark: {
                value: o.mark,
                writable: false,
                enumerable: true,
                configurable: false
            },
            log: {
                value: o.log,
                writable: false,
                enumerable: true,
                configurable: false
            }
        });
    }
    function makeTopLevelExpanderContext(options) {
        var requireModule = options ? options.requireModule : undefined;
        var filename = options && options.filename ? options.filename : '<anonymous module>';
        return makeExpanderContext({
            filename: filename,
            requireModule: requireModule,
            log: options ? options.log : undefined
        });
    }
    function expandTopLevel(stx, moduleContexts, options) {
        moduleContexts = moduleContexts || [];
        options = options || {};
        options.flatten = options.flatten != null ? options.flatten : true;
        maxExpands = options.maxExpands || Infinity;
        expandCount = 0;
        var context = makeTopLevelExpanderContext(options);
        var modBody = syn.makeDelim('{}', stx, null);
        modBody = _.reduce(moduleContexts, function (acc, mod) {
            context.env.extend(mod.env);
            context.env.names.extend(mod.env.names);
            return loadModuleExports(acc, context.env, mod.exports, mod.env);
        }, modBody);
        var res = expand([
            syn.makeIdent('module', null),
            modBody
        ], context);
        res = res[0].destruct();
        res = res[0].token.inner;
        return options.flatten ? flatten(res) : res;
    }
    function expandModule(stx, moduleContexts, options) {
        moduleContexts = moduleContexts || [];
        maxExpands = Infinity;
        expandCount = 0;
        var context = makeTopLevelExpanderContext(options);
        var modBody = syn.makeDelim('{}', stx, null);
        modBody = _.reduce(moduleContexts, function (acc, mod) {
            context.env.extend(mod.env);
            context.env.names.extend(mod.env.names);
            return loadModuleExports(acc, context.env, mod.exports, mod.env);
        }, modBody);
        builtinMode = true;
        var moduleRes = expand([
            syn.makeIdent('module', null),
            modBody
        ], context);
        builtinMode = false;
        context.exports = _.map(moduleRes[0].exports, function (term) {
            var nameStr, name;
            if (term.name.token.type === parser.Token.Delimiter) {
                nameStr = term.name.token.inner.map(unwrapSyntax).join('');
                name = syn.makeIdent(nameStr, term.name);
            } else {
                name = term.name;
                nameStr = unwrapSyntax(name);
            }
            return {
                oldExport: name,
                newParam: syn.makeIdent(nameStr, null)
            };
        });
        return context;
    }
    function loadModuleExports(stx, newEnv, exports$3, oldEnv) {
        return _.reduce(exports$3, function (acc, param) {
            var newName = fresh();
            var transformer = oldEnv.get(resolve(param.oldExport));
            if (transformer) {
                newEnv.set(resolve(param.newParam.rename(param.newParam, newName)), transformer);
                return acc.rename(param.newParam, newName);
            } else {
                return acc;
            }
        }, stx);
    }
    function flatten(stxs) {
        var acc = [], accLen = 0;
        var stack = [], frame;
        var depth = 0;
        var index = -1;
        var count = stxs.length;
        var stx, tok, exposed, openParen, closeParen;
        flattening:
            while (depth > -1) {
                while (++index < count) {
                    if ((tok = (stx = stxs[index]) && stx.token) && tok.type === parser.Token.Delimiter) {
                        exposed = stx.expose();
                        openParen = syntaxFromToken({
                            type: parser.Token.Punctuator,
                            value: tok.value[0],
                            range: tok.startRange,
                            sm_range: typeof tok.sm_startRange == 'undefined' ? tok.startRange : tok.sm_startRange,
                            lineNumber: tok.startLineNumber,
                            sm_lineNumber: typeof tok.sm_startLineNumber == 'undefined' ? tok.startLineNumber : tok.sm_startLineNumber,
                            lineStart: tok.startLineStart,
                            sm_lineStart: typeof tok.sm_startLineStart == 'undefined' ? tok.startLineStart : tok.sm_startLineStart
                        }, exposed);
                        closeParen = syntaxFromToken({
                            type: parser.Token.Punctuator,
                            value: tok.value[1],
                            range: tok.endRange,
                            sm_range: typeof tok.sm_endRange == 'undefined' ? tok.endRange : tok.sm_endRange,
                            lineNumber: tok.endLineNumber,
                            sm_lineNumber: typeof tok.sm_endLineNumber == 'undefined' ? tok.endLineNumber : tok.sm_endLineNumber,
                            lineStart: tok.endLineStart,
                            sm_lineStart: typeof tok.sm_endLineStart == 'undefined' ? tok.endLineStart : tok.sm_endLineStart
                        }, exposed);
                        if (tok.leadingComments) {
                            openParen.token.leadingComments = tok.leadingComments;
                        }
                        if (tok.trailingComments) {
                            openParen.token.trailingComments = tok.trailingComments;
                        }
                        acc[accLen++] = openParen;
                        stack[depth++] = [
                            tok,
                            closeParen,
                            stxs,
                            index
                        ];
                        stxs = exposed.token.inner;
                        index = -1;
                        count = stxs.length;
                        continue;
                    }
                    tok.sm_lineNumber = typeof tok.sm_lineNumber != 'undefined' ? tok.sm_lineNumber : tok.lineNumber;
                    tok.sm_lineStart = typeof tok.sm_lineStart != 'undefined' ? tok.sm_lineStart : tok.lineStart;
                    tok.sm_range = typeof tok.sm_range != 'undefined' ? tok.sm_range : tok.range;
                    acc[accLen++] = stx;
                }
                if (--depth > -1) {
                    frame = stack[depth];
                    tok = frame[0];
                    closeParen = frame[1];
                    acc[accLen++] = closeParen;
                    tok.sm_lineNumber = typeof tok.sm_lineNumber != 'undefined' ? tok.sm_lineNumber : tok.lineNumber;
                    tok.sm_lineStart = typeof tok.sm_lineStart != 'undefined' ? tok.sm_lineStart : tok.lineStart;
                    tok.sm_range = typeof tok.sm_range != 'undefined' ? tok.sm_range : tok.range;
                    stxs = frame[2];
                    index = frame[3];
                    count = stxs.length;
                    continue flattening;
                }
            }
        return acc;
    }
    exports$2.StringMap = StringMap;
    exports$2.enforest = enforest;
    exports$2.expand = expandTopLevel;
    exports$2.expandModule = expandModule;
    exports$2.resolve = resolve;
    exports$2.get_expression = get_expression;
    exports$2.getName = getName;
    exports$2.getMacroInEnv = getMacroInEnv;
    exports$2.nameInEnv = nameInEnv;
    exports$2.makeExpanderContext = makeExpanderContext;
    exports$2.Expr = Expr;
    exports$2.VariableStatement = VariableStatement;
    exports$2.tokensToSyntax = syn.tokensToSyntax;
    exports$2.syntaxToTokens = syn.syntaxToTokens;
}));
//# sourceMappingURL=expander.js.map