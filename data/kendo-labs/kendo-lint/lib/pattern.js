/***********************************************************************

  Pattern.js: Regexps for Trees

  Based on techniques described in this document by Russ Cox:
  http://swtch.com/~rsc/regexp/regexp2.html

  -------------------------------- (C) ---------------------------------

                           Author: Mihai Bazon
                         <mihai.bazon@gmail.com>
                       http://mihai.bazon.net/blog

  Distributed under the BSD license:

    Copyright 2011 (c) Mihai Bazon <mihai.bazon@gmail.com>

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions
    are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the following
          disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the following
          disclaimer in the documentation and/or other materials
          provided with the distribution.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDER “AS IS” AND ANY
    EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
    IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
    PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE
    LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY,
    OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
    PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
    PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
    THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
    TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
    THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
    SUCH DAMAGE.

 ***********************************************************************/

function Match(name, node, begin, end) {
    this.name = name;
    this.node = node;
    this.begin = begin;
    this.end = end;
    this.refresh();
};
Match.prototype = {
    replace: function(content) {
        if (content instanceof Match) content = content.content();
        var a = [ this.begin, this.end - this.begin ];
        a.push.apply(a, content);
        this.node.splice.apply(this.node, a);
        this.end = this.begin + content.length;
        this.val = content;
    },
    swap: function(node) {
        var tmp = node.content();
        node.replace(this.content());
        this.replace(tmp);
    },
    content: function() {
        return this.val;
    },
    first: function() {
        return this.val[0];
    },
    refresh: function() {
        return this.val = this.node.slice(this.begin, this.end);
    }
};

function MatchData(node, start) {
    this.$node = node;
    this.$start = start;
    this.$groups = [];
};
MatchData.prototype = {
    $match: function() {
        return this.$_match || (
            this.$_match = new Match(null, this.$node, this.$start, this.$end)
        );
    }
};

function search(ast, pat, onmatch) {
    for (var i = 0; i < ast.length; ++i) {
        var data = new MatchData(ast, i);
        if (matches(pat, 0, ast, i, data)) {
            var ret = onmatch(data);
            if (ret != null) i = ret - 1;
            else if (data.$end > i) i = data.$end - 1;
        }
        if (ast[i] instanceof Array)
            search(ast[i], pat, onmatch);
    }
};

function equals(a, b, j) {
    if (a instanceof Array && b instanceof Array) {
        for (var i = 0; i < a.length; ++i, ++j) {
            if (!equals(a[i], b[j], 0)) return false;
        }
        return true;
    }
    return a == b;
};

// this implements the VM.
//
//  `pat' is a compiled pattern
// `node' is the node that should be matched
//    `p' is the "program counter" -- index of current instruction in `pat'.  initially zero.
//    `n' is the current index in `node'.
// `data' is an object where additional match data will be inserted.
function matches(pat, p, node, n, data) {
    var nlen = node.length;
    while (true) {
        var op = pat[p];
        switch (op[0]) {
          case "DIVE":
            if (!(node[n] instanceof Array)) return false;
            if (!matches(op[1], 0, node[n], 0, data)) return false;
            p++, n++;
            break;
          case "FORK":
            if (matches(pat, op[1], node, n, data)) return true;
            p = op[2];
            break;
          case "EQL":
            if (n == nlen) return false;
            if (op[1] != node[n]) return false;
            p++, n++;
            break;
          case "EQ":
            if (n == nlen) return false;
            if (op[1] !== node[n]) return false;
            p++, n++;
            break;
          case "SKIP":
            if (n == nlen) return false;
            p++, n++;
            break;
          case "JMP":
            p = op[1];
            break;
          case "SAVE":
            data.$groups[op[1]] = n;
            p++;
            break;
          case "NAME":
            data[op[1]] = new Match(op[1], node, data.$groups[op[2]], data.$groups[op[3]]);
            p++;
            break;
          case "BACKREF":
            var ref = op[1];
            if (!HOP(data, ref)) return false;
            ref = data[ref].content();
            if (!equals(ref, node, n)) return false;
            p++, n += ref.length;
            break;
          case "CHECK":
            if (!op[1](node[n], data, node, n)) return false;
            p++, n++;
            break;
          case "END":
            if (n < nlen) return false;
            p++;
            break;
          case "MATCH":
            data.$end = n;
            return true;
          default:
            throw new Error("Unknown instruction: " + op[0]);
        }
    }
};

var compile = (function(){
    var _label, _group;
    function $label() { this.id = ++_label };
    function $ref(label) { this.label = label };
    $label.prototype.ref = function(){ return new $ref(this) };
    function label() { return new $label() };
    function _comp_or(e1, e2) {
        var l1 = label(), l2 = label(), l3 = label();
        var ret = [
            [ "FORK", l1.ref(), l2.ref() ],
            l1
        ];
        ret.push.apply(ret, e1);
        ret.push([ "JMP", l3.ref() ], l2);
        ret.push.apply(ret, e2);
        ret.push(l3);
        return ret;
    };
    function comp_or(cases) {
        var n = cases.length;
        if (n == 0) return [];
        if (n == 1) return compile(cases[0]);
        var e2 = cases.pop(), e1 = cases.pop(), ret = _comp_or(compile(e1), compile(e2));
        while (cases.length > 0) {
            ret = _comp_or(compile(cases.pop()), ret);
        }
        return ret;
    };
    function comp_maybe(list, non_greedy) {
        var l1 = label(), l2 = label();
        var ret = [
            non_greedy
                ? [ "FORK", l2.ref(), l1.ref() ]
                : [ "FORK", l1.ref(), l2.ref() ],
            l1
        ];
        ret.push.apply(ret, mapcon(list, compile));
        ret.push(l2);
        return ret;
    };
    function comp_many(list, non_greedy) {
        var l1 = label(), l2 = label(), l3 = label();
        var ret = [
            l1,
            non_greedy
                ? [ "FORK", l3.ref(), l2.ref() ]
                : [ "FORK", l2.ref(), l3.ref() ],
            l2
        ];
        ret.push.apply(ret, mapcon(list, compile));
        ret.push([ "JMP", l1.ref() ], l3);
        return ret;
    };
    function comp_more(list, non_greedy) {
        var l1 = label(), l2 = label();
        var ret = [
            l1
        ];
        ret.push.apply(ret, mapcon(list, compile));
        ret.push(non_greedy
                 ? [ "FORK", l2.ref(), l1.ref() ]
                 : [ "FORK", l1.ref(), l2.ref() ], l2);
        return ret;
    };
    function comp_group(name, list) {
        var g = ++_group;
        var ret = mapcon(list, compile);
        ret.unshift([ "SAVE", 2*g ]);
        ret.push([ "SAVE", 2*g+1 ]);
        if (name != null) ret.push([ "NAME", name, 2*g, 2*g+1 ]);
        return ret;
    };
    function compile(e) {
        if (e instanceof OR) return comp_or(e.cases);
        if (e instanceof MAYBE) return comp_maybe(e.list, e.non_greedy);
        if (e instanceof MANY) return comp_many(e.list, e.non_greedy);
        if (e instanceof MORE) return comp_more(e.list, e.non_greedy);
        if (e instanceof GROUP) return comp_group(e.name, e.list);
        if (e instanceof BACKREF) return [[ "BACKREF", e.name ]];
        if (e instanceof CHECK) return [[ "CHECK", e.pred ]];
        if (e instanceof ANYTHING) return [[ "SKIP" ]];
        if (e instanceof END) return [[ "END" ]];
        if (e instanceof Array) {
            e = mapcon(e, compile);
            e.push([ "MATCH" ]);
            return [[ "DIVE", e ]];
        }
        return [[ "EQL", e ]];
    };
    function resolve_labels(a) {
        var refs = [];
        var ret = loop(a);
        for (var i = 0; i < refs.length; ++i) {
            var el = refs[i];
            el.loc[0][el.loc[1]] = el.label.index;
        }
        return ret;
        function loop(a) {
            var ret = [], index = 0;
            for (var i = 0; i < a.length; ++i) {
                var el = a[i];
                if (el instanceof Array) ret[index++] = loop(el);
                else if (el instanceof $label) el.index = index;
                else {
                    if (el instanceof $ref) {
                        el.loc = [ ret, index ];
                        refs.push(el);
                    }
                    ret[index++] = el;
                }
            }
            return ret;
        };
    };
    /* -----[ entry point ]----- */
    return function() {
        _label = 0;
        _group = 0;
        var ret = mapcon(slice(arguments), compile);
        ret.unshift([ "SAVE", 0 ]);
        ret.push([ "SAVE", 1 ], [ "MATCH" ]);
        ret = resolve_labels(ret);
        return ret;
    };
})();

function OR(cases) { this.cases = cases };
function MAYBE(list, ng) { this.list = list; this.non_greedy = ng; };
function MANY(list, ng) { this.list = list; this.non_greedy = ng; };
function MORE(list, ng) { this.list = list; this.non_greedy = ng; };
function ANYTHING() {};
function GROUP(name, list) { this.name = name; this.list = list; };
function CHECK(pred) { this.pred = pred; }
function BACKREF(name) { this.name = name; }
function END() {};

/* -----[ exports ]----- */

var EX = {
    or         : function() { return new OR(slice(arguments)) },
    maybe      : function() { return new MAYBE(slice(arguments), false) },
    maybeng    : function() { return new MAYBE(slice(arguments), true) },
    many       : function() { return new MANY(slice(arguments), false) },
    more       : function() { return new MORE(slice(arguments), false) },
    manyng     : function() { return new MANY(slice(arguments), true) },
    moreng     : function() { return new MORE(slice(arguments), true) },
    group      : function() { return new GROUP(null, slice(arguments)) },
    named      : function(name) {
        var a = slice(arguments, 1);
        if (a.length == 0)
            a = [ new ANYTHING() ];
        return new GROUP(name, a);
    },
    ref        : function(name) { return new BACKREF(name) },
    anything   : function() { return new ANYTHING() },
    whatever   : function() { return new MANY([new ANYTHING()]) },
    whateverng : function() { return new MANY([new ANYTHING()], true) },
    check      : function(predicate) { return new CHECK(predicate) },
    end        : function() { return new END() },
    compile    : compile,
    search     : search,
    match      : matches
};

for (var i in EX)
    if (HOP(EX, i))
        exports[i] = exports[i.toUpperCase()] = EX[i];

/* -----[ utils ]----- */

var $slice = Array.prototype.slice;
function slice(a, offset) {
    return $slice.call(a, offset);
};

function mapcon(a, f) {
    var ret = [];
    a.forEach(function(a, i){ ret.push.apply(ret, f(a, i)) });
    return ret;
};

function HOP(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
};
