/**
 * uDoc:
 *  A lightweight documentation system, designed for use with uI
 *
 * Copyright (c) 2011, David Brown <dave@scri.pt>
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL DAVID BROWN BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

var base = '../../';

var fs = require('fs'),
    fspath = require('path'),
    markdown = require(base + 'contrib/markdown').markdown,
    highlight = require(base + 'contrib/highlight').Highlight;


/* Match all top-level blocks:
    This is a "special" two-asterisk block comment, plus
    all of the code leading up to the next "special" block comment. */

var block_regex =
    /(\/\*\*)((?:.|[\r\n])+?)(\*\/\s*)((?:.|[\r\n])*?)(?=\/\*\*|$)/g;

/* Match a single function prototype:
    This is a function and argument list on the right side of an
    object property assignment (i.e. the part to the right of `:`). */

var function_regex =
    /\s*([\$\w]+)\s*[:=]\s*function\s*\(((?:.|[\r\n])*?)\)\s*{/;

/* Match a single assignment:
    This is a simple variable assignment, both left and right sides. */

var assign_regex =
    /\s*(?:var)?\s*([\$\.\w]+)\s*[:=]\s*(.*?)(?:[\r\n]|$)/;

/* Match a single block comment:
    This matches regular comments only, not "special" ones. */

var comment_regex =
    /(?:\/\*)(?!\*)((?:.|[\r\n])+?)(?:\*\/)/g;

/* Match all asterisks at beginning-of-line:
    For a block-style comment, this can be used to remove the
    preceeding asterisks used to make the comment block stand out. */

var asterisk_regex = 
    /([\r\n]+)\s*\*/g;

/* Match all preprocessor directives:
    These are special instructions to the documentation system. */

var directive_regex =
    /[\r\n\s]*\@([\!\$\w]+)(?:\s+(.*?)(?:[:\r\n]|$))?/g;

/* Match indentation:
    This matches any beginning-of-line whitespace in a multiline string. */

var indent_regex = /([\r\n]+)(\s+)/g;

/* Newline:
    Match a single line break; useful for counting lines. */

var newline_regex = /\n/g;

/* Em-Dash:
    Finds all double-hyphens that look like they should be
    an em-dash. This is used in `render_html_final`, below. */

var mdash_regex = /\s+--\s+/g;


/** @namespace exports */

/**
 * read_file:
 */
exports.read_file = function (_path, _callback) {
    fs.readFile(_path, 'utf-8', function (_err, _text) {
        if (_err) {
            throw _err;
        }
        if (_callback) {
            _callback(_err, _text);
        }
    });
};


/**
 * format_path:
 */
exports.format_path_for_display = function (_path) {

    /* Format for display:
        Remove any upward directory traversal, so that unnecssary
        and/or irrelevant information doesn't clutter the output. */

    return _path.replace(/^(?:\.+\/+)+/, '');
}


/**
 * parse_function_args:
 */
exports.parse_function_args = function (_string) {

    var rv = exports.normalize_whitespace(
        _string.replace(comment_regex, '')
    );

    return (rv === '' ? [] : rv.split(/\s*,\s*/))
};


/**
 * trim:
 */
exports.trim = function (_string) {

    return _string.replace(/^\s+/, '').replace(/\s+$/, '');
};


/**
 * unindent:
 */
exports.unindent = function (_string) {

    var match;
    var minimum_indent;

    /* Find minimum indent:
        If this is positive, we will strip this many whitespace characters
        from the beginning of each line in the string, shifting it left. */

    while ((match = indent_regex.exec(_string)) !== null) {

        var indent = match[2].length;

        if (minimum_indent === undefined || indent < minimum_indent) {
            minimum_indent = indent;
        }
    }

    return _string.replace(indent_regex, function (_match, _l, _r) {
        return (_l + _r.substr(minimum_indent));
    });
};


/**
 * normalize_whitespace:
 */
exports.normalize_whitespace = function (_string) {

    return exports.trim(
        _string.replace(/\r\n/g, ' ').replace(/\s+/g, ' ')
    );
};


/**
 * count_lines
 */
exports.count_lines = function (_string) {

    var match;
    var rv = 0;

    while ((match = newline_regex.exec(_string)) !== null) {
        ++rv;
    }

    return rv;
};


/**
 * format_line_number:
 */
exports.format_line_number = function (_i) {

    return (
        '<span class="line">' + _i + '</span>'
    );
};


/**
 * add_line_numbers
 */
exports.add_line_numbers = function (_string, _n) {

    var n = (_n || 1);
    var rv = exports.format_line_number(n);

    rv += _string.replace(newline_regex, function (_match) {
        return '\n' + exports.format_line_number(++n);
    });

    return rv;
};


/**
 * render_html_final:
 *  Given a string `_string` containing (X)HTML markup, apply
 *  any last-minute search/replace modifications deemed necessary,
 *  e.g. replacement of double hypens an em-dash. This function
 *  returns a final version of the string, suitable for output.
 */
exports.render_html_final = function (_string) {

    return _string.replace(mdash_regex, ' &#8212; ');
};


/**
 * process_file_data:
 */
exports.process_file_data = function (_text, _callback) {

    var rv = [];
    var block, match;
    var is_first = true;
    var current_line = 1;
    var namespace_stack = [];

    var directive_types = {
        'arg': { argument: true },
        'name': { identifier: true },
        'function': { stack: true },
        'namespace': { stack: true },
        'interface': { stack: true },
        'class': { stack: true }
    };

    /* Split document:
        A block is a 'special' block comment that begins with two
        asterisks; the block includes this comment plus all of the
        code leading up until the next "special" block comment. */

    block: while ((block = block_regex.exec(_text)) !== null) {

        /* Backreferences for `block_regex`:
            Sequence is `comment-open, comment, comment-close, code`. */

        var match;
        var offset = block.index;
        var saved_namespace = namespace_stack.slice(); /* Clone */

        var r = {
            line: 0, lines: 0,
            directives: {}, namespace: [],
            code: { raw: null, html: null },
            prototype: { name: null, args: null },
            comment: { raw: null, html: null },
            has: { metadata: false, code: false }
        };

        /* First match:
            If the first match occurs at an offset greater than zero,
            count the number of lines in the substring preceeding it. */

        if (is_first) {
            is_first = false;
            current_line += exports.count_lines(_text.substr(0, offset));
        }

        /* Total number of lines in this block:
            This includes both the code and its primary comment. */

        r.comment.lines = (
            exports.count_lines(block[2]) +
                exports.count_lines(block[3])
        );

        r.lines = exports.count_lines(block[0]);
        r.code.lines = r.lines - r.comment.lines;

        r.line = r.comment.line = current_line;
        r.code.line = current_line + r.comment.lines;

        /* Primary comment for this symbol:
            Strip out leading asterisks, and pair with the symbol's code. */

        r.code.raw = exports.trim(
            exports.unindent(block[4])
        );

        r.comment.raw = exports.trim(
            block[2].replace(
                asterisk_regex, function (_match) {
                    return _match[0];
                }
            )
        );

        /* Inspect comment block for special directives:
            These are key/value pairs that begin with `@`; they're used
            to provide additional information to the documentation tool. */

        while ((match = directive_regex.exec(r.comment.raw)) !== null) {

            var key = match[1];
            var value = (match[2] || '');

            r.directives[key] = value;
        }

        /* Modify symbol's primary comment:
            Strip out directives; these shouldn't appear in the output. */

        r.comment.raw = exports.trim(
            r.comment.raw.replace(
                directive_regex, function (_match, _type) {
                    return (
                        directive_types[_type.replace(/^\!/, '')] !== undefined
                            ?  '' : _match
                    );
                }
            )
        );

        /* Render block comment:
            Use markdown to render the current symbol's primary
            comment. Keep the original around in case it's needed. */

        r.comment.html = exports.render_html_final(
            exports.trim(markdown.toHTML(r.comment.raw))
        );

        /* Apply syntax highlighting:
            Keep the original plain-text code around for searching. */

        if (r.code.raw.length <= 0) {
            r.code.raw = r.code.html = false;
        } else {
            r.code.html = exports.add_line_numbers(
                highlight(r.code.raw, false, false, 'javascript'), r.code.line
            );
        }

        /* Find function name for this block:
            The comment portion of the block we just fetched is presumed
            to refer to the assignment that immediately follows it. */

        if ((match = function_regex.exec(r.code.raw)) !== null) {

            var name = match[1];
            var args = exports.parse_function_args(match[2]);

            /* Object property assignment */
            r.prototype = {
                name: name,
                args: (args.length > 0 ? args : false)
            };

        } else if ((match = assign_regex.exec(r.code.raw)) !== null) {

            /* Ordinary single-equals assignment */
            r.prototype = { name: match[1] };
        }

        /* Line number:
            This is the line number on which the current block starts. */

        current_line += r.lines;

        /* Interpret directives:
            Handle stack shift/unshift instructions first. */

        for (var t in directive_types) {

            var type = directive_types[t];

            if (type.identifier) {

                /* Override auto-discovered name */
                r.prototype.name = r.directives[t];

            } else if (type.argument) {

                /* Argument description directive:
                    Add or update an argument descriptor. */

            } else if (type.stack) {

                /* Stack shift? */
                if (r.directives['!' + t] !== undefined) {
                    namespace_stack.pop();
                    continue block;
                }

                /* Stack unshift? */
                if (r.directives[t]) {
                    namespace_stack.push(r.directives[t]);
                }
            }
        }

        /* Utility variables:
            These allow the caller to easily test for existence. */

        r.has.code = (r.code.html.length > 0);
        r.has.comment = (r.comment.html.length > 0);
        r.has.name = (r.prototype.name !== null);
        r.has.namespace = (r.namespace.length > 0);
        r.has.metadata = (r.has.code || r.has.comment);

        /* Push on to result:
            This return structure represents one documentation entry. */

        r.namespace = saved_namespace.slice();
        rv.push(r);

    }

    /* Return all:
        This is an array of documentaion entries. */

    if (_callback) {
        _callback.call(this, null, rv, {
            lines: current_line
        });
    }

    return current_line;
};


/**
 * fatal:
 */
exports.fatal = function (_error) {

    process.stderr.write('fatal: ' + _error.message + '\n');
    process.exit(1);
};


/**
 * main:
 */
exports.main = function (_title, _paths) {

    var rv = [], completions = [];

    /* Process multiple files:
        All output will occur on standard out. */

    _paths.forEach(function (_path, _i) {
        exports.read_file(_path, function (_error, _text) {
            exports.process_file_data(_text, function (_err, _rv, _ext) {

                if (_err) {
                    exports.fatal(_err);
                }

                /* Add to output structure:
                    This outer-most structure in `rv` stores tuples
                    containing path names, each paired with a symbol
                    list.  We need to preserve order explicitly, as the
                    callbacks from `read_file` may run in arbitrary order. */

                var path = exports.format_path_for_display(_path);
                completions.push(_i);

                rv[_i] = {
                    title: _title,
                    symbols: _rv, lines: _ext.lines,
                    path: path, file: fspath.basename(path)
                };

                /* Final iteration:
                    Serialize `rv` to standard output, and finish. */

                if (completions.length === _paths.length) {
                    process.stdout.write(JSON.stringify(rv) + '\n');
                }
            });
        });
    });

    return this;
};


/** @namespace :: */
exports.main.call(
    this, process.argv[2], process.argv.slice(3)
);

