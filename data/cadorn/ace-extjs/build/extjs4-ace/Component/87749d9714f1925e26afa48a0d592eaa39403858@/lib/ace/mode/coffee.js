require.memoize(bravojs.realpath(bravojs.mainModuleDir + '/87749d9714f1925e26afa48a0d592eaa39403858@/lib/ace/mode/coffee'), ['ace/tokenizer','ace/mode/coffee_highlight_rules','ace/mode/matching_brace_outdent','ace/range','ace/mode/text','pilot/oop'], function (require, exports, module) {


var Tokenizer = require("ace/tokenizer").Tokenizer;
var Rules     = require("ace/mode/coffee_highlight_rules").CoffeeHighlightRules;
var Outdent   = require("ace/mode/matching_brace_outdent").MatchingBraceOutdent;
var Range     = require("ace/range").Range;
var TextMode  = require("ace/mode/text").Mode;
var oop       = require("pilot/oop")

function CoffeeMode() {
    this.$tokenizer = new Tokenizer(new Rules().getRules());
    this.$outdent   = new Outdent();
};

oop.inherits(CoffeeMode, TextMode);

var proto = CoffeeMode.prototype;
var indenter = /(?:[({[=:]|[-=]>|\b(?:else|switch|try|catch(?:\s*[$A-Za-z_\x7f-\uffff][$\w\x7f-\uffff]*)?|finally))\s*$/;
var commentLine = /^(\s*)#/;
var hereComment = /^\s*###(?!#)/;
var indentation = /^\s*/;

proto.getNextLineIndent = function(state, line, tab) {
    var indent = this.$getIndent(line);
    var tokens = this.$tokenizer.getLineTokens(line, state).tokens;

    if (!(tokens.length && tokens[tokens.length - 1].type === 'comment') &&
        state === 'start' && indenter.test(line))
        indent += tab;
    return indent;
};

proto.toggleCommentLines = function(state, doc, startRow, endRow){
    console.log("toggle");
    var range = new Range(0, 0, 0, 0);
    for (var i = startRow; i <= endRow; ++i) {
        var line = doc.getLine(i);
        if (hereComment.test(line))
            continue;
            
        if (commentLine.test(line))
            line = line.replace(commentLine, '$1');
        else
            line = line.replace(indentation, '$&#');

        range.end.row = range.start.row = i;
        range.end.column = line.length + 1;
        doc.replace(range, line);
    }
};

proto.checkOutdent = function(state, line, input) {
    return this.$outdent.checkOutdent(line, input);
};

proto.autoOutdent = function(state, doc, row) {
    this.$outdent.autoOutdent(doc, row);
};

exports.Mode = CoffeeMode;

});
require.memoize(bravojs.realpath(bravojs.mainModuleDir + '/87749d9714f1925e26afa48a0d592eaa39403858@/lib/ace/mode/coffee_highlight_rules'), ['pilot/oop','ace/mode/text_highlight_rules'], function (require, exports, module) {


require("pilot/oop").inherits(
  CoffeeHighlightRules,
  require("ace/mode/text_highlight_rules").TextHighlightRules);

function CoffeeHighlightRules() {
var identifier = "[$A-Za-z_\\x7f-\\uffff][$\\w\\x7f-\\uffff]*"
  , keywordend = "(?![$\\w]|\\s*:)"
  , stringfill = {token: "string", regex: ".+"}
;
this.$rules =
  { start:
    [ { token: "identifier"
      , regex: "(?:@|(?:\\.|::)\\s*)" + identifier
      }
    , { token: "keyword"
      , regex: "(?:t(?:h(?:is|row|en)|ry|ypeof)|s(?:uper|witch)|return|b(?:reak|y)|c(?:ontinue|atch|lass)|i(?:n(?:stanceof)?|s(?:nt)?|f)|e(?:lse|xtends)|f(?:or (?:own)?|inally|unction)|wh(?:ile|en)|n(?:ew|ot?)|d(?:e(?:lete|bugger)|o)|loop|o(?:ff?|[rn])|un(?:less|til)|and|yes)" + keywordend
      }
    , { token: "constant.language"
      , regex: "(?:true|false|null|undefined)" + keywordend
      }
    , { token: "invalid.illegal"
      , regex: "(?:c(?:ase|onst)|default|function|v(?:ar|oid)|with|e(?:num|xport)|i(?:mplements|nterface)|let|p(?:ackage|r(?:ivate|otected)|ublic)|static|yield|__(?:hasProp|extends|slice|bind|indexOf))" + keywordend
      }
    , { token: "language.support.class"
      , regex: "(?:Array|Boolean|Date|Function|Number|Object|R(?:e(?:gExp|ferenceError)|angeError)|S(?:tring|yntaxError)|E(?:rror|valError)|TypeError|URIError)" + keywordend
      }
    , { token: "language.support.function"
      , regex: "(?:Math|JSON|is(?:NaN|Finite)|parse(?:Int|Float)|encodeURI(?:Component)?|decodeURI(?:Component)?)" + keywordend
      }
    , { token: "identifier"
      , regex: identifier
      }
    , { token: "constant.numeric"
      , regex: "(?:0x[\\da-fA-F]+|(?:\\d+(?:\\.\\d+)?|\\.\\d+)(?:[eE][+-]?\\d+)?)"
      }
    , { token: "string"
      , regex: "'''"
      , next : "qdoc"
      }
    , { token: "string"
      , regex: '"""'
      , next : "qqdoc"
      }
    , { token: "string"
      , regex: "'"
      , next : "qstring"
      }
    , { token: "string"
      , regex: '"'
      , next : "qqstring"
      }
    , { token: "string"
      , regex: "`"
      , next : "js"
      }
    , { token: "string.regex"
      , regex: "///"
      , next : "heregex"
      }
    , { token: "string.regex"
      , regex: "/(?!\\s)[^[/\\n\\\\]*(?: (?:\\\\.|\\[[^\\]\\n\\\\]*(?:\\\\.[^\\]\\n\\\\]*)*\\])[^[/\\n\\\\]*)*/[imgy]{0,4}(?!\\w)"
      }
    , { token: "comment"
      , regex: "###(?!#)"
      , next : "comment"
      }
    , { token: "comment"
      , regex: "#.*"
      }
    , { token: "lparen"
      , regex: "[({[]"
      }
    , { token: "rparen"
      , regex: "[\\]})]"
      }
    , { token: "keyword.operator"
      , regex: "\\S+"
      }
    , { token: "text"
      , regex: "\\s+"
      }
    ]
  , qdoc:
    [ { token: "string"
      , regex: ".*?'''"
      , next : "start"
      }
    , stringfill
    ]
  , qqdoc:
    [ { token: "string"
      , regex: '.*?"""'
      , next : "start"
      }
    , stringfill
    ]
  , qstring:
    [ { token: "string"
      , regex: "[^\\\\']*(?:\\\\.[^\\\\']*)*'"
      , next : "start"
      }
    , stringfill
    ]
  , qqstring:
    [ { token: "string"
      , regex: '[^\\\\"]*(?:\\\\.[^\\\\"]*)*"'
      , next : "start"
      }
    , stringfill
    ]
  , js:
    [ { token: "string"
      , regex: "[^\\\\`]*(?:\\\\.[^\\\\`]*)*`"
      , next : "start"
      }
    , stringfill
    ]
  , heregex:
    [ { token: "string.regex"
      , regex: '.*?///[imgy]{0,4}'
      , next : "start"
      }
    , { token: "comment.regex"
      , regex: "\\s+(?:#.*)?"
      }
    , { token: "string.regex"
      , regex: "\\S+"
      }
    ]
  , comment:
    [ { token: "comment"
      , regex: '.*?###'
      , next : "start"
      }
    , { token: "comment"
      , regex: ".+"
      }
    ]
  };
}

exports.CoffeeHighlightRules = CoffeeHighlightRules;
});
__bravojs_loaded_moduleIdentifier = bravojs.realpath(bravojs.mainModuleDir + '/87749d9714f1925e26afa48a0d592eaa39403858@/lib/ace/mode/coffee');