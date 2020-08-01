/*
 Ockley 1.0
 Copyright 2011,  Matthew Page
 licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

 This handles syntax highlighting of apex files in CodeMirror
 */
CodeMirror.defineMode("apex", function(config, parserConfig) {
    var indentUnit = config.indentUnit;

    function loadWords(str) {
        var obj = {}, words = str.split(" ");
        var len = words.length;
        for (var i = 0; i < len; ++i) obj[words[i]] = true;
        return obj;
    }

    var apexKeywords = "abstract activate after and any array as asc autonomous before begin bigdecimal break bulk by byte case " +
            "cast  catch char class collect commit const continue convertcurrency count default delete desc do else end enum excludes " +
            "exit export extends false final finally first float for from future global goto group having hint if implements import includes" +
            "inner insert instanceof interface into join last last_90_days last_month last_n_days last_week like limit list " +
            "loop map merge new next_90_days next_month next_n_days next_week not null nulls number object of on or order outer override " +
            "package parallel pragma private protected public retrieve return returning rollback savepoint search select set sharing " +
            "short sort stat super static switch synchronized system testmethod then this this_month this_week throw today tolabel " +
            "tomorrow transaction trigger true try type undelete update upsert using virtual webservice when where while with yesterday ";

    var apexDataTypes = "blob boolean date datetime decimal double id int integer long string time";

    var keywords = loadWords(apexKeywords);
    var dataTypes = loadWords(apexDataTypes);

    var multiLineStrings = parserConfig.multiLineStrings;
    var $vars = parserConfig.$vars;
    var isOperatorChar = /[+\-*&%=<>!?|]/;

    function chain(stream, state, f) {
        state.tokenize = f;
        return f(stream, state);
    }

    var type;

    function ret(tp, style) {
        type = tp;
        return style;
    }

    function tokenBase(stream, state) {
        var ch = stream.next();
        if (ch == '"' || ch == "'")
            return chain(stream, state, tokenString(ch));
        else if (/[\[\]{}\(\),;\:\.]/.test(ch))
            return ret(ch);
//    else if (ch == "#" && cpp && state.startOfLine) {
//      stream.skipToEnd();
//      return ret("directive", "apex-preprocessor");
//    }
        else if (/\d/.test(ch)) {
            stream.eatWhile(/[\w\.]/)
            return ret("number", "apex-number");
        }
        else if (ch == "/") {
            if (stream.eat("*")) {
                return chain(stream, state, tokenComment);
            }
            else if (stream.eat("/")) {
                stream.skipToEnd();
                return ret("comment", "apex-comment");
            }
            else {
                stream.eatWhile(isOperatorChar);
                return ret("operator");
            }
        }
        else if (isOperatorChar.test(ch)) {
            stream.eatWhile(isOperatorChar);
            return ret("operator");
        }
        else if ($vars && ch == "$") {
            stream.eatWhile(/[\w\$_]/);
            return ret("word", "apex-var");
        }
        else {
            stream.eatWhile(/[\w\$_]/);
            var temp = stream.current().toLocaleLowerCase();
            if (keywords && keywords.propertyIsEnumerable(temp)){
                return ret("keyword", "apex-keyword");
            }
            if (dataTypes && dataTypes.propertyIsEnumerable(temp)){
                return ret("keyword", "apex-datatype");
            }
            return ret("word", "apex-word");
        }
    }

    function tokenString(quote) {
        return function(stream, state) {
            var escaped = false, next, end = false;
            while ((next = stream.next()) != null) {
                if (next == quote && !escaped) {
                    end = true;
                    break;
                }
                escaped = !escaped && next == "\\";
            }
            if (end || !(escaped || multiLineStrings))
                state.tokenize = tokenBase;
            return ret("string", "apex-string");
        };
    }

    function tokenComment(stream, state) {
        var maybeEnd = false, ch;
        while (ch = stream.next()) {
            if (ch == "/" && maybeEnd) {
                state.tokenize = tokenBase;
                break;
            }
            maybeEnd = (ch == "*");
        }
        return ret("comment", "apex-comment");
    }

    function Context(indented, column, type, align, prev) {
        this.indented = indented;
        this.column = column;
        this.type = type;
        this.align = align;
        this.prev = prev;
    }

    function pushContext(state, col, type) {
        return state.context = new Context(state.indented, col, type, null, state.context);
    }

    function popContext(state) {
        return state.context = state.context.prev;
    }

    // Interface

    return {
        startState: function(basecolumn) {
            return {
                tokenize: tokenBase,
                context: new Context((basecolumn || 0) - indentUnit, 0, "top", false),
                indented: 0,
                startOfLine: true
            };
        },

        token: function(stream, state) {
            var ctx = state.context;
            if (stream.sol()) {
                if (ctx.align == null) ctx.align = false;
                state.indented = stream.indentation();
                state.startOfLine = true;
            }
            if (stream.eatSpace()) return null;
            var style = state.tokenize(stream, state);
            if (type == "comment") return style;
            if (ctx.align == null) ctx.align = true;

            if ((type == ";" || type == ":") && ctx.type == "statement") popContext(state);
            else if (type == "{") pushContext(state, stream.column(), "}");
            else if (type == "[") pushContext(state, stream.column(), "]");
            else if (type == "(") pushContext(state, stream.column(), ")");
            else if (type == "}") {
                if (ctx.type == "statement") ctx = popContext(state);
                if (ctx.type == "}") ctx = popContext(state);
                if (ctx.type == "statement") ctx = popContext(state);
            }
            else if (type == ctx.type) popContext(state);
            else if (ctx.type == "}") pushContext(state, stream.column(), "statement");
            state.startOfLine = false;
            return style;
        },

        indent: function(state, textAfter) {
            if (state.tokenize != tokenBase) return 0;
            var firstChar = textAfter && textAfter.charAt(0), ctx = state.context, closing = firstChar == ctx.type;
            if (ctx.type == "statement") return ctx.indented + (firstChar == "{" ? 0 : indentUnit);
            else if (ctx.align) return ctx.column + (closing ? 0 : 1);
            else return ctx.indented + (closing ? 0 : indentUnit);
        },

        electricChars: "{}"
    };
});



