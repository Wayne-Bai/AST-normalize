! ✖ / env;
node;
function()  {
   "use strict";
   var vm = require("vm");
   var _ = require("./lodash.js"), minify = require("./build/minify.js"), util = require("./build/util.js");
   var fs = util.fs, path = util.path;
   var cwd = process.cwd();
   var arrayRef = Array.prototype;
   var push = arrayRef.push;
   var multilineComment = "(?:\n +/\*[^*]*\*+(?:[^/][^*]*\*+)*/)?\n";
   var reNode = RegExp("(?:^|" + path.sepEscaped + ")node(?:\.exe)?$");
   var slice = arrayRef.slice;
   var stdout = process.stdout;
   var aliasToRealMap =  {
      all:"every", 
      any:"some", 
      collect:"map", 
      detect:"find", 
      drop:"rest", 
      each:"forEach", 
      extend:"assign", 
      findWhere:"find", 
      foldl:"reduce", 
      foldr:"reduceRight", 
      head:"first", 
      include:"contains", 
      inject:"reduce", 
      methods:"functions", 
      object:"zipObject", 
      select:"filter", 
      tail:"rest", 
      take:"first", 
      unique:"uniq"   }
;
   var realToAliasMap =  {
      assign:["extend"], 
      contains:["include"], 
      every:["all"], 
      filter:["select"], 
      find:["detect", "findWhere"], 
      first:["head", "take"], 
      forEach:["each"], 
      functions:["methods"], 
      map:["collect"], 
      reduce:["foldl", "inject"], 
      reduceRight:["foldr"], 
      rest:["drop", "tail"], 
      some:["any"], 
      uniq:["unique"], 
      zipObject:["object"]   }
;
   var dependencyMap =  {
      after:[], 
      assign:["createIterator", "isArguments", "keys"], 
      at:["isString"], 
      bind:["createBound"], 
      bindAll:["bind", "functions"], 
      bindKey:["createBound"], 
      clone:["assign", "forEach", "forOwn", "getArray", "isArray", "isObject", "isNode", "releaseArray", "slice"], 
      cloneDeep:["clone"], 
      compact:[], 
      compose:[], 
      contains:["basicEach", "getIndexOf", "isString"], 
      countBy:["createCallback", "forEach"], 
      createCallback:["identity", "isEqual", "keys"], 
      debounce:["isObject"], 
      defaults:["createIterator", "isArguments", "keys"], 
      defer:["bind"], 
      delay:[], 
      difference:["cacheIndexOf", "createCache", "getIndexOf", "releaseObject"], 
      escape:["escapeHtmlChar"], 
      every:["basicEach", "createCallback", "isArray"], 
      filter:["basicEach", "createCallback", "isArray"], 
      find:["basicEach", "createCallback", "isArray"], 
      findIndex:["createCallback"], 
      findKey:["createCallback", "forOwn"], 
      first:["slice"], 
      flatten:["isArray", "overloadWrapper"], 
      forEach:["basicEach", "createCallback", "isArguments", "isArray", "isString", "keys"], 
      forIn:["createCallback", "createIterator", "isArguments"], 
      forOwn:["createCallback", "createIterator", "isArguments", "keys"], 
      functions:["forIn", "isFunction"], 
      groupBy:["createCallback", "forEach"], 
      has:[], 
      identity:[], 
      indexOf:["basicIndexOf", "sortedIndex"], 
      initial:["slice"], 
      intersection:["cacheIndexOf", "createCache", "getArray", "getIndexOf", "releaseArray", "releaseObject"], 
      invert:["keys"], 
      invoke:["forEach"], 
      isArguments:[], 
      isArray:[], 
      isBoolean:[], 
      isDate:[], 
      isElement:[], 
      isEmpty:["forOwn", "isArguments", "isFunction"], 
      isEqual:["forIn", "getArray", "isArguments", "isFunction", "isNode", "releaseArray"], 
      isFinite:[], 
      isFunction:[], 
      isNaN:["isNumber"], 
      isNull:[], 
      isNumber:[], 
      isObject:[], 
      isPlainObject:["isArguments", "shimIsPlainObject"], 
      isRegExp:[], 
      isString:[], 
      isUndefined:[], 
      keys:["isArguments", "isObject", "shimKeys"], 
      last:["slice"], 
      lastIndexOf:[], 
      map:["basicEach", "createCallback", "isArray"], 
      max:["basicEach", "charAtCallback", "createCallback", "isArray", "isString"], 
      memoize:[], 
      merge:["forEach", "forOwn", "getArray", "isArray", "isObject", "isPlainObject", "releaseArray"], 
      min:["basicEach", "charAtCallback", "createCallback", "isArray", "isString"], 
      mixin:["forEach", "functions"], 
      noConflict:[], 
      omit:["forIn", "getIndexOf"], 
      once:[], 
      pairs:["keys"], 
      parseInt:["isString"], 
      partial:["createBound"], 
      partialRight:["createBound"], 
      pick:["forIn", "isObject"], 
      pluck:["map"], 
      random:[], 
      range:[], 
      reduce:["basicEach", "createCallback", "isArray"], 
      reduceRight:["createCallback", "forEach", "isString", "keys"], 
      reject:["createCallback", "filter"], 
      rest:["slice"], 
      result:["isFunction"], 
      runInContext:["defaults", "pick"], 
      shuffle:["forEach"], 
      size:["keys"], 
      some:["basicEach", "createCallback", "isArray"], 
      sortBy:["compareAscending", "createCallback", "forEach", "getObject", "releaseObject"], 
      sortedIndex:["createCallback", "identity"], 
      tap:["value"], 
      template:["defaults", "escape", "escapeStringChar", "keys", "values"], 
      throttle:["debounce", "getObject", "isObject", "releaseObject"], 
      times:["createCallback"], 
      toArray:["isString", "slice", "values"], 
      transform:["createCallback", "createObject", "forOwn", "isArray"], 
      unescape:["unescapeHtmlChar"], 
      union:["isArray", "uniq"], 
      uniq:["cacheIndexOf", "createCache", "getArray", "getIndexOf", "overloadWrapper", "releaseArray", "releaseObject"], 
      uniqueId:[], 
      unzip:["max", "pluck"], 
      value:["basicEach", "forOwn", "isArray", "lodashWrapper"], 
      values:["keys"], 
      where:["filter"], 
      without:["difference"], 
      wrap:[], 
      zip:["unzip"], 
      zipObject:[], 
      basicEach:["createIterator", "isArguments", "isArray", "isString", "keys"], 
      basicIndexOf:[], 
      cacheIndexOf:["basicIndexOf"], 
      cachePush:[], 
      charAtCallback:[], 
      compareAscending:[], 
      createBound:["createObject", "isFunction", "isObject"], 
      createCache:["cachePush", "getObject", "releaseObject"], 
      createIterator:["getObject", "iteratorTemplate", "releaseObject"], 
      createObject:["isObject", "noop"], 
      escapeHtmlChar:[], 
      escapeStringChar:[], 
      getArray:[], 
      getIndexOf:["basicIndexOf", "indexOf"], 
      getObject:[], 
      iteratorTemplate:[], 
      isNode:[], 
      lodashWrapper:[], 
      noop:[], 
      overloadWrapper:["createCallback"], 
      releaseArray:[], 
      releaseObject:[], 
      shimIsPlainObject:["forIn", "isArguments", "isFunction", "isNode"], 
      shimKeys:["createIterator", "isArguments"], 
      slice:[], 
      unescapeHtmlChar:[], 
      chain:["value"], 
      findWhere:["where"]   }
;
   var iteratorOptions = ["args", "array", "bottom", "firstArg", "init", "loop", "shadowedProps", "support", "top", "useHas", "useKeys"];
   var allMethods = _.keys(dependencyMap);
   var lodashMethods = _.without(allMethods, "findWhere");
   var backboneDependencies = ["bind", "bindAll", "chain", "clone", "contains", "countBy", "defaults", "escape", "every", "extend", "filter", "find", "first", "forEach", "groupBy", "has", "indexOf", "initial", "invert", "invoke", "isArray", "isEmpty", "isEqual", "isFunction", "isObject", "isRegExp", "isString", "keys", "last", "lastIndexOf", "map", "max", "min", "mixin", "omit", "once", "pairs", "pick", "reduce", "reduceRight", "reject", "rest", "result", "shuffle", "size", "some", "sortBy", "sortedIndex", "toArray", "uniqueId", "value", "values", "without"];
   var lodashOnlyMethods = ["at", "bindKey", "cloneDeep", "createCallback", "findIndex", "findKey", "forIn", "forOwn", "isPlainObject", "merge", "parseInt", "partialRight", "runInContext", "transform", "unzip"];
   var exportsAll = ["amd", "commonjs", "global", "node"];
   var methodCategories = ["Arrays", "Chaining", "Collections", "Functions", "Objects", "Utilities"];
   var privateMethods = ["basicEach", "basicIndex", "cacheIndexOf", "cachePush", "charAtCallback", "compareAscending", "createBound", "createCache", "createIterator", "escapeHtmlChar", "escapeStringChar", "getArray", "getObject", "isNode", "iteratorTemplate", "lodashWrapper", "overloadWrapper", "releaseArray", "releaseObject", "shimIsPlainObject", "shimKeys", "slice", "unescapeHtmlChar"];
   var underscoreMethods = _.without.apply(_, [allMethods].concat(lodashOnlyMethods, privateMethods));
   function addChainMethods(source)  {
      source = source.replace(matchFunction(source, "tap"), function(match)  {
            var indent = getIndent(match);
            return match && indent + ["", "/**", " * Creates a `lodash` object that wraps the given `value`.", " *", " * @static", " * @memberOf _", " * @category Chaining", " * @param {Mixed} value The value to wrap.", " * @returns {Object} Returns the wrapper object.", " * @example", " *", " * var stooges = [", " *   { 'name': 'moe', 'age': 40 },", " *   { 'name': 'larry', 'age': 50 },", " *   { 'name': 'curly', 'age': 60 }", " * ];", " *", " * var youngest = _.chain(stooges)", " *     .sortBy(function(stooge) { return stooge.age; })", " *     .map(function(stooge) { return stooge.name + ' is ' + stooge.age; })", " *     .first();", " * // => 'moe is 40'", " */", "function chain(value) {", "  value = new lodashWrapper(value);", "  value.__chain__ = true;", "  return value;", "}", "", match].join("
" + indent);
         }
      );
      source = source.replace(matchFunction(source, "wrapperToString"), function(match)  {
            var indent = getIndent(match);
            return match && indent + ["", "/**", " * Enables method chaining on the wrapper object.", " *", " * @name chain", " * @memberOf _", " * @category Chaining", " * @returns {Mixed} Returns the wrapper object.", " * @example", " *", " * var sum = _([1, 2, 3])", " *     .chain()", " *     .reduce(function(sum, num) { return sum + num; })", " *     .value()", " * // => 6`", " */", "function wrapperChain() {", "  this.__chain__ = true;", "  return this;", "}", "", match].join("
" + indent);
         }
      );
      source = source.replace(/^ *lodash\.prototype\.(?:toString|valueOf) *=.+\n/gm, "");
      source = source.replace(/(?:\s*\/\/.*)*\n( *)forOwn\(lodash, *function\(func, *methodName\)[\s\S]+?\n\1}.+/g, "");
      source = replaceFunction(source, "mixin", ["function mixin(object) {", "  forEach(functions(object), function(methodName) {", "    var func = lodash[methodName] = object[methodName];", "", "    lodash.prototype[methodName] = function() {", "      var args = [this.__wrapped__];", "      push.apply(args, arguments);", "", "      var result = func.apply(lodash, args);", "      if (this.__chain__) {", "        result = new lodashWrapper(result);", "        result.__chain__ = true;", "      }", "      return result;", "    };", "  });", "}"].join("
"));
      source = source.replace(/^(?:(?: *\/\/.*\n)*(?: *if *\(.+\n)?( *)(basicEach|forEach)\(\['[\s\S]+?\n\1}\);(?:\n *})?\n+)+/m, function(match, indent, funcName)  {
            return indent + ["// add `Array` mutator functions to the wrapper", funcName + "(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {", "  var func = arrayRef[methodName];", "  lodash.prototype[methodName] = function() {", "    var value = this.__wrapped__;", "    func.apply(value, arguments);", "", "    // avoid array-like object bugs with `Array#shift` and `Array#splice`", "    // in Firefox < 10 and IE < 9", "    if (!support.spliceObjects && value.length === 0) {", "      delete value[0];", "    }", "    return this;", "  };", "});", "", "// add `Array` accessor functions to the wrapper", funcName + "(['concat', 'join', 'slice'], function(methodName) {", "  var func = arrayRef[methodName];", "  lodash.prototype[methodName] = function() {", "    var value = this.__wrapped__,", "        result = func.apply(value, arguments);", "", "    if (this.__chain__) {", "      result = new lodashWrapper(result);", "      result.__chain__ = true;", "    }", "    return result;", "  };", "});", ""].join("
" + indent);
         }
      );
      source = source.replace(getMethodAssignments(source), function(match)  {
            return match.replace(/^( *lodash\.chain *= *)[\s\S]+?(?=;\n)/m, "$1chain");
         }
      );
      source = source.replace(/(?:\s*\/\/.*)*\n( *)mixin\(lodash\).+/, "");
      source = source.replace(getMethodAssignments(source), function(match)  {
            var indent = /^ *(?=lodash\.)/m.exec(match)[0];
            return match + ["", "", "// add functions to `lodash.prototype`", "mixin(lodash);"].join("
" + indent);
         }
      );
      source = source.replace(/^ *lodash\.prototype\.chain *=[\s\S]+?;\n/m, "").replace(/^( *)lodash\.prototype\.value *=/m, "$1lodash.prototype.chain = wrapperChain;
$&");
      return source;
   }
;
   function addCommandsToHeader(source, commands)  {
      return source.replace(/(\/\**\n)( \*)( *@license[\s*]+)( *Lo-Dash [\w.-]+)(.*)/, function()  {
            if (reNode.test(commands[0]))  {
               commands.splice(0, 2);
            }
            commands = _.map(commands, function(command)  {
                  var separator = command.match(/[= ]/) || [""][0];
                  if (separator)  {
                     var pair = command.split(separator);
                     command = pair[0] + separator + """ + pair[1] + """;
                  }
                  command = command.replace(/\n/g, "\n").replace(/\r/g, "\r").replace(/\*\//g, "*\/");
                  return command;
               }
            );
            var parts = slice.call(arguments, 1);
            return parts[0] + parts[1] + parts[2] + parts[3] + " (Custom Build)" + parts[4] + "
" + parts[1] + " Build: `lodash " + commands.join(" ") + "`";
         }
      );
   }
;
   function buildTemplate(pattern, options)  {
      pattern || pattern = path.join(cwd, "*.jst");
      var directory = path.dirname(pattern);
      var source = [";(function(window) {", "  var undefined;", "", "  var objectTypes = {", "    'function': true,", "    'object': true", "  };", "", "  var freeExports = objectTypes[typeof exports] && typeof require == 'function' && exports;", "", "  var freeModule = objectTypes[typeof module] && module && module.exports == freeExports && module;", "", "  var freeGlobal = objectTypes[typeof global] && global;", "  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {", "    window = freeGlobal;", "  }", "", "  var templates = {},", "      _ = window._;", ""];
      pattern = RegExp(path.basename(pattern).replace(/[.+?^=!:${}()|[\]\/\\]/g, "\$&").replace(/\*/g, ".*?") + "$");
      fs.readdirSync(directory).forEach(function(filename)  {
            var filePath = path.join(directory, filename);
            if (pattern.test(filename))  {
               var text = fs.readFileSync(filePath, "utf8"), precompiled = cleanupCompiled(getFunctionSource(_.template(text, null, options))), prop = filename.replace(/\..*$/, "");
               source.push("  templates['" + prop.replace(/['\n\r\t]/g, "\$&") + "'] = " + precompiled + ";", "");
            }
         }
      );
      source.push("  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {", "    define(['" + options.moduleId + "'], function(lodash) {", "      _ = lodash;", "      lodash.templates = lodash.extend(lodash.templates || {}, templates);", "    });", "  } else if (freeExports && !freeExports.nodeType) {", "    _ = require('" + options.moduleId + "');", "    if (freeModule) {", "      (freeModule.exports = templates).templates = templates;", "    } else {", "      freeExports.templates = templates;", "    }", "  } else if (_) {", "    _.templates = _.extend(_.templates || {}, templates);", "  }", "}(this));");
      return source.join("
");
   }
;
   function capitalize(string)  {
      return string[0].toUpperCase() + string.slice(1);
   }
;
   function cleanupCompiled(source)  {
      return source.replace(/([{}]) *;/g, "$1");
   }
;
   function cleanupSource(source)  {
      return source.replace(/(?:(?:\s*\/\/.*)*\s*lodash\._[^=]+=.+\n)+/g, "
").replace(/^ *\n/gm, "
").replace(/^ *;\n/gm, "").replace(/\n{3,}/g, "

").replace(/(?:\s*\/\*-+\*\/\s*){2,}/g, function(separators)  {
            return separators.match(/^\s*/)[0] + separators.slice(separators.lastIndexOf("/*"));
         }
      );
   }
;
   function displayHelp()  {
      console.log(["", "  Commands:", "", "    lodash backbone      Build with only methods required by Backbone", "    lodash legacy        Build tailored for older environments without ES5 support", "    lodash modern        Build tailored for newer environments with ES5 support", "    lodash mobile        Build without method compilation and most bug fixes for old browsers", "    lodash strict        Build with `_.assign`, `_.bindAll`, & `_.defaults` in strict mode", "    lodash underscore    Build tailored for projects already using Underscore", "    lodash include=...   Comma separated method/category names to include in the build", "    lodash minus=...     Comma separated method/category names to remove from those included in the build", "    lodash plus=...      Comma separated method/category names to add to those included in the build", "    lodash category=...  Comma separated categories of methods to include in the build (case-insensitive)", "                         (i.e. “arrays”, “chaining”, “collections”, “functions”, “objects”, and “utilities”)", "    lodash exports=...   Comma separated names of ways to export the `lodash` function", "                         (i.e. “amd”, “commonjs”, “global”, “node”, and “none”)", "    lodash iife=...      Code to replace the immediately-invoked function expression that wraps Lo-Dash", "                         (e.g. `lodash iife="!function(window){%output%}(this)"`)", "", "    lodash template=...  File path pattern used to match template files to precompile", "                         (e.g. `lodash template=./*.jst`)", "    lodash settings=...  Template settings used when precompiling templates", "                         (e.g. `lodash settings="{interpolate:/{{([\s\S]+?)}}/g}"`)", "    lodash moduleId=...  The AMD module ID of Lo-Dash, which defaults to “lodash”, used by precompiled templates", "", "    All arguments, except `legacy` with `mobile`, `modern`, or `underscore`, may be combined.", "    Unless specified by `-o` or `--output`, all files created are saved to the current working directory.", "", "  Options:", "", "    -c, --stdout      Write output to standard output", "    -d, --debug       Write only the non-minified development output", "    -h, --help        Display help information", "    -m, --minify      Write only the minified production output", "    -o, --output      Write output to a given path/filename", "    -p, --source-map  Generate a source map for the minified output, using an optional source map URL", "    -s, --silent      Skip status updates normally logged to the console", "    -V, --version     Output current version of Lo-Dash", ""].join("
"));
   }
;
   function getAliases(methodName)  {
      return realToAliasMap[methodName] || [].filter(function(methodName)  {
            return ! dependencyMap[methodName];
         }
      );
   }
;
   function getCategory(source, methodName)  {
      var result = /@category +(\w+)/.exec(matchFunction(source, methodName));
      if (result)  {
         return result[1];
      }
      return methodName == "chain" ? "Chaining" : "";
   }
;
   function getCategoryDependencies(source, category)  {
      var methods = _.uniq(getMethodsByCategory(source, category).reduce(function(result, methodName)  {
               push.apply(result, getDependencies(methodName));
               return result;
            }, 
            []));
      var categories = _.uniq(methods.map(function(methodName)  {
               return getCategory(source, methodName);
            }
         ));
      return categories.filter(function(other)  {
            return other != category;
         }
      );
   }
;
   function getDependants(methodName)  {
      var methodNames = _.isArray(methodName) ? methodName : [methodName];
      return _.reduce(dependencyMap, function(result, dependencies, otherName)  {
            if (_.some(methodNames, function(methodName)  {
                  return _.contains(dependencies, methodName);
               }
            ))  {
               result.push(otherName);
            }
            return result;
         }, 
         []);
   }
;
   function getDependencies(methodName, stack)  {
      var dependencies = _.isArray(methodName) ? methodName : dependencyMap[methodName];
      if (! dependencies)  {
         return [];
      }
      stack || stack = [];
      return _.uniq(dependencies.reduce(function(result, otherName)  {
               if (! _.contains(stack, otherName))  {
                  stack.push(otherName);
                  result.push.apply(result, getDependencies(otherName, stack).concat(otherName));
               }
               return result;
            }, 
            []));
   }
;
   function getFunctionSource(func, indent)  {
      var source = func.source || func + "";
      if (indent == null)  {
         indent = "  ";
      }
      return source.replace(/\n(?:.*)/g, function(match, index)  {
            match = match.slice(1);
            return "
" + indent + match == "}" && ! _.contains(source, "}", index + 2) ? "" : "  " + match;
         }
      );
   }
;
   function getIndent(func)  {
      return /^ *(?=\S)/m.exec(func.source || func)[0];
   }
;
   function getIsArgumentsFallback(source)  {
      return source.match(/(?:\s*\/\/.*)*\n( *)if *\((?:!support\.argsClass|!isArguments)[\s\S]+?\n *};\n\1}/) || [""][0];
   }
;
   function getIsArrayFallback(source)  {
      return matchFunction(source, "isArray").replace(/^[\s\S]+?=\s*nativeIsArray\b/, "").replace(/[;\s]+$/, "");
   }
;
   function getIsFunctionFallback(source)  {
      return source.match(/(?:\s*\/\/.*)*\n( *)if *\(isFunction\(\/x\/[\s\S]+?\n *};\n\1}/) || [""][0];
   }
;
   function getCreateObjectFallback(source)  {
      return source.match(/(?:\s*\/\/.*)*\n( *)if *\((?:!nativeCreate)[\s\S]+?\n *};\n\1}/) || [""][0];
   }
;
   function getIteratorTemplate(source)  {
      return source.match(/^( *)var iteratorTemplate *= *[\s\S]+?\n\1.+?;\n/m) || [""][0];
   }
;
   function getMethodAssignments(source)  {
      return source.match(/\/\*-+\*\/\n(?:\s*\/\/.*)*\s*lodash\.\w+ *=[\s\S]+?lodash\.VERSION *=.+/) || [""][0];
   }
;
   function getMethodsByCategory(source, category)  {
      return allMethods.filter(function(methodName)  {
            return getCategory(source, methodName) == category;
         }
      );
   }
;
   function getRealName(methodName)  {
      return ! dependencyMap[methodName] && aliasToRealMap[methodName] || methodName;
   }
;
   function isRemoved(source)  {
      return slice.call(arguments, 1).every(function(funcName)  {
            return ! matchFunction(source, funcName) || RegExp("^ *lodash\.prototype\." + funcName + " *=[\s\S]+?;\n", "m").test(source);
         }
      );
   }
;
   function matchFunction(source, funcName)  {
      var result = source.match(RegExp(multilineComment + "( *)var " + funcName + " *=.*?(?:createIterator\([\s\S]+?|overloadWrapper\([\s\S]+?\n\1})\);\n"));
      result || result = source.match(RegExp(multilineComment + "( *)(?:" + "function " + funcName + "\b[\s\S]+?\n\1}|" + "var " + funcName + " *=.*?function[\s\S]+?\n\1}(?:\(\)\))?;" + ")\n"));
      result || result = source.match(RegExp(multilineComment + "( *)var " + funcName + " *=.+?;\n"));
      return /@type +Function|\b(?:function\s*\w*|createIterator|overloadWrapper)\(/.test(result) ? result[0] : "";
   }
;
   function optionToArray(value)  {
      return _.compact(_.isArray(value) ? value : value.match(/\w+=(.*)$/)[1].split(/, */));
   }
;
   function optionToMethodsArray(source, value)  {
      var methodNames = optionToArray(value);
      methodNames = methodNames.map(getRealName);
      return _.uniq(_.intersection(allMethods, methodNames));
   }
;
   function removeFromCreateIterator(source, identifier)  {
      var snippet = matchFunction(source, "createIterator");
      if (! snippet)  {
         return source;
      }
      var modified = snippet.replace(RegExp("^(?: *\/\/.*\n)* *(\w+)\." + identifier + " *= *(.+\n+)", "m"), function(match, object, postlude)  {
            return RegExp("\b" + object + "\.").test(postlude) ? postlude : "";
         }
      );
      source = source.replace(snippet, function()  {
            return modified;
         }
      );
      snippet = modified.match(/Function\([\s\S]+$/)[0];
      source = source.replace(snippet, function(match)  {
            return match.replace(RegExp("\b" + identifier + "\b,? *", "g"), "").replace(/, *(?=',)/, "").replace(/,(?=\s*\))/, "");
         }
      );
      return removeFromGetObject(source, identifier);
   }
;
   function removeFromGetObject(source, identifier)  {
      return source.replace(matchFunction(source, "getObject"), function(match)  {
            return match.replace(RegExp("^(?: *\/\/.*\n)* *'" + identifier + "':.+\n+", "m"), "").replace(/,(?=\s*})/, "");
         }
      );
   }
;
   function removeFromReleaseObject(source, identifier)  {
      return source.replace(matchFunction(source, "releaseObject"), function(match)  {
            return match.replace(RegExp("(?:(^ *)| *)(\w+)\." + identifier + " *= *(.+\n+)", "m"), function(match, indent, object, postlude)  {
                  return indent || "" + RegExp("\b" + object + "\.").test(postlude) ? postlude : "";
               }
            );
         }
      );
   }
;
   function removeFunction(source, funcName)  {
      var snippet;
      if (funcName == "runInContext")  {
         source = removeRunInContext(source, funcName);
      }
       else if (snippet = matchFunction(source, funcName))  {
         source = source.replace(snippet, "");
      }
      source = source.replace(RegExp("^ *lodash\.prototype\." + funcName + " *=[\s\S]+?;\n", "m"), "");
      source = source.replace(RegExp("^(?: *//.*\s*)* *lodash\._" + funcName + " *=[\s\S]+?;\n", "m"), "");
      snippet = getMethodAssignments(source);
      var modified = getAliases(funcName).concat(funcName).reduce(function(result, otherName)  {
            return result.replace(RegExp("^(?: *//.*\s*)* *lodash\." + otherName + " *=[\s\S]+?;\n", "m"), "");
         }, 
         snippet);
      source = source.replace(snippet, function()  {
            return modified;
         }
      );
      return removeFromCreateIterator(source, funcName);
   }
;
   function removeIsArgumentsFallback(source)  {
      return source.replace(getIsArgumentsFallback(source), "");
   }
;
   function removeIsArrayFallback(source)  {
      return source.replace(getIsArrayFallback(source), "");
   }
;
   function removeIsFunctionFallback(source)  {
      return source.replace(getIsFunctionFallback(source), "");
   }
;
   function removeCreateObjectFallback(source)  {
      return source.replace(getCreateObjectFallback(source), "");
   }
;
   function removeBindingOptimization(source)  {
      source = removeVar(source, "fnToString");
      source = removeVar(source, "reThis");
      source = source.replace(matchFunction(source, "createCallback"), function(match)  {
            return match.replace(/\s*\|\|\s*\(reThis[\s\S]+?\)\)\)/, "");
         }
      );
      return source;
   }
;
   function removeKeysOptimization(source)  {
      source = removeFromCreateIterator(source, "useKeys");
      source = source.replace(getIteratorTemplate(source), function(match)  {
            return match.replace(/^(?: *\/\/.*\n)* *["']( *)<% *if *\(useHas *&& *useKeys[\s\S]+?["']\1<% *} *else *{ *%>.+\n([\s\S]+?) *["']\1<% *} *%>.+/m, "'\n' +
$2");
         }
      );
      return source;
   }
;
   function removeLodashWrapper(source)  {
      source = removeFunction(source, "lodashWrapper");
      source = source.replace(/(?:\s*\/\/.*)*\n *lodashWrapper\.prototype *=.+/, "");
      source = source.replace(/\bnew lodashWrapper\b/g, "new lodash");
      return source;
   }
;
   function removeSupportArgsObject(source)  {
      source = removeSupportProp(source, "argsObject");
      source = source.replace(matchFunction(source, "isEqual"), function(match)  {
            return match.replace(/!support.\argsObject[^:]+:\s*/g, "");
         }
      );
      return source;
   }
;
   function removeSupportArgsClass(source)  {
      source = removeSupportProp(source, "argsClass");
      source = source.replace(getIsArgumentsFallback(source), function(match)  {
            return match.replace(/!support\.argsClass/g, "!isArguments(arguments)");
         }
      );
      source = source.replace(matchFunction(source, "isEmpty"), function(match)  {
            return match.replace(/\s*\(support\.argsClass\s*\?([^:]+):.+?\)\)/g, "$1");
         }
      );
      _.each(["shimIsPlainObject", "isPlainObject"], function(methodName)  {
            source = source.replace(matchFunction(source, methodName), function(match)  {
                  return match.replace(/\s*\|\|\s*\(!support\.argsClass[\s\S]+?\)\)/, "");
               }
            );
         }
      );
      return source;
   }
;
   function removeSupportEnumErrorProps(source)  {
      source = removeSupportProp(source, "enumErrorProps");
      source = source.replace(getIteratorTemplate(source), function(match)  {
            return match.replace(/(?: *\/\/.*\n)* *["'] *(?:<% *)?if *\(support\.enumErrorProps *(?:&&|\))(.+?}["']|[\s\S]+?<% *} *(?:%>|["'])).+/g, "").replace(/support\.enumErrorProps\s*\|\|\s*/g, "");
         }
      );
      return source;
   }
;
   function removeSupportEnumPrototypes(source)  {
      source = removeSupportProp(source, "enumPrototypes");
      source = source.replace(matchFunction(source, "keys"), function(match)  {
            return match.replace(/\(support\.enumPrototypes[^)]+\)(?:\s*\|\|\s*)?/, "").replace(/\s*if *\(\s*\)[^}]+}/, "");
         }
      );
      source = source.replace(getIteratorTemplate(source), function(match)  {
            return match.replace(/(?: *\/\/.*\n)* *["'] *(?:<% *)?if *\(support\.enumPrototypes *(?:&&|\))(.+?}["']|[\s\S]+?<% *} *(?:%>|["'])).+/g, "").replace(/support\.enumPrototypes\s*\|\|\s*/g, "");
         }
      );
      return source;
   }
;
   function removeSupportNodeClass(source)  {
      source = removeFunction(source, "isNode");
      source = removeSupportProp(source, "nodeClass");
      _.each(["clone", "shimIsPlainObject"], function(methodName)  {
            source = source.replace(matchFunction(source, methodName), function(match)  {
                  return match.replace(/\s*\|\|\s*\(!support\.nodeClass[\s\S]+?\)\)/, "");
               }
            );
         }
      );
      source = source.replace(matchFunction(source, "isEqual"), function(match)  {
            return match.replace(/\s*\|\|\s*\(!support\.nodeClass[\s\S]+?\)\)\)/, "");
         }
      );
      return source;
   }
;
   function removeSupportNonEnumArgs(source)  {
      source = removeSupportProp(source, "nonEnumArgs");
      source = source.replace(matchFunction(source, "keys"), function(match)  {
            return match.replace(/(?:\s*\|\|\s*)?\(support\.nonEnumArgs[\s\S]+?\)\)/, "").replace(/\s*if *\(\s*\)[^}]+}/, "");
         }
      );
      source = source.replace(getIteratorTemplate(source), function(match)  {
            return match.replace(/(?: *\/\/.*\n)*( *["'] *)<% *} *else *if *\(support\.nonEnumArgs[\s\S]+?(\1<% *} *%>.+)/, "$2").replace(/\s*\|\|\s*support\.nonEnumArgs/, "");
         }
      );
      return source;
   }
;
   function removeSupportNonEnumShadows(source)  {
      source = removeSupportProp(source, "nonEnumShadows");
      source = removeVar(source, "nonEnumProps");
      source = removeVar(source, "shadowedProps");
      source = removeFromCreateIterator(source, "shadowedProps");
      source = source.replace(/^ *\(function[\s\S]+?\n *var length\b[\s\S]+?shadowedProps[\s\S]+?}\(\)\);\n/m, "");
      source = source.replace(getIteratorTemplate(source), function(match)  {
            return match.replace(/(?: *\/\/.*\n)* *["']( *)<% *if *\(support\.nonEnumShadows[\s\S]+?["']\1<% *} *%>.+/, "");
         }
      );
      return source;
   }
;
   function removeSupportOwnLast(source)  {
      source = removeSupportProp(source, "ownLast");
      source = source.replace(matchFunction(source, "shimIsPlainObject"), function(match)  {
            return match.replace(/(?:\s*\/\/.*)*\n( *)if *\(support\.ownLast[\s\S]+?\n\1}/, "");
         }
      );
      return source;
   }
;
   function removeSupportSpliceObjects(source)  {
      source = removeSupportProp(source, "spliceObjects");
      source = source.replace(/(?:\s*\/\/.*)*\n( *)if *\(!support\.spliceObjects[\s\S]+?(?:{\s*}|\n\1})/, "");
      return source;
   }
;
   function removeSupportUnindexedChars(source)  {
      source = removeSupportProp(source, "unindexedChars");
      source = source.replace(matchFunction(source, "at"), function(match)  {
            return match.replace(/^ *if *\(support\.unindexedChars[^}]+}\n+/m, "");
         }
      );
      source = source.replace(matchFunction(source, "reduceRight"), function(match)  {
            return match.replace(/}\s*else if *\(support\.unindexedChars[^}]+/, "");
         }
      );
      source = source.replace(matchFunction(source, "toArray"), function(match)  {
            return match.replace(/(return\b).+?support\.unindexedChars[^:]+:\s*/, "$1 ");
         }
      );
      source = source.replace(getIteratorTemplate(source), function(match)  {
            return match.replace(/'if *\(<%= *array *%>[^']*/, "$&\n").replace(/(?: *\/\/.*\n)* *["']( *)<% *if *\(support\.unindexedChars[\s\S]+?["']\1<% *} *%>.+/, "");
         }
      );
      return source;
   }
;
   function removeRunInContext(source)  {
      source = removeVar(source, "contextProps");
      source = source.replace(/\btest\(runInContext\)/, "test(function() { return this; })");
      source = source.replace(matchFunction(source, "runInContext"), function(match)  {
            return match.replace(/^[\s\S]+?function runInContext[\s\S]+?context *= *context.+| *return lodash[\s\S]+$/g, "").replace(/^ {4}/gm, "  ");
         }
      );
      source = source.replace(/\bcontext\b/g, "window").replace(/(?:\n +\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\/)?\n *var Array *=[\s\S]+?;\n/, "").replace(/(return *|= *)_([;)])/g, "$1lodash$2").replace(/^ *var _ *=.+\n+/m, "");
      return source;
   }
;
   function removeSetImmediate(source)  {
      source = removeVar(source, "setImmediate");
      source = source.replace(/(?:\s*\/\/.*)*\n( *)if *\(isV8 *&& *freeModule[\s\S]+?\n\1}/, "");
      return source;
   }
;
   function removeSupportProp(source, propName)  {
      return source.replace(RegExp(multilineComment + "(?: *try\b.+\n)?" + " *support\." + propName + " *=.+\n" + "(?:( *).+?catch\b[\s\S]+?\n\1}\n)?"), "");
   }
;
   function removeVar(source, varName)  {
      if (/^(?:cloneableClasses|contextProps|ctorByClass|nonEnumProps|shadowedProps|whitespace)$/.test(varName))  {
         source = source.replace(RegExp("(var " + varName + " *=)[\s\S]+?;\n\n"), "$1=null;

");
      }
      source = removeFunction(source, varName);
      source = source.replace(RegExp(multilineComment + "( *)var " + varName + " *= *(?:.+?(?:;|&&\n[^;]+;)|(?:\w+\(|{)[\s\S]+?\n\1.+?;)\n|" + "^ *" + varName + " *=.+?,\n", "m"), "");
      source = source.replace(RegExp("(var +)" + varName + " *=.+?,\s+"), "$1");
      source = source.replace(RegExp(",\s*" + varName + " *=.+?;"), ";");
      return source;
   }
;
   function replaceFunction(source, funcName, funcValue)  {
      var snippet = matchFunction(source, funcName);
      if (! snippet)  {
         return source;
      }
      snippet = snippet.replace(/^\s*(?:\/\/.*|\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\/)\n/, "");
      source = source.replace(snippet, function()  {
            return funcValue.replace(RegExp("^" + getIndent(funcValue), "gm"), getIndent(snippet)).trimRight() + "
";
         }
      );
      return source;
   }
;
   function replaceSupportProp(source, propName, propValue)  {
      return source.replace(RegExp("(?: *try\b.+\n)?" + "( *support\." + propName + " *=).+\n" + "(?:( *).+?catch\b[\s\S]+?\n\2}\n)?"), function(match, left)  {
            return left + " " + propValue + ";
";
         }
      );
   }
;
   function replaceVar(source, varName, varValue)  {
      var result = source.replace(RegExp("(( *)var " + varName + " *=)" + "(?:.+?;|(?:Function\(.+?|.*?[^,])\n[\s\S]+?\n\2.+?;)\n"), function(match, left)  {
            return left + " " + varValue + ";
";
         }
      );
      if (source == result)  {
         result = source.replace(RegExp("((?:var|\n) +" + varName + " *=).+?,"), function(match, left)  {
               return left + " " + varValue + ",";
            }
         );
      }
      if (source == result)  {
         result = source.replace(RegExp("(,\s*" + varName + " *=).+?;"), function(match, left)  {
               return left + " " + varValue + ";";
            }
         );
      }
      return result;
   }
;
   function setUseStrictOption(source, value)  {
      source = source.replace(/^([\s\S]*?function[^{]+{)(?:\s*'use strict';)?/, "$1" + value ? "
  'use strict';" : "");
      source = source.replace(getIteratorTemplate(source), function(match)  {
            return match.replace(/(template\()(?:\s*"'use strict.+)?/, "$1" + value ? "
    "'use strict';\n" +" : "");
         }
      );
      return source;
   }
;
   function build(options, callback)  {
      options || options = [];
      var debugSource;
      var sourceMapURL;
      var invalidArgs = _.reject(options.slice(reNode.test(options[0]) ? 2 : 0), function(value, index, options)  {
            if (/^(?:-o|--output)$/.test(options[index - 1]) || /^(?:category|exclude|exports|iife|include|moduleId|minus|plus|settings|template)=.*$/.test(value))  {
               return true;
            }
            var result = _.contains(["backbone", "csp", "legacy", "mobile", "modern", "modularize", "strict", "underscore", "-c", "--stdout", "-d", "--debug", "-h", "--help", "-m", "--minify", "-n", "--no-dep", "-o", "--output", "-p", "--source-map", "-s", "--silent", "-V", "--version"], value);
            if (! result && /^(?:-p|--source-map)$/.test(options[index - 1]))  {
               result = true;
               sourceMapURL = value;
            }
            return result;
         }
      );
      if (invalidArgs.length)  {
         console.log("
" + "Invalid argument" + invalidArgs.length > 1 ? "s" : "" + " passed: " + invalidArgs.join(", "));
         displayHelp();
         return ;
      }
      if (_.find(options, function(arg)  {
            return /^(?:-h|--help)$/.test(arg);
         }
      ))  {
         displayHelp();
         return ;
      }
      if (_.find(options, function(arg)  {
            return /^(?:-V|--version)$/.test(arg);
         }
      ))  {
         console.log(_.VERSION);
         return ;
      }
      var dependencyBackup = _.cloneDeep(dependencyMap);
      var iife = options.reduce(function(result, value)  {
            var match = value.match(/^iife=(.*)$/);
            return match ? match[1] : result;
         }, 
         null);
      var filePath = path.join(__dirname, "lodash.js");
      var isBackbone = _.contains(options, "backbone");
      var isCSP = _.contains(options, "csp") || _.contains(options, "CSP");
      var isDebug = _.contains(options, "-d") || _.contains(options, "--debug");
      var isIIFE = typeof iife == "string";
      var isMapped = _.contains(options, "-p") || _.contains(options, "--source-map");
      var isMinify = _.contains(options, "-m") || _.contains(options, "--minify");
      var isMobile = _.contains(options, "mobile");
      var isModern = isCSP || isMobile || _.contains(options, "modern");
      var isModularize = _.contains(options, "modularize");
      var isNoDep = _.contains(options, "-n") || _.contains(options, "--no-dep");
      var isStdOut = _.contains(options, "-c") || _.contains(options, "--stdout");
      var isSilent = isStdOut || _.contains(options, "-s") || _.contains(options, "--silent");
      var isStrict = _.contains(options, "strict");
      var isUnderscore = isBackbone || _.contains(options, "underscore");
      var isLegacy = ! isModern || isUnderscore && _.contains(options, "legacy");
      var exportsOptions = options.reduce(function(result, value)  {
            return /^exports=.*$/.test(value) ? optionToArray(value).sort() : result;
         }, 
         isUnderscore ? ["commonjs", "global", "node"] : exportsAll.slice());
      var moduleId = options.reduce(function(result, value)  {
            var match = value.match(/^moduleId=(.*)$/);
            return match ? match[1] : result;
         }, 
         "lodash");
      var outputPath = options.reduce(function(result, value, index)  {
            if (/^(?:-o|--output)$/.test(value))  {
               result = options[index + 1];
               var dirname = path.dirname(result);
               fs.mkdirpSync(dirname);
               result = path.join(fs.realpathSync(dirname), path.basename(result));
            }
            return result;
         }, 
         "");
      var templatePattern = options.reduce(function(result, value)  {
            var match = value.match(/^template=(.+)$/);
            return match ? path.join(fs.realpathSync(path.dirname(match[1])), path.basename(match[1])) : result;
         }, 
         "");
      var templateSettings = options.reduce(function(result, value)  {
            var match = value.match(/^settings=(.+)$/);
            return match ? _.assign(result, Function("return {" + match[1].replace(/^{|}$/g, "") + "}")()) : result;
         }, 
         _.assign(_.clone(_.templateSettings),  {
               moduleId:moduleId            }
         ));
      var isTemplate = ! ! templatePattern;
      var source = fs.readFileSync(filePath, "utf8");
      var isAMD = _.contains(exportsOptions, "amd"), isCommonJS = _.contains(exportsOptions, "commonjs"), isGlobal = _.contains(exportsOptions, "global"), isNode = _.contains(exportsOptions, "node");
      var useLodashMethod = function(methodName)  {
         if (_.contains(lodashOnlyMethods, methodName) || /^(?:assign|zipObject)$/.test(methodName))  {
            var methods = _.without.apply(_, [_.union(includeMethods, plusMethods)].concat(minusMethods));
            return _.contains(methods, methodName);
         }
         methods = _.without.apply(_, [plusMethods].concat(minusMethods));
         return _.contains(methods, methodName);
      }
;
      if (! isUnderscore || useLodashMethod("findWhere"))  {
         delete dependencyMap.findWhere;
      }
      var includeMethods = options.reduce(function(accumulator, value)  {
            return /^include=.*$/.test(value) ? _.union(accumulator, optionToMethodsArray(source, value)) : accumulator;
         }, 
         []);
      var minusMethods = options.reduce(function(accumulator, value)  {
            return /^(?:exclude|minus)=.*$/.test(value) ? _.union(accumulator, optionToMethodsArray(source, value)) : accumulator;
         }, 
         []);
      var plusMethods = options.reduce(function(accumulator, value)  {
            return /^plus=.*$/.test(value) ? _.union(accumulator, optionToMethodsArray(source, value)) : accumulator;
         }, 
         []);
      var categories = options.reduce(function(accumulator, value)  {
            if (/^(category|exclude|include|minus|plus)=.+$/.test(value))  {
               var array = optionToArray(value);
               accumulator = _.union(accumulator, /^category=.*$/.test(value) ? array.map(function(category)  {
                        return capitalize(category.toLowerCase());
                     }
                  ) : array.filter(function(category)  {
                        return /^[A-Z]/.test(category);
                     }
                  ));
            }
            return accumulator;
         }, 
         []);
      var buildMethods = ! isTemplate && function()  {
         var result;
         if (isLegacy)  {
            dependencyMap.defer = _.without(dependencyMap.defer, "bind");
         }
         if (isModern)  {
            dependencyMap.reduceRight = _.without(dependencyMap.reduceRight, "isString");
            if (isMobile)  {
               _.each(["assign", "defaults"], function(methodName)  {
                     dependencyMap[methodName] = _.without(dependencyMap[methodName], "keys");
                  }
               );
            }
             else  {
               _.each(["isEmpty", "isEqual", "isPlainObject", "keys"], function(methodName)  {
                     dependencyMap[methodName] = _.without(dependencyMap[methodName], "isArguments");
                  }
               );
            }
         }
         if (isUnderscore)  {
            if (! useLodashMethod("clone") && ! useLodashMethod("cloneDeep"))  {
               dependencyMap.clone = _.without(dependencyMap.clone, "forEach", "forOwn");
            }
            if (! useLodashMethod("contains"))  {
               dependencyMap.contains = _.without(dependencyMap.contains, "isString");
            }
            if (! useLodashMethod("flatten"))  {
               dependencyMap.flatten = _.without(dependencyMap.flatten, "createCallback");
            }
            if (! useLodashMethod("isEmpty"))  {
               dependencyMap.isEmpty = ["isArray", "isString"];
            }
            if (! useLodashMethod("isEqual"))  {
               dependencyMap.isEqual = _.without(dependencyMap.isEqual, "forIn", "isArguments");
            }
            if (! useLodashMethod("pick"))  {
               dependencyMap.pick = _.without(dependencyMap.pick, "forIn", "isObject");
            }
            if (! useLodashMethod("template"))  {
               dependencyMap.template = _.without(dependencyMap.template, "keys", "values");
            }
            if (! useLodashMethod("toArray"))  {
               dependencyMap.toArray.push("isArray", "map");
            }
            if (! useLodashMethod("where"))  {
               dependencyMap.createCallback = _.without(dependencyMap.createCallback, "isEqual");
               dependencyMap.where.push("find", "isEmpty");
            }
            _.each(["clone", "difference", "intersection", "isEqual", "sortBy", "uniq"], function(methodName)  {
                  if (methodName == "clone" ? ! useLodashMethod("clone") && ! useLodashMethod("cloneDeep") : ! useLodashMethod(methodName))  {
                     dependencyMap[methodName] = _.without(dependencyMap[methodName], "getArray", "getObject", "releaseArray", "releaseObject");
                  }
               }
            );
            _.each(["debounce", "throttle"], function(methodName)  {
                  if (! useLodashMethod(methodName))  {
                     dependencyMap[methodName] = [];
                  }
               }
            );
            _.each(["difference", "intersection", "uniq"], function(methodName)  {
                  if (! useLodashMethod(methodName))  {
                     dependencyMap[methodName] = ["getIndexOf"].concat(_.without(dependencyMap[methodName], "cacheIndexOf", "createCache"));
                  }
               }
            );
            _.each(["flatten", "uniq"], function(methodName)  {
                  if (! useLodashMethod(methodName))  {
                     dependencyMap[methodName] = _.without(dependencyMap[methodName], "overloadWrapper");
                  }
               }
            );
            _.each(["max", "min"], function(methodName)  {
                  if (! useLodashMethod(methodName))  {
                     dependencyMap[methodName] = _.without(dependencyMap[methodName], "charAtCallback", "isArray", "isString");
                  }
               }
            );
         }
         if (isModern || isUnderscore)  {
            dependencyMap.reduceRight = _.without(dependencyMap.reduceRight, "isString");
            _.each(["assign", "basicEach", "defaults", "forIn", "forOwn", "shimKeys"], function(methodName)  {
                  if (! isUnderscore && useLodashMethod(methodName))  {
                     dependencyMap[methodName] = _.without(dependencyMap[methodName], "createIterator");
                  }
               }
            );
            _.each(["at", "forEach", "toArray"], function(methodName)  {
                  if (! isUnderscore && useLodashMethod(methodName))  {
                     dependencyMap[methodName] = _.without(dependencyMap[methodName], "isString");
                  }
               }
            );
            if (! isMobile)  {
               _.each(["every", "find", "filter", "forEach", "forIn", "forOwn", "map", "reduce"], function(methodName)  {
                     if (! isUnderscore && useLodashMethod(methodName))  {
                        dependencyMap[methodName] = _.without(dependencyMap[methodName], "isArguments", "isArray");
                     }
                  }
               );
               _.each(["max", "min"], function(methodName)  {
                     if (! isUnderscore && useLodashMethod(methodName))  {
                        dependencyMap[methodName].push("forEach");
                     }
                  }
               );
            }
         }
         if (includeMethods.length)  {
            result = includeMethods;
         }
         if (isBackbone && ! result)  {
            result = backboneDependencies;
         }
          else if (isUnderscore && ! result)  {
            result = underscoreMethods;
         }
         if (categories.length)  {
            result = _.union(result || [], categories.reduce(function(accumulator, category)  {
                     var methodNames = getMethodsByCategory(source, category);
                     if (isUnderscore)  {
                        if (_.contains(categories, "Chaining") && ! _.contains(methodNames, "chain"))  {
                           methodNames.push("chain");
                        }
                        if (_.contains(categories, "Collections") && ! _.contains(methodNames, "findWhere"))  {
                           methodNames.push("findWhere");
                        }
                     }
                     if (isBackbone)  {
                        methodNames = methodNames.filter(function(methodName)  {
                              return _.contains(backboneDependencies, methodName);
                           }
                        );
                     }
                      else if (isUnderscore)  {
                        methodNames = methodNames.filter(function(methodName)  {
                              return _.contains(underscoreMethods, methodName);
                           }
                        );
                     }
                     return accumulator.concat(methodNames);
                  }, 
                  []));
         }
         if (! result)  {
            result = lodashMethods.slice();
         }
         if (plusMethods.length)  {
            result = _.union(result, plusMethods);
         }
         if (minusMethods.length)  {
            result = _.without.apply(_, [result].concat(minusMethods, isNoDep ? minusMethods : getDependants(minusMethods)));
         }
         if (! isNoDep)  {
            result = getDependencies(result);
         }
         return result;
      }
();
      var lodash = ! isTemplate && function()  {
         source = setUseStrictOption(source, isStrict);
         if (isLegacy)  {
            source = removeSupportProp(source, "fastBind");
            source = replaceSupportProp(source, "argsClass", "false");
            _.each(["isIeOpera", "isV8", "getPrototypeOf", "nativeBind", "nativeCreate", "nativeIsArray", "nativeKeys", "reNative"], function(varName)  {
                  source = removeVar(source, varName);
               }
            );
            source = source.replace(matchFunction(source, "bind"), function(match)  {
                  return match.replace(/(?:\s*\/\/.*)*\s*return support\.fastBind[^:]+:\s*/, "return ");
               }
            );
            source = source.replace(matchFunction(source, "isArray"), function(match)  {
                  return match.replace(/\bnativeIsArray\s*\|\|\s*/, "");
               }
            );
            _.each(["createObject", "isArguments"], function(methodName)  {
                  var capitalized = capitalize(methodName), get = eval("get" + capitalized + "Fallback"), remove = eval("remove" + capitalized + "Fallback");
                  source = source.replace(matchFunction(source, methodName).replace(RegExp("[\s\S]+?function " + methodName), ""), function()  {
                        var snippet = get(source), body = snippet.match(RegExp(methodName + " *= *function([\s\S]+?\n *});"))[1], indent = getIndent(snippet);
                        return body.replace(RegExp("^" + indent, "gm"), indent.slice(0, - 2)) + "
";
                     }
                  );
                  source = remove(source);
               }
            );
            source = source.replace(matchFunction(source, "isPlainObject").replace(/[\s\S]+?var isPlainObject *= */, ""), matchFunction(source, "shimIsPlainObject").replace(/[\s\S]+?function shimIsPlainObject/, "function").replace(/\s*$/, ";
"));
            source = removeFunction(source, "shimIsPlainObject");
            source = source.replace(matchFunction(source, "keys").replace(/[\s\S]+?var keys *= */, ""), matchFunction(source, "shimKeys").replace(/[\s\S]+?var shimKeys *= */, ""));
            source = removeFunction(source, "shimKeys");
         }
         if (isModern)  {
            source = removeSupportSpliceObjects(source);
            source = removeIsArgumentsFallback(source);
            if (isMobile)  {
               source = replaceSupportProp(source, "enumPrototypes", "true");
               source = replaceSupportProp(source, "nonEnumArgs", "true");
            }
             else  {
               source = removeIsArrayFallback(source);
               source = removeIsFunctionFallback(source);
               source = removeCreateObjectFallback(source);
               source = source.replace(matchFunction(source, "isPlainObject"), function(match)  {
                     return match.replace(/!getPrototypeOf[^:]+:\s*/, "");
                  }
               );
            }
         }
         if (isLegacy || isMobile || isUnderscore && ! useLodashMethod("createCallback"))  {
            source = removeBindingOptimization(source);
         }
         if (isLegacy || isMobile || isUnderscore)  {
            if (isMobile || ! useLodashMethod("assign") && ! useLodashMethod("defaults") && ! useLodashMethod("forIn") && ! useLodashMethod("forOwn"))  {
               source = removeKeysOptimization(source);
            }
            if (! useLodashMethod("defer"))  {
               source = removeSetImmediate(source);
            }
         }
         if (isModern || isUnderscore)  {
            source = removeSupportArgsClass(source);
            source = removeSupportArgsObject(source);
            source = removeSupportNonEnumShadows(source);
            source = removeSupportOwnLast(source);
            source = removeSupportUnindexedChars(source);
            source = removeSupportNodeClass(source);
            if (! isMobile)  {
               source = removeSupportEnumErrorProps(source);
               source = removeSupportEnumPrototypes(source);
               source = removeSupportNonEnumArgs(source);
               source = replaceFunction(source, "forEach", ["function forEach(collection, callback, thisArg) {", "  var index = -1,", "      length = collection ? collection.length : 0;", "", "  callback = callback && typeof thisArg == 'undefined' ? callback : lodash.createCallback(callback, thisArg);", "  if (typeof length == 'number') {", "    while (++index < length) {", "      if (callback(collection[index], index, collection) === false) {", "        break;", "      }", "    }", "  } else {", "    basicEach(collection, callback);", "  }", "  return collection;", "}"].join("
"));
               if (! isUnderscore || isUnderscore && useLodashMethod("isRegExp"))  {
                  source = replaceFunction(source, "isRegExp", ["function isRegExp(value) {", "  return value ? (typeof value == 'object' && toString.call(value) == regexpClass) : false;", "}"].join("
"));
               }
               source = replaceFunction(source, "map", ["function map(collection, callback, thisArg) {", "  var index = -1,", "      length = collection ? collection.length : 0;", "", "  callback = lodash.createCallback(callback, thisArg);", "  if (typeof length == 'number') {", "    var result = Array(length);", "    while (++index < length) {", "      result[index] = callback(collection[index], index, collection);", "    }", "  } else {", "    result = [];", "    basicEach(collection, function(value, key, collection) {", "      result[++index] = callback(value, key, collection);", "    });", "  }", "  return result;", "}"].join("
"));
               source = replaceFunction(source, "pluck", ["function pluck(collection, property) {", "  var index = -1,", "      length = collection ? collection.length : 0;", "", "  if (typeof length == 'number') {", "    var result = Array(length);", "    while (++index < length) {", "      result[index] = collection[index][property];", "    }", "  }", "  return result || map(collection, property);", "}"].join("
"));
               _.each(["every", "filter", "find", "max", "min", "reduce", "some"], function(methodName)  {
                     source = source.replace(matchFunction(source, methodName), function(match)  {
                           if (methodName == "reduce")  {
                              match = match.replace(/^( *)var noaccum\b/m, "$1if (!collection) return accumulator;
$&");
                           }
                            else if (/^(?:max|min)$/.test(methodName))  {
                              match = match.replace(/\bbasicEach\(/, "forEach(");
                              if (! isUnderscore || useLodashMethod(methodName))  {
                                 return match;
                              }
                           }
                           return match.replace(/^(( *)if *\(.*?\bisArray\([^\)]+\).*?\) *{\n)(( *)var index[^;]+.+\n+)/m, function(snippet, statement, indent, vars)  {
                                 vars = vars.replace(/\b(length *=)[^;=]+/, "$1 collection" + methodName == "reduce" ? ".length" : " ? collection.length : 0").replace(RegExp("^  " + indent, "gm"), indent);
                                 return vars + statement.replace(/\bisArray\([^\)]+\)/, "typeof length == 'number'");
                              }
                           );
                        }
                     );
                  }
               );
               source = source.replace(/^( *)var eachIteratorOptions *= *[\s\S]+?\n\1};\n/m, function(match)  {
                     return match.replace(/(^ *'array':)[^,]+/m, "$1 false");
                  }
               );
            }
         }
         if (isUnderscore)  {
            source = replaceFunction(source, "lodash", ["function lodash(value) {", "  return (value instanceof lodash)", "    ? value", "    : new lodashWrapper(value);", "}"].join("
"));
            if (! useLodashMethod("assign"))  {
               source = replaceFunction(source, "assign", ["function assign(object) {", "  if (!object) {", "    return object;", "  }", "  for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {", "    var iterable = arguments[argsIndex];", "    if (iterable) {", "      for (var key in iterable) {", "        object[key] = iterable[key];", "      }", "    }", "  }", "  return object;", "}"].join("
"));
            }
            if (! useLodashMethod("clone") && ! useLodashMethod("cloneDeep"))  {
               source = replaceFunction(source, "clone", ["function clone(value) {", "  return isObject(value)", "    ? (isArray(value) ? slice(value) : assign({}, value))", "    : value;", "}"].join("
"));
            }
            if (! useLodashMethod("contains"))  {
               source = replaceFunction(source, "contains", ["function contains(collection, target) {", "  var indexOf = getIndexOf(),", "      length = collection ? collection.length : 0,", "      result = false;", "  if (length && typeof length == 'number') {", "    result = indexOf(collection, target) > -1;", "  } else {", "    basicEach(collection, function(value) {", "      return !(result = value === target);", "    });", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("debounce"))  {
               source = replaceFunction(source, "debounce", ["function debounce(func, wait, immediate) {", "  var args,", "      result,", "      thisArg,", "      timeoutId = null;", "", "  function delayed() {", "    timeoutId = null;", "    if (!immediate) {", "      result = func.apply(thisArg, args);", "    }", "  }", "  return function() {", "    var isImmediate = immediate && !timeoutId;", "    args = arguments;", "    thisArg = this;", "", "    clearTimeout(timeoutId);", "    timeoutId = setTimeout(delayed, wait);", "", "    if (isImmediate) {", "      result = func.apply(thisArg, args);", "    }", "    return result;", "  };", "}"].join("
"));
            }
            if (! useLodashMethod("defaults"))  {
               source = replaceFunction(source, "defaults", ["function defaults(object) {", "  if (!object) {", "    return object;", "  }", "  for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {", "    var iterable = arguments[argsIndex];", "    if (iterable) {", "      for (var key in iterable) {", "        if (object[key] == null) {", "          object[key] = iterable[key];", "        }", "      }", "    }", "  }", "  return object;", "}"].join("
"));
            }
            if (! useLodashMethod("difference"))  {
               source = replaceFunction(source, "difference", ["function difference(array) {", "  var index = -1,", "      indexOf = getIndexOf(),", "      length = array.length,", "      flattened = concat.apply(arrayRef, nativeSlice.call(arguments, 1)),", "      result = [];", "", "  while (++index < length) {", "    var value = array[index];", "    if (indexOf(flattened, value) < 0) {", "      result.push(value);", "    }", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("findWhere") && ! useLodashMethod("where"))  {
               source = source.replace(matchFunction(source, "find"), function(match)  {
                     var indent = getIndent(match);
                     return match && match + ["", "/**", " * Examines each element in a `collection`, returning the first that", " * has the given `properties`. When checking `properties`, this method", " * performs a deep comparison between values to determine if they are", " * equivalent to each other.", " *", " * @static", " * @memberOf _", " * @category Collections", " * @param {Array|Object|String} collection The collection to iterate over.", " * @param {Object} properties The object of property values to filter by.", " * @returns {Mixed} Returns the found element, else `undefined`.", " * @example", " *", " * var food = [", " *   { 'name': 'apple',  'organic': false, 'type': 'fruit' },", " *   { 'name': 'banana', 'organic': true,  'type': 'fruit' },", " *   { 'name': 'beet',   'organic': false, 'type': 'vegetable' }", " * ];", " *", " * _.findWhere(food, { 'type': 'vegetable' });", " * // => { 'name': 'beet', 'organic': false, 'type': 'vegetable' }", " */", "function findWhere(object, properties) {", "  return where(object, properties, true);", "}", ""].join("
" + indent);
                  }
               );
               source = source.replace(getMethodAssignments(source), function(match)  {
                     return match.replace(/^( *lodash.findWhere *= *).+/m, "$1findWhere;");
                  }
               );
            }
            if (! useLodashMethod("flatten"))  {
               source = replaceFunction(source, "flatten", ["function flatten(array, isShallow) {", "  var index = -1,", "      length = array ? array.length : 0,", "      result = [];", "", "  while (++index < length) {", "    var value = array[index];", "    if (isArray(value)) {", "      push.apply(result, isShallow ? value : flatten(value));", "    } else {", "      result.push(value);", "    }", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("intersection"))  {
               source = replaceFunction(source, "intersection", ["function intersection(array) {", "  var args = arguments,", "      argsLength = args.length,", "      index = -1,", "      indexOf = getIndexOf(),", "      length = array ? array.length : 0,", "      result = [];", "", "  outer:", "  while (++index < length) {", "    var value = array[index];", "    if (indexOf(result, value) < 0) {", "      var argsIndex = argsLength;", "      while (--argsIndex) {", "        if (indexOf(args[argsIndex], value) < 0) {", "          continue outer;", "        }", "      }", "      result.push(value);", "    }", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("isEmpty"))  {
               source = replaceFunction(source, "isEmpty", ["function isEmpty(value) {", "  if (!value) {", "    return true;", "  }", "  if (isArray(value) || isString(value)) {", "    return !value.length;", "  }", "  for (var key in value) {", "    if (hasOwnProperty.call(value, key)) {", "      return false;", "    }", "  }", "  return true;", "}"].join("
"));
            }
            if (! useLodashMethod("isEqual"))  {
               source = replaceFunction(source, "isEqual", ["function isEqual(a, b, stackA, stackB) {", "  if (a === b) {", "    return a !== 0 || (1 / a == 1 / b);", "  }", "  var type = typeof a,", "      otherType = typeof b;", "", "  if (a === a &&", "      (!a || (type != 'function' && type != 'object')) &&", "      (!b || (otherType != 'function' && otherType != 'object'))) {", "    return false;", "  }", "  if (a == null || b == null) {", "    return a === b;", "  }", "  var className = toString.call(a),", "      otherClass = toString.call(b);", "", "  if (className != otherClass) {", "    return false;", "  }", "  switch (className) {", "    case boolClass:", "    case dateClass:", "      return +a == +b;", "", "    case numberClass:", "      return a != +a", "        ? b != +b", "        : (a == 0 ? (1 / a == 1 / b) : a == +b);", "", "    case regexpClass:", "    case stringClass:", "      return a == String(b);", "  }", "  var isArr = className == arrayClass;", "  if (!isArr) {", "    if (a instanceof lodash || b instanceof lodash) {", "      return isEqual(a.__wrapped__ || a, b.__wrapped__ || b, stackA, stackB);", "    }", "    if (className != objectClass) {", "      return false;", "    }", "    var ctorA = a.constructor,", "        ctorB = b.constructor;", "", "    if (ctorA != ctorB && !(", "          isFunction(ctorA) && ctorA instanceof ctorA &&", "          isFunction(ctorB) && ctorB instanceof ctorB", "        )) {", "      return false;", "    }", "  }", "  stackA || (stackA = []);", "  stackB || (stackB = []);", "", "  var length = stackA.length;", "  while (length--) {", "    if (stackA[length] == a) {", "      return stackB[length] == b;", "    }", "  }", "  var result = true,", "      size = 0;", "", "  stackA.push(a);", "  stackB.push(b);", "", "  if (isArr) {", "    size = b.length;", "    result = size == a.length;", "", "    if (result) {", "      while (size--) {", "        if (!(result = isEqual(a[size], b[size], stackA, stackB))) {", "          break;", "        }", "      }", "    }", "    return result;", "  }", "  forIn(b, function(value, key, b) {", "    if (hasOwnProperty.call(b, key)) {", "      size++;", "      return (result = hasOwnProperty.call(a, key) && isEqual(a[key], value, stackA, stackB));", "    }", "  });", "", "  if (result) {", "    forIn(a, function(value, key, a) {", "      if (hasOwnProperty.call(a, key)) {", "        return (result = --size > -1);", "      }", "    });", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("memoize"))  {
               source = replaceFunction(source, "memoize", ["function memoize(func, resolver) {", "  var cache = {};", "  return function() {", "    var key = keyPrefix + (resolver ? resolver.apply(this, arguments) : arguments[0]);", "    return hasOwnProperty.call(cache, key)", "      ? cache[key]", "      : (cache[key] = func.apply(this, arguments));", "  };", "}"].join("
"));
            }
            if (! useLodashMethod("omit"))  {
               source = replaceFunction(source, "omit", ["function omit(object) {", "  var indexOf = getIndexOf(),", "      props = concat.apply(arrayRef, nativeSlice.call(arguments, 1)),", "      result = {};", "", "  forIn(object, function(value, key) {", "    if (indexOf(props, key) < 0) {", "      result[key] = value;", "    }", "  });", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("pick"))  {
               source = replaceFunction(source, "pick", ["function pick(object) {", "  var index = -1,", "      props = concat.apply(arrayRef, nativeSlice.call(arguments, 1)),", "      length = props.length,", "      result = {};", "", "  while (++index < length) {", "    var prop = props[index];", "    if (prop in object) {", "      result[prop] = object[prop];", "    }", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("result"))  {
               source = replaceFunction(source, "result", ["function result(object, property) {", "  var value = object ? object[property] : null;", "  return isFunction(value) ? object[property]() : value;", "}"].join("
"));
            }
            if (! useLodashMethod("sortBy"))  {
               source = replaceFunction(source, "sortBy", ["function sortBy(collection, callback, thisArg) {", "  var index = -1,", "      length = collection ? collection.length : 0,", "      result = Array(typeof length == 'number' ? length : 0);", "", "  callback = lodash.createCallback(callback, thisArg);", "  forEach(collection, function(value, key, collection) {", "    result[++index] = {", "      'criteria': callback(value, key, collection),", "      'index': index,", "      'value': value", "    };", "  });", "", "  length = result.length;", "  result.sort(compareAscending);", "  while (length--) {", "    result[length] = result[length].value;", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("template"))  {
               source = source.replace(/,[^']*'imports':[^}]+}/, "");
               source = replaceFunction(source, "template", ["function template(text, data, options) {", "  var settings = lodash.templateSettings;", "  text || (text = '');", "  options = iteratorTemplate ? defaults({}, options, settings) : settings;", "", "  var index = 0,", "      source = "__p += '",", "      variable = options.variable;", "", "  var reDelimiters = RegExp(", "    (options.escape || reNoMatch).source + '|' +", "    (options.interpolate || reNoMatch).source + '|' +", "    (options.evaluate || reNoMatch).source + '|$'", "  , 'g');", "", "  text.replace(reDelimiters, function(match, escapeValue, interpolateValue, evaluateValue, offset) {", "    source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);", "    if (escapeValue) {", "      source += "' +\n_.escape(" + escapeValue + ") +\n'";", "    }", "    if (evaluateValue) {", "      source += "';\n" + evaluateValue + ";\n__p += '";", "    }", "    if (interpolateValue) {", "      source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";", "    }", "    index = offset + match.length;", "    return match;", "  });", "", "  source += "';\n";", "  if (!variable) {", "    variable = 'obj';", "    source = 'with (' + variable + ' || {}) {\n' + source + '\n}\n';", "  }", "  source = 'function(' + variable + ') {\n' +", "    "var __t, __p = '', __j = Array.prototype.join;\n" +", "    "function print() { __p += __j.call(arguments, '') }\n" +", "    source +", "    'return __p\n}';", "", "  try {", "    var result = Function('_', 'return ' + source)(lodash);", "  } catch(e) {", "    e.source = source;", "    throw e;", "  }", "  if (data) {", "    return result(data);", "  }", "  result.source = source;", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("throttle"))  {
               source = replaceFunction(source, "throttle", ["function throttle(func, wait) {", "  var args,", "      result,", "      thisArg,", "      lastCalled = 0,", "      timeoutId = null;", "", "  function trailingCall() {", "    lastCalled = new Date;", "    timeoutId = null;", "    result = func.apply(thisArg, args);", "  }", "  return function() {", "    var now = new Date,", "        remaining = wait - (now - lastCalled);", "", "    args = arguments;", "    thisArg = this;", "", "    if (remaining <= 0) {", "      clearTimeout(timeoutId);", "      timeoutId = null;", "      lastCalled = now;", "      result = func.apply(thisArg, args);", "    }", "    else if (!timeoutId) {", "      timeoutId = setTimeout(trailingCall, remaining);", "    }", "    return result;", "  };", "}"].join("
"));
            }
            if (! useLodashMethod("times"))  {
               source = replaceFunction(source, "times", ["function times(n, callback, thisArg) {", "  var index = -1,", "      result = Array(n > -1 ? n : 0);", "", "  while (++index < n) {", "    result[index] = callback.call(thisArg, index);", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("toArray"))  {
               source = replaceFunction(source, "toArray", ["function toArray(collection) {", "  if (isArray(collection)) {", "    return slice(collection);", "  }", "  if (collection && typeof collection.length == 'number') {", "    return map(collection);", "  }", "  return values(collection);", "}"].join("
"));
            }
            if (! useLodashMethod("uniq"))  {
               source = replaceFunction(source, "uniq", ["function uniq(array, isSorted, callback, thisArg) {", "  var index = -1,", "      indexOf = getIndexOf(),", "      length = array ? array.length : 0,", "      result = [],", "      seen = result;", "", "  if (typeof isSorted != 'boolean' && isSorted != null) {", "    thisArg = callback;", "    callback = isSorted;", "    isSorted = false;", "  }", "  if (callback != null) {", "    seen = [];", "    callback = lodash.createCallback(callback, thisArg);", "  }", "  while (++index < length) {", "    var value = array[index],", "        computed = callback ? callback(value, index, array) : value;", "", "    if (isSorted", "          ? !index || seen[seen.length - 1] !== computed", "          : indexOf(seen, computed) < 0", "        ) {", "      if (callback) {", "        seen.push(computed);", "      }", "      result.push(value);", "    }", "  }", "  return result;", "}"].join("
"));
            }
            if (! useLodashMethod("uniqueId"))  {
               source = replaceFunction(source, "uniqueId", ["function uniqueId(prefix) {", "  var id = ++idCounter + '';", "  return prefix ? prefix + id : id;", "}"].join("
"));
            }
            if (! useLodashMethod("where"))  {
               source = replaceFunction(source, "where", ["function where(collection, properties, first) {", "  return (first && isEmpty(properties))", "    ? null", "    : (first ? find : filter)(collection, properties);", "}"].join("
"));
            }
            if (! useLodashMethod("unzip"))  {
               source = replaceFunction(source, "zip", ["function zip(array) {", "  var index = -1,", "      length = array ? max(pluck(arguments, 'length')) : 0,", "      result = Array(length < 0 ? 0 : length);", "", "  while (++index < length) {", "    result[index] = pluck(arguments, index);", "  }", "  return result;", "}"].join("
"));
            }
            source = source.replace(/lodash\.support *= */, "");
            _.each(["clone", "first", "initial", "last", "rest", "toArray"], function(methodName)  {
                  if (methodName == "clone" ? ! useLodashMethod("clone") && ! useLodashMethod("cloneDeep") : ! useLodashMethod(methodName))  {
                     source = source.replace(matchFunction(source, methodName), function(match)  {
                           return match.replace(/([^.])\bslice\(/g, "$1nativeSlice.call(");
                        }
                     );
                  }
               }
            );
            _.each(["max", "min"], function(methodName)  {
                  if (! useLodashMethod(methodName))  {
                     source = source.replace(matchFunction(source, methodName), function(match)  {
                           return match.replace(/=.+?callback *&& *isString[^:]+:\s*/g, "= ");
                        }
                     );
                  }
               }
            );
            if (! useLodashMethod("clone") && ! useLodashMethod("cloneDeep"))  {
               source = removeVar(source, "cloneableClasses");
               source = removeVar(source, "ctorByClass");
            }
            if (! useLodashMethod("where"))  {
               source = source.replace(matchFunction(source, "createCallback"), function(match)  {
                     return match.replace(/\bisEqual\(([^,]+), *([^,]+)[^)]+\)/, "$1 === $2");
                  }
               );
            }
            if (_.every(["bindKey", "partial", "partialRight"], function(methodName)  {
                  return ! _.contains(buildMethods, methodName);
               }
            ))  {
               source = source.replace(matchFunction(source, "createBound"), function(match)  {
                     return match.replace(/, *indicator[^)]*/, "").replace(/(function createBound\([^{]+{)[\s\S]+?(\n *)(function bound)/, function(match, part1, indent, part2)  {
                           return [part1, "if (!isFunction(func)) {", "  throw new TypeError;", "}", part2].join(indent);
                        }
                     ).replace(/thisBinding *=[^}]+}/, "thisBinding = thisArg;
").replace(/\(args *=.+/, "partialArgs.concat(nativeSlice.call(args))");
                  }
               );
            }
         }
         if (isUnderscore ? ! _.contains(plusMethods, "chain") : _.contains(plusMethods, "chain"))  {
            source = addChainMethods(source);
         }
         if (isUnderscore || isModern && ! isMobile && _.contains(buildMethods, "forEach") && _.contains(buildMethods, "forOwn"))  {
            source = removeFunction(source, "basicEach");
            source = source.replace(/^ *lodash\._basicEach *=.+\n/m, "");
            source = source.replace(/\bbasicEach(?=\(collection)/g, "forOwn");
            source = source.replace(/(\?\s*)basicEach(?=\s*:)/g, "$1forEach");
            source = source.replace(/\bbasicEach(?=\(\[)/g, "forEach");
         }
         var context = vm.createContext( {
               clearTimeout:clearTimeout, 
               console:console, 
               setTimeout:setTimeout            }
         );
         vm.runInContext(source, context);
         return context._;
      }
();
      if (isTemplate)  {
         source = buildTemplate(templatePattern, templateSettings);
      }
       else  {
         allMethods.forEach(function(otherName)  {
               if (! _.contains(buildMethods, otherName) && ! otherName == "findWhere" && ! isUnderscore)  {
                  source = removeFunction(source, otherName);
               }
            }
         );
         source = source.replace(matchFunction(source, "template"), function(match)  {
               return match.replace(/iteratorTemplate *&& */g, "").replace(/iteratorTemplate\s*\?\s*([^:]+?)\s*:[^,;]+/g, "$1");
            }
         );
         if (isModern || isUnderscore)  {
            source = removeFunction(source, "createIterator");
            iteratorOptions.forEach(function(prop)  {
                  if (prop != "array")  {
                     source = removeFromGetObject(source, prop);
                  }
               }
            );
            _.functions(lodash).forEach(function(methodName)  {
                  var reFunc = RegExp("^( *)(var " + methodName.replace(/^_/, "") + " *= *)createIterator\(((?:{|[a-zA-Z])[\s\S]+?)\);\n", "m");
                  if (reFunc.test(source))  {
                     source = source.replace(reFunc, function(match, indent, left)  {
                           return indent + left + cleanupCompiled(getFunctionSource(lodash[methodName], indent)) + ";
";
                        }
                     );
                  }
               }
            );
            if (isUnderscore)  {
               _.each(["basicEach", "forEach", "forIn", "forOwn"], function(methodName)  {
                     if (methodName == "basicEach" || ! useLodashMethod(methodName))  {
                        source = source.replace(matchFunction(source, methodName), function(match)  {
                              return match.replace(/=== *false\)/g, "=== indicatorObject)");
                           }
                        );
                     }
                  }
               );
               if (isUnderscore && /\bbasicEach\(/.test(source) || ! useLodashMethod("forOwn"))  {
                  source = source.replace(matchFunction(source, "every"), function(match)  {
                        return match.replace(/\(result *= *(.+?)\);/g, "!(result = $1) && indicatorObject;");
                     }
                  );
                  source = source.replace(matchFunction(source, "find"), function(match)  {
                        return match.replace(/return false/, "return indicatorObject");
                     }
                  );
                  source = source.replace(matchFunction(source, "transform"), function(match)  {
                        return match.replace(/return callback[^)]+\)/, "$& && indicatorObject");
                     }
                  );
                  _.each(["contains", "some"], function(methodName)  {
                        source = source.replace(matchFunction(source, methodName), function(match)  {
                              return match.replace(/!\(result *= *(.+?)\);/, "(result = $1) && indicatorObject;");
                           }
                        );
                     }
                  );
               }
               if (! useLodashMethod("forIn"))  {
                  source = source.replace(matchFunction(source, "isEqual"), function(match)  {
                        return match.replace(/\(result *= *(.+?)\);/g, "!(result = $1) && indicatorObject;");
                     }
                  );
                  source = source.replace(matchFunction(source, "shimIsPlainObject"), function(match)  {
                        return match.replace(/return false/, "return indicatorObject");
                     }
                  );
               }
               _.each(["forIn", "forOwn"], function(methodName)  {
                     if (! useLodashMethod(methodName))  {
                        source = source.replace(matchFunction(source, methodName), function(match)  {
                              return match.replace(/(callback), *thisArg/g, "$1").replace(/^ *callback *=.+\n/m, "");
                           }
                        );
                     }
                  }
               );
               if (! useLodashMethod("createCallback"))  {
                  source = source.replace(/\blodash\.(createCallback\()\b/g, "$1");
               }
               if (! useLodashMethod("forEach"))  {
                  _.each(["basicEach", "forEach"], function(methodName)  {
                        source = source.replace(matchFunction(source, methodName), function(match)  {
                              return match.replace(/\n *return .+?([};\s]+)$/, "$1").replace(/\b(return) +result\b/, "$1");
                           }
                        );
                     }
                  );
               }
               function()  {
                  var snippet = getMethodAssignments(source), modified = snippet;
                  _.each(["assign", "createCallback", "forIn", "forOwn", "isPlainObject", "unzip", "zipObject"], function(methodName)  {
                        if (! useLodashMethod(methodName))  {
                           modified = modified.replace(RegExp("^(?: *//.*\s*)* *lodash\." + methodName + " *=.+\n", "m"), "");
                        }
                     }
                  );
                  source = source.replace(snippet, function()  {
                        return modified;
                     }
                  );
               }
();
            }
         }
          else  {
            source = removeFromCreateIterator(source, "support");
            source = source.replace(getIteratorTemplate(source), function(match)  {
                  var indent = getIndent(match), snippet = cleanupCompiled(getFunctionSource(lodash._iteratorTemplate, indent));
                  iteratorOptions.forEach(function(prop)  {
                        if (prop !== "support")  {
                           snippet = snippet.replace(RegExp("([^\w.])\b" + prop + "\b", "g"), "$1obj." + prop);
                        }
                     }
                  );
                  snippet = snippet.replace(/var __t.+/, "var __p = '';").replace(/function print[^}]+}/, "").replace(/'(?:\\n|\s)+'/g, "''").replace(/__p *\+= *' *';/g, "").replace(/\s*\+\s*'';/g, ";").replace(/(__p *\+= *)' *' *\+/g, "$1").replace(/\(\(__t *= *\( *([\s\S]+?) *\)\) *== *null *\? *'' *: *__t\)/g, "($1)");
                  snippet = snippet.replace(/ *with *\(.+?\) *{/, "
").replace(/}([^}]*}[^}]*$)/, "$1");
                  snippet = snippet.replace(/obj\s*\|\|\s*\(obj *= *{}\);/, "").replace(/var __p = '';\s*__p \+=/, "var __p =");
                  snippet = snippet.replace(/\s*\/\/.*(?:\n|$)/g, "");
                  return indent + "var iteratorTemplate = " + snippet + ";
";
               }
            );
         }
      }
      function()  {
         if (isIIFE)  {
            var token = "%output%", index = iife.indexOf(token);
            source = source.match(/^\/\**[\s\S]+?\*\/\n/) + iife.slice(0, index) + source.replace(/^[\s\S]+?\(function[^{]+?{|}\(this\)\)[;\s]*$/g, "") + iife.slice(index + token.length);
         }
      }
();
      function()  {
         if (! isAMD)  {
            source = source.replace(/(?: *\/\/.*\n)*( *)if *\(typeof +define[\s\S]+?else /, "$1");
         }
         if (! isNode)  {
            source = source.replace(/(?: *\/\/.*\n)*( *)if *\(freeModule[\s\S]+?else *{([\s\S]+?\n)\1}\n+/, "$1$2");
         }
         if (! isCommonJS)  {
            source = source.replace(/(?: *\/\/.*\n)*(?:( *)else *{)?\s*freeExports\.\w+ *=[\s\S]+?(?:\n\1})?\n+/, "");
         }
         if (! isGlobal)  {
            source = source.replace(/(?:( *)(})? *else(?: *if *\(_\))? *{)?(?:\s*\/\/.*)*\s*(?:window\._|_\.templates) *=[\s\S]+?(?:\n\1})?\n+/g, "$1$2
");
         }
         if (isAMD && isGlobal)  {
            source = source.replace(/(?: *\/\/.*\n)* *(?:else )?if *\(freeExports.*?\) *{\s*}\n+/, "");
         }
          else  {
            source = source.replace(/(?: *\/\/.*\n)* *(?:else )?if *\(freeExports.*?\) *{\s*}(?:\s*else *{([\s\S]+?) *})?\n+/, "$1
");
         }
      }
();
      if (! isTemplate)  {
         if (isRemoved(source, "clone"))  {
            source = removeVar(source, "cloneableClasses");
            source = removeVar(source, "ctorByClass");
         }
         if (isRemoved(source, "clone", "isEqual", "isPlainObject"))  {
            source = removeSupportNodeClass(source);
         }
         if (isRemoved(source, "createIterator"))  {
            source = removeVar(source, "defaultsIteratorOptions");
            source = removeVar(source, "eachIteratorOptions");
            source = removeVar(source, "forOwnIteratorOptions");
            source = removeVar(source, "iteratorTemplate");
            source = removeVar(source, "templateIterator");
            source = removeSupportNonEnumShadows(source);
         }
         if (isRemoved(source, "createIterator", "bind", "keys"))  {
            source = removeSupportProp(source, "fastBind");
            source = removeVar(source, "isV8");
            source = removeVar(source, "nativeBind");
         }
         if (isRemoved(source, "createIterator", "keys"))  {
            source = removeVar(source, "nativeKeys");
            source = removeKeysOptimization(source);
            source = removeSupportNonEnumArgs(source);
         }
         if (isRemoved(source, "defer"))  {
            source = removeSetImmediate(source);
         }
         if (isRemoved(source, "escape", "unescape"))  {
            source = removeVar(source, "htmlEscapes");
            source = removeVar(source, "htmlUnescapes");
         }
         if (isRemoved(source, "getArray", "releaseArray"))  {
            source = removeVar(source, "arrayPool");
         }
         if (isRemoved(source, "getObject", "releaseObject"))  {
            source = removeVar(source, "objectPool");
         }
         if (isRemoved(source, "releaseArray", "releaseObject"))  {
            source = removeVar(source, "maxPoolSize");
         }
         if (isRemoved(source, "invert"))  {
            source = replaceVar(source, "htmlUnescapes", "{'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#x27;':"'"}");
         }
         if (isRemoved(source, "isArguments"))  {
            source = replaceSupportProp(source, "argsClass", "true");
         }
         if (isRemoved(source, "isArguments", "isEmpty"))  {
            source = removeSupportArgsClass(source);
         }
         if (isRemoved(source, "isArray"))  {
            source = removeVar(source, "nativeIsArray");
            source = removeIsArrayFallback(source);
         }
         if (isRemoved(source, "isPlainObject"))  {
            source = removeFunction(source, "shimIsPlainObject");
            source = removeVar(source, "getPrototypeOf");
            source = removeSupportOwnLast(source);
         }
         if (isRemoved(source, "keys"))  {
            source = removeFunction(source, "shimKeys");
         }
         if (isRemoved(source, "mixin"))  {
            source = source.replace(/^( *)mixin\(lodash\).+/m, function(match, indent)  {
                  if (isRemoved(source, "forOwn"))  {
                     return "";
                  }
                  return indent + ["forOwn(lodash, function(func, methodName) {", "  lodash[methodName] = func;", "", "  lodash.prototype[methodName] = function() {", "    var value = this.__wrapped__,", "        args = [value];", "", "    push.apply(args, arguments);", "    var result = func.apply(lodash, args);", "    return (value && typeof value == 'object' && value == result)", "      ? this", "      : new lodashWrapper(result);", "  };", "});"].join("
" + indent);
               }
            );
         }
         if (isRemoved(source, "parseInt"))  {
            source = removeVar(source, "nativeParseInt");
            source = removeVar(source, "reLeadingSpacesAndZeros");
            source = removeVar(source, "whitespace");
         }
         if (isRemoved(source, "sortBy"))  {
            _.each([removeFromGetObject, removeFromReleaseObject], function(func)  {
                  source = func(source, "criteria");
                  source = func(source, "index");
                  source = func(source, "value");
               }
            );
         }
         if (isRemoved(source, "template"))  {
            source = source.replace(/(?:\n +\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\/)?\n *lodash\.templateSettings[\s\S]+?};\n/, "");
         }
         if (isRemoved(source, "throttle"))  {
            _.each(["leading", "maxWait", "trailing"], function(prop)  {
                  source = removeFromGetObject(source, prop);
               }
            );
         }
         if (isRemoved(source, "value"))  {
            source = removeFunction(source, "chain");
            source = removeFunction(source, "wrapperToString");
            source = removeFunction(source, "wrapperValueOf");
            source = removeSupportSpliceObjects(source);
            source = removeLodashWrapper(source);
            source = replaceFunction(source, "lodash", ["function lodash() {", "  // no operation performed", "}"].join("
"));
            source = replaceFunction(source, "mixin", ["function mixin(object) {", "  forEach(functions(object), function(methodName) {", "    lodash[methodName] = object[methodName];", "  });", "}"].join("
"));
            source = source.replace(/(?:\s*\/\/.*)*\n( *)forOwn\(lodash, *function\(func, *methodName\)[\s\S]+?\n\1}.+/g, "").replace(/(?:\s*\/\/.*)*\n( *)(?:basicEach|forEach)\(\['[\s\S]+?\n\1}.+/g, "").replace(/(?:\s*\/\/.*)*\n *lodash\.prototype.[\s\S]+?;/g, "");
         }
         _.each(["createObject", "isArguments", "isArray", "isFunction"], function(methodName)  {
               if (_.size(source.match(RegExp(methodName + "\(", "g"))) < 2)  {
                  source = eval("remove" + capitalize(methodName) + "Fallback")(source);
               }
            }
         );
         if (! /\bbasicEach\(/.test(source))  {
            source = removeFunction(source, "basicEach");
         }
         if (_.size(source.match(/[^.]slice\(/g)) < 2)  {
            source = removeFunction(source, "slice");
         }
         if (! /^ *support\.(?:enumErrorProps|nonEnumShadows) *=/m.test(source))  {
            source = removeVar(source, "Error");
            source = removeVar(source, "errorProto");
            source = removeFromCreateIterator(source, "errorClass");
            source = removeFromCreateIterator(source, "errorProto");
            source = source.replace(/^ *var contextProps *=[\s\S]+?;/m, function(match)  {
                  return match.replace(/'Error', */, "");
               }
            );
         }
         source = source.replace(/^ *\(function[\s\S]+?\n(( *)var ctor *= *function[\s\S]+?(?:\n *for.+)+\n)([\s\S]+?)}\(1\)\);\n/m, function(match, setup, indent, body)  {
               var modified = setup;
               if (! /support\.spliceObjects *=(?! *(?:false|true))/.test(match))  {
                  modified = modified.replace(/^ *object *=.+\n/m, "");
               }
               if (! /support\.enumPrototypes *=(?! *(?:false|true))/.test(match) && ! /support\.nonEnumShadows *=(?! *(?:false|true))/.test(match) && ! /support\.ownLast *=(?! *(?:false|true))/.test(match))  {
                  modified = modified.replace(/\bctor *=.+\s+/, "").replace(/^ *ctor\.prototype.+\s+.+\n/m, "").replace(/(?:,\n)? *props *=[^;=]+/, "").replace(/^ *for *\((?=prop)/, "$&var ");
               }
               if (! /support\.nonEnumArgs *=(?! *(?:false|true))/.test(match))  {
                  modified = modified.replace(/^ *for *\(.+? arguments.+\n/m, "");
               }
               modified = modified.replace(/^ *var;\n/m, "");
               return /^\s*$/.test(modified) ? body.replace(RegExp("^" + indent, "gm"), indent.slice(0, - 2)) : match.replace(setup, modified);
            }
         );
      }
      if (_.size(source.match(/\bfreeModule\b/g)) < 2)  {
         source = removeVar(source, "freeModule");
      }
      if (_.size(source.match(/\bfreeExports\b/g)) < 2)  {
         source = removeVar(source, "freeExports");
      }
      debugSource = cleanupSource(source);
      source = debugSource;
      var outputUsed = false;
      var isCustom = isLegacy || isMapped || isModern || isNoDep || isStrict || isUnderscore || outputPath || /(?:category|exclude|exports|iife|include|minus|plus)=.*$/.test(options) || ! _.isEqual(exportsOptions, exportsAll);
      var basename = outputPath ? path.basename(outputPath, ".js") : "lodash" + isTemplate ? ".template" : isCustom ? ".custom" : "";
      dependencyMap = dependencyBackup;
      if (! isMinify && isCustom || isDebug || isTemplate)  {
         if (isCustom)  {
            debugSource = addCommandsToHeader(debugSource, options);
         }
         if (isDebug && isStdOut)  {
            stdout.write(debugSource);
            callback( {
                  source:debugSource               }
            );
         }
          else if (! isStdOut)  {
            filePath = outputPath || path.join(cwd, basename + ".js");
            outputUsed = true;
            callback( {
                  source:debugSource, 
                  outputPath:filePath               }
            );
         }
      }
      if (! isDebug)  {
         if (outputPath && outputUsed)  {
            outputPath = path.join(path.dirname(outputPath), path.basename(outputPath, ".js") + ".min.js");
         }
          else if (! outputPath)  {
            outputPath = path.join(cwd, basename + ".min.js");
         }
         minify(source,  {
               filePath:filePath, 
               isMapped:isMapped, 
               isSilent:isSilent, 
               isTemplate:isTemplate, 
               modes:isIIFE && ["simple", "hybrid"], 
               outputPath:outputPath, 
               sourceMapURL:sourceMapURL, 
               onComplete:function(data)  {
                  if (isCustom)  {
                     data.source = addCommandsToHeader(data.source, options);
                  }
                  if (isStdOut)  {
                     delete data.outputPath;
                     stdout.write(data.source);
                  }
                  callback(data);
               }} );
      }
   }
;
   if (module != require.main)  {
      module.exports = build;
   }
    else  {
      build(process.argv, function(data)  {
            var outputPath = data.outputPath, sourceMap = data.sourceMap;
            if (outputPath)  {
               fs.writeFileSync(outputPath, data.source, "utf8");
               if (sourceMap)  {
                  fs.writeFileSync(path.join(path.dirname(outputPath), path.basename(outputPath, ".js") + ".map"), sourceMap, "utf8");
               }
            }
         }
      );
   }
}
();
