( // Module boilerplate to support browser globals, Node.js and AMD.
  (typeof module === "object" && function (m) { module.exports = m(); }) ||
  (typeof define === "function" && function (m) { define("kernel", m); }) ||
  (function (m) { window.Kernel = m(); })
)(function () {
"use strict";

// types
// - static
// - variable
// - function (always async, can pass in args)
// - block always async, can have extra args and gets

var isNode = (typeof process !== "undefined") && process.versions && process.versions.node;

// Export the public interface
if (isNode) {
  var readFile = require('fs').readFile;
  Kernel.resourceLoader = function (filename, callback) {
    readFile(filename, 'utf8', callback);
  };
} else {
  Kernel.resourceLoader = function (name, callback) {
    var tag = document.querySelector("script[name=" + name + "]");
    if (!tag) {
      callback(new Error("Can't find " + name + " template in current dom"));
      return;
    }
    callback(null, tag.textContent);
  };
}
Kernel.cacheLifetime = 1000;
Kernel.tokenizer = tokenizer;
Kernel.parser = parser;
Kernel.generator = generator;
Kernel.compile = compile;
Kernel.withit = withit;

var variable = /[_$a-z][_$a-z0-8]*(?:\.[_$a-z][_$a-z0-8]*)*(?!\w*:)/gi;
var thisy = /^this(\.|[^_$a-z0-9])?/i;
// Find all variables and prefix with "this"
function withit(value) {
  var state = false;
  var offset = 0;
  return value.replace(variable, function (match, index) {
    // Mini state machine to ignore content inside strings
    for (;offset < index; offset++) {
      var c = value[offset];
      if (state === "'" || state === '"') {
        if (c === state) {
          state = false;
          continue;
        }
        if (c === "\\") {
          offset++;
          continue;
        }
        continue;
      }
      if (c === "'" || c === '"') {
        state = c;
        continue;
      }
    }
    // Ignore strings and thisy matches
    if (state || thisy.test(match)) return match;
    return "this." + match;
  });
}

// Create a new block that inherits from parentScope
function newBlock(parentScope, fn) {
  return function (locals, callback) {
    var scope = Object.create(parentScope);
    for (var key in locals) {
      scope[key] = locals[key];
    }
    return fn.call(scope, callback);
  };
}

// Start an async function and wait for it's response
function run(state, index, fn, args) {
  args.push(callback);
  fn.apply(this, args);
  function callback(err, result) {
    if (state.done) return;
    if (err) {
      state.done = true;
      return state.callback(err);
    }
    state.parts[index] = result;
    if (--state.left) return;
    state.callback(null, state.parts.join(""));
  }
}
// The state of a template instance
function State(size, left, callback) {
  this.parts = new Array(size);
  this.left = left;
  this.done = false;
  this.callback = callback;
}

// Generate the lib string for templates that have async parts.
var lib = State + "\n\n" + run + "\n";
var libBlock = newBlock + "\n";

// Regex to matches all template tags. Allows one level of parens within the arguments
// Also allows basic expressions in double {{tags}}
var tagRegex = /(\{[#\/]?([a-z$_][a-z0-9$_]*(\.[a-z$_][a-z0-9$_]*)*)(\([^)]*(\([^)]*\)[^)]*)*\))?\}|\{\{[^}]*(\{[^}]*\}[^}]*)*\}\})/ig;

// A caching and batching wrapper around compile.
var templateCache = {}, templateBatch = {};
function Kernel(filename, callback) {

  // Check arguments
  if (typeof filename !== 'string') { throw new Error("First argument to Kernel must be a filename"); }
  if (typeof callback !== 'function') { throw new Error("Second argument to Kernel must be a function"); }

  // Check to see if the cache is still hot and reuse the template if so.
  if (templateCache.hasOwnProperty(filename)) {
    callback(null, templateCache[filename]);
    return;
  }

  // Check if there is still a batch in progress and join it.
  if (templateBatch.hasOwnProperty(filename)) {
    templateBatch[filename].push(callback);
    return;
  }

  // Start a new batch, call the real function, and report.
  var batch = templateBatch[filename] = [callback];
  compileFile(filename, function (err, template) {

    // We don't want to cache in case of errors
    if (!err && Kernel.cacheLifetime) {
      templateCache[filename] = template;
      // Make sure cached values expire eventually.
      setTimeout(function () {
        delete templateCache[filename];
      }, Kernel.cacheLifetime);
    }

    // The batch is complete, clear it out and execute the callbacks.
    delete templateBatch[filename];
    for (var i = 0, l = batch.length; i < l; i++) {
      var callback = batch[i];
      callback(err, template);
    }

  });

}

// Load a file from disk and compile into executable template
function compileFile(filename, callback) {
  Kernel.resourceLoader(filename, function (err, source) {
    if (err) { callback(err); return; }
    var template;
    try {
      template = compile(source, filename);
    } catch (err) {
      callback(err); return;
    }
    callback(null, template);
  });
}

function compile(source, filename) {
  var blocks = [];
  generator(parser(tokenizer(source), source, filename), blocks);
  var code = blocks.map(function (block, i) {
    return "function block_" + i + "(callback) {\n" +
      block + "\n}\n";
  }).join("\n");
  if (blocks.needsLib) {
    code += "\n" + lib;
  }
  if (blocks.needsBlock) {
    code += "\n" + libBlock;
  }
  return new Function("locals", "callback", '"use strict"\n\n' +
    "block_0.call(locals, callback);\n\n" + code);
}

function plain(token) {
  if (typeof token === "string") { return JSON.stringify(token); }
  return "(" + withit(token.name) + ")";
}

function generator(tokens, blocks) {
  // Filter out empty tokens
  tokens = tokens.filter(function (token) {
    return !Array.isArray(token) || token[0];
  });

  var length = tokens.length;

  // Shortcut for static sections
  if (tokens.length === 1 && Array.isArray(tokens[0])) {
    return blocks.push("  callback(null, " + tokens[0].map(plain).join(" + ") + ");");
  }
  blocks.needsLib = true;

  var left = 0;
  var blockIndex = blocks.length;
  blocks.push(null);
  var sync = [];
  var async = [];
  for (var i = 0; i < length; i++) {
    var token = tokens[i];
    if (Array.isArray(token)) {
      sync.push("state.parts[" + i + "] = " + token.map(plain).join(" + ") + ";");
      continue;
    }
    if (token.contents || token.hasOwnProperty('args')) {
      left++;
      var args = [];
      if (token.hasOwnProperty("args")) args.push(withit(token.args));
      if (token.contents) {
        blocks.needsBlock = true;
        var name = "block_" + blocks.length;
        generator(token.contents, blocks);
        args.push("newBlock(this, " + name + ")");
      }
      async.push("run(state, " + i + ", " + withit(token.name) + ", [" + args.join(", ") + "]);");
    }
  }
  blocks[blockIndex] =
    "  var state = new State(" + length + ", " + left + ", callback);\n  " +
    sync.concat(async).join("\n  ");
}

// Helper to show nicly formatter error messages with full file position.
function getPosition(source, offset, filename) {
  var line = 0;
  var position = 0;
  var last = 0;
  for (position = 0; position >= 0 && position < offset; position = source.indexOf("\n", position + 1)) {
    line++;
    last = position;
  }
  return "(" + filename + ":" + line + ":" + (offset - last) + ")";
}

function stringify(source, token) {
  return source.substr(token.start, token.end-token.start);
}

function parser(tokens, source, filename) {
  var parts = [];
  var openStack = [];
  var i, l;
  var simple;
  for (i = 0, l = tokens.length; i < l; i++) {
    var token = tokens[i];
    if (typeof token === "string") {
      if (token[0] === "\n") token = token.substr(1);
      if (simple) simple.push(token);
      else parts.push(simple = [token]);
    } else if (token.open) {
      simple = false;
      token.parent = parts;
      parts.push(token);
      parts = token.contents = [];
      openStack.push(token);
    } else if (token.close) {
      simple = false;
      var top = openStack.pop();
      if (top.name !== token.name) {
        throw new Error("Expected closer for " + stringify(source, top) + " but found " + stringify(source, token) + " " + getPosition(source, token.start, filename));
      }
      parts = top.parent;
      delete top.parent;
      delete top.open;
    } else {
      if (token.hasOwnProperty('args')) {
        simple = false;
        parts.push(token);
      } else {
        if (simple) simple.push(token);
        else parts.push(simple = [token]);
      }
    }
  }
  if (openStack.length) {
    var top = openStack.pop();
    throw new Error("Expected closer for " + stringify(source, top) + " but reached end " + getPosition(source, top.end, filename));
  }
  return parts;
}

// This lexes a source string into discrete tokens for easy parsing.
function tokenizer(source) {
  var parts = [];
  var position = 0;
  tagRegex.index = 0;
  var match;
  while (match = tagRegex.exec(source)) {
    var index = match.index;
    match = match[0];
    if (index > position) { // Raw text was before this tag
      parts.push(source.substr(position, index - position));
    }
    position = index + match.length;

    // Create a token and tag the position in the source file for error reporting.
    var obj = {start: index, end: position};

    if (match[1] === "{") { // Raw expression
      obj.name = match.substr(2, match.length - 4);
    } else if (match[1] === "#") { // Open tag
      obj.open = true;
      if (match[match.length - 2] === ")") { // With arguments
        var i = match.indexOf("(");
        obj.name = match.substr(2, i - 2);
        obj.args = match.substr(i + 1, match.length - i - 3);
      } else { // Without arguments
        obj.name = match.substr(2, match.length - 3);
      }
    } else if (match[1] === "/") { // Close tag
      obj.close = true;
      obj.name = match.substr(2, match.length - 3);
    } else { // Normal tag
      if (match[match.length - 2] === ")") { // With arguments
        var i = match.indexOf("(");
        obj.name = match.substr(1, i - 1);
        obj.args = match.substr(i + 1, match.length - i - 3);
      } else { // Without arguments
        obj.name = match.substr(1, match.length - 2);
      }
    }
    parts.push(obj);
    tagRegex.lastIndex = position;
  }
  if (source.length > position) { // There is raw text left over
    parts.push(source.substr(position));
  }
  return parts;
}

return Kernel;

});
