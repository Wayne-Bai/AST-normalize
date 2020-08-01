! ✖ / env;
node;
function()  {
   "use strict";
   var fs = require("fs"), path = require("path"), vm = require("vm");
   var _ = require(path.join(__dirname, "lodash.js")), minify = require(path.join(__dirname, "build", "minify.js")), mkdirpSync = require(path.join(__dirname, "build", "mkdirp-sync.js"));
   path.sep || path.sep = process.platform == "win32" ? "\" : "/";
   var cwd = process.cwd();
   var arrayRef = [];
   var push = arrayRef.push;
   var reNode = RegExp("(?:^|" + path.sep + ")node(?:\.exe)?$");
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
      find:["detect"], 
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
      assign:["isArray", "keys"], 
      at:["isString"], 
      bind:["isFunction", "isObject"], 
      bindAll:["bind", "functions"], 
      bindKey:["isFunction", "isObject"], 
      clone:["assign", "forEach", "forOwn", "isArray", "isObject"], 
      cloneDeep:["clone"], 
      compact:[], 
      compose:[], 
      contains:["indexOf", "isString"], 
      countBy:["createCallback", "forEach"], 
      createCallback:["identity", "isEqual", "keys"], 
      debounce:[], 
      defaults:["isArray", "keys"], 
      defer:["bind"], 
      delay:[], 
      difference:["indexOf"], 
      escape:[], 
      every:["createCallback", "isArray"], 
      filter:["createCallback", "isArray"], 
      find:["createCallback", "forEach", "isArray"], 
      findIndex:["createCallback"], 
      findKey:["createCallback"], 
      first:[], 
      flatten:["createCallback", "isArray"], 
      forEach:["createCallback", "isArguments", "isArray", "isString", "keys"], 
      forIn:["createCallback", "isArguments"], 
      forOwn:["createCallback", "isArguments", "keys"], 
      functions:["forIn", "isFunction"], 
      groupBy:["createCallback", "forEach"], 
      has:[], 
      identity:[], 
      indexOf:["sortedIndex"], 
      initial:[], 
      intersection:["indexOf"], 
      invert:["keys"], 
      invoke:["forEach"], 
      isArguments:[], 
      isArray:[], 
      isBoolean:[], 
      isDate:[], 
      isElement:[], 
      isEmpty:["forOwn", "isArguments", "isFunction"], 
      isEqual:["forIn", "isArguments", "isFunction"], 
      isFinite:[], 
      isFunction:[], 
      isNaN:["isNumber"], 
      isNull:[], 
      isNumber:[], 
      isObject:[], 
      isPlainObject:["forIn", "isArguments", "isFunction"], 
      isRegExp:[], 
      isString:[], 
      isUndefined:[], 
      keys:["forOwn", "isArguments", "isObject"], 
      last:[], 
      lastIndexOf:[], 
      map:["createCallback", "isArray"], 
      max:["createCallback", "isArray", "isString"], 
      memoize:[], 
      merge:["forEach", "forOwn", "isArray", "isObject", "isPlainObject"], 
      min:["createCallback", "isArray", "isString"], 
      mixin:["forEach", "functions"], 
      noConflict:[], 
      omit:["forIn", "indexOf"], 
      once:[], 
      pairs:["keys"], 
      parseInt:["isString"], 
      partial:["isFunction", "isObject"], 
      partialRight:["isFunction", "isObject"], 
      pick:["forIn", "isObject"], 
      pluck:["map"], 
      random:[], 
      range:[], 
      reduce:["createCallback", "isArray"], 
      reduceRight:["createCallback", "forEach", "isString", "keys"], 
      reject:["createCallback", "filter"], 
      rest:[], 
      result:["isFunction"], 
      runInContext:["defaults", "pick"], 
      shuffle:["forEach"], 
      size:["keys"], 
      some:["createCallback", "isArray"], 
      sortBy:["createCallback", "forEach"], 
      sortedIndex:["createCallback", "identity"], 
      tap:["value"], 
      template:["defaults", "escape", "keys", "values"], 
      throttle:[], 
      times:["createCallback"], 
      toArray:["isString", "values"], 
      unescape:[], 
      union:["uniq"], 
      uniq:["createCallback", "indexOf"], 
      uniqueId:[], 
      value:["forOwn", "isArray"], 
      values:["keys"], 
      where:["filter"], 
      without:["indexOf"], 
      wrap:[], 
      zip:["max", "pluck"], 
      zipObject:[], 
      chain:["value"], 
      findWhere:["where"]   }
;
   var iteratorOptions = ["args", "arrays", "bottom", "firstArg", "init", "loop", "shadowedProps", "top", "useHas", "useKeys"];
   var allMethods = _.keys(dependencyMap);
   var backboneDependencies = ["bind", "bindAll", "chain", "clone", "contains", "countBy", "defaults", "escape", "every", "extend", "filter", "find", "first", "forEach", "groupBy", "has", "indexOf", "initial", "invert", "invoke", "isArray", "isEmpty", "isEqual", "isFunction", "isObject", "isRegExp", "isString", "keys", "last", "lastIndexOf", "map", "max", "min", "mixin", "omit", "once", "pairs", "pick", "reduce", "reduceRight", "reject", "rest", "result", "shuffle", "size", "some", "sortBy", "sortedIndex", "toArray", "uniqueId", "value", "values", "without"];
   var underscoreMethods = _.without.apply(_, [allMethods].concat(["at", "bindKey", "cloneDeep", "createCallback", "findIndex", "findKey", "forIn", "forOwn", "isPlainObject", "merge", "parseInt", "partialRight", "runInContext"]));
   var exportsAll = ["amd", "commonjs", "global", "node"];
   path.sep || path.sep = process.platform == "win32" ? "\" : "/";
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
      source = source.replace(getMethodAssignments(source), function(match)  {
            return match.replace(/^(?: *\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\/\n)?( *)lodash\.VERSION *=/m, "$1lodash.chain = chain;

$&");
         }
      );
      source = source.replace(/^( *)lodash\.prototype\.value *=.+\n/m, "$1lodash.prototype.chain = wrapperChain;
$&");
      source = source.replace(/^ *lodash\.prototype\.(?:toString|valueOf) *=.+\n/gm, "");
      source = source.replace(/(?:\s*\/\/.*)*\n( *)forOwn\(lodash, *function\(func, *methodName\)[\s\S]+?\n\1}.+/g, "");
      source = source.replace(/(?:\s*\/\/.*)*\n( *)mixin\(lodash\).+/, "");
      source = source.replace(getMethodAssignments(source), function(match)  {
            var indent = /^ *(?=lodash\.)/m.exec(match)[0];
            return match + ["", "", "// add functions to `lodash.prototype`", "mixin(lodash);"].join("
" + indent);
         }
      );
      source = replaceFunction(source, "mixin", ["function mixin(object) {", "  forEach(functions(object), function(methodName) {", "    var func = lodash[methodName] = object[methodName];", "", "    lodash.prototype[methodName] = function() {", "      var args = [this.__wrapped__];", "      push.apply(args, arguments);", "", "      var result = func.apply(lodash, args);", "      if (this.__chain__) {", "        result = new lodashWrapper(result);", "        result.__chain__ = true;", "      }", "      return result;", "    };", "  });", "}"].join("
"));
      source = source.replace(/^(?: *\/\/.*\n)*( *)each\(\['[\s\S]+?\n\1}$/m, function(match, indent)  {
            return indent + ["// add `Array` mutator functions to the wrapper", "each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(methodName) {", "  var func = arrayRef[methodName];", "  lodash.prototype[methodName] = function() {", "    var value = this.__wrapped__;", "    func.apply(value, arguments);", "", "    // avoid array-like object bugs with `Array#shift` and `Array#splice`", "    // in Firefox < 10 and IE < 9", "    if (!support.spliceObjects && value.length === 0) {", "      delete value[0];", "    }", "    return this;", "  };", "});", "", "// add `Array` accessor functions to the wrapper", "each(['concat', 'join', 'slice'], function(methodName) {", "  var func = arrayRef[methodName];", "  lodash.prototype[methodName] = function() {", "    var value = this.__wrapped__,", "        result = func.apply(value, arguments);", "", "    if (this.__chain__) {", "      result = new lodashWrapper(result);", "      result.__chain__ = true;", "    }", "    return result;", "  };", "});"].join("
" + indent);
         }
      );
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
      var source = [";(function(window) {", "  var freeExports = typeof exports == 'object' && typeof require == 'function' && exports;", "", "  var freeModule = typeof module == 'object' && module && module.exports == freeExports && module;", "", "  var freeGlobal = typeof global == 'object' && global;", "  if (freeGlobal.global === freeGlobal) {", "    window = freeGlobal;", "  }", "", "  var templates = {},", "      _ = window._;", ""];
      pattern = RegExp(path.basename(pattern).replace(/[.+?^=!:${}()|[\]\/\\]/g, "\$&").replace(/\*/g, ".*?") + "$");
      fs.readdirSync(directory).forEach(function(filename)  {
            var filePath = path.join(directory, filename);
            if (pattern.test(filename))  {
               var text = fs.readFileSync(filePath, "utf8"), precompiled = getFunctionSource(_.template(text, null, options)), prop = filename.replace(/\..*$/, "");
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
      return string[0].toUpperCase() + string.toLowerCase().slice(1);
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
      console.log(["", "  Commands:", "", "    lodash backbone      Build with only methods required by Backbone", "    lodash csp           Build supporting default Content Security Policy restrictions", "    lodash legacy        Build tailored for older environments without ES5 support", "    lodash modern        Build tailored for newer environments with ES5 support", "    lodash mobile        Build without method compilation and most bug fixes for old browsers", "    lodash strict        Build with `_.assign`, `_.bindAll`, & `_.defaults` in strict mode", "    lodash underscore    Build tailored for projects already using Underscore", "    lodash include=...   Comma separated method/category names to include in the build", "    lodash minus=...     Comma separated method/category names to remove from those included in the build", "    lodash plus=...      Comma separated method/category names to add to those included in the build", "    lodash category=...  Comma separated categories of methods to include in the build (case-insensitive)", "                         (i.e. “arrays”, “chaining”, “collections”, “functions”, “objects”, and “utilities”)", "    lodash exports=...   Comma separated names of ways to export the `lodash` function", "                         (i.e. “amd”, “commonjs”, “global”, “node”, and “none”)", "    lodash iife=...      Code to replace the immediately-invoked function expression that wraps Lo-Dash", "                         (e.g. `lodash iife="!function(window){%output%}(this)"`)", "", "    lodash template=...  File path pattern used to match template files to precompile", "                         (e.g. `lodash template=./*.jst`)", "    lodash settings=...  Template settings used when precompiling templates", "                         (e.g. `lodash settings="{interpolate:/{{([\s\S]+?)}}/g}"`)", "    lodash moduleId=...  The AMD module ID of Lo-Dash, which defaults to “lodash”, used by precompiled templates", "", "    All arguments, except `legacy` with `csp`, `mobile`, `modern`, or `underscore`, may be combined.", "    Unless specified by `-o` or `--output`, all files created are saved to the current working directory.", "", "  Options:", "", "    -c, --stdout      Write output to standard output", "    -d, --debug       Write only the non-minified development output", "    -h, --help        Display help information", "    -m, --minify      Write only the minified production output", "    -o, --output      Write output to a given path/filename", "    -p, --source-map  Generate a source map for the minified output, using an optional source map URL", "    -s, --silent      Skip status updates normally logged to the console", "    -V, --version     Output current version of Lo-Dash", ""].join("
"));
   }
;
   function getAliases(methodName)  {
      return realToAliasMap[methodName] || [];
   }
;
   function getCategory(source, methodName)  {
      var result = /@category +(\w+)/.exec(matchFunction(source, methodName));
      return result ? result[1] : "";
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
      return _.reduce(dependencyMap, function(result, dependencies, otherName)  {
            if (_.contains(dependencies, methodName))  {
               result.push(otherName);
            }
            return result;
         }, 
         []);
   }
;
   function getDependencies(methodName, stack)  {
      var dependencies = Array.isArray(methodName) ? methodName : dependencyMap[methodName];
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
      return source.match(/(?:\s*\/\/.*)*\n( *)if *\((?:!support\.argsClass|!isArguments)[\s\S]+?};\n\1}/) || [""][0];
   }
;
   function getIsFunctionFallback(source)  {
      return source.match(/(?:\s*\/\/.*)*\n( *)if *\(isFunction\(\/x\/[\s\S]+?};\n\1}/) || [""][0];
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
      return aliasToRealMap[methodName] || methodName;
   }
;
   function isRemoved(source)  {
      return slice.call(arguments, 1).every(function(funcName)  {
            return ! matchFunction(source, funcName) || RegExp("^ *lodash\.prototype\." + funcName + " *=.+", "m").test(source);
         }
      );
   }
;
   function matchFunction(source, funcName)  {
      var result = source.match(RegExp("(?:\n +/\*[^*]*\*+(?:[^/][^*]*\*+)*/)?\n" + "( *)(?:" + "function " + funcName + "\b[\s\S]+?\n\1}|" + "var " + funcName + " *=.*?function[\s\S]+?\n\1};" + ")\n"));
      result || result = source.match(RegExp("(?:\n +/\*[^*]*\*+(?:[^/][^*]*\*+)*/)?\n" + " *var " + funcName + " *=(?:.+?|.*?createIterator\([\s\S]+?\));\n"));
      return /@type +Function|function\s*\w*\(/.test(result) ? result[0] : "";
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
      var modified = snippet.replace(RegExp("^(?: *\/\/.*\n)* *'" + identifier + "':.+\n+", "m"), "").replace(/,(?=\s*})/, "");
      source = source.replace(snippet, function()  {
            return modified;
         }
      );
      snippet = modified.match(/Function\([\s\S]+$/)[0];
      modified = snippet.replace(RegExp("\b" + identifier + "\b,? *", "g"), "").replace(/, *(?=',)/, "").replace(/,(?=\s*\))/, "");
      source = source.replace(snippet, function()  {
            return modified;
         }
      );
      return source;
   }
;
   function removeFunction(source, funcName)  {
      var snippet;
      if (funcName == "runInContext")  {
         source = removeRunInContext(source, funcName);
      }
       else if (funcName != "each" && snippet = matchFunction(source, funcName))  {
         source = source.replace(snippet, "");
      }
      snippet = getMethodAssignments(source);
      source = source.replace(RegExp("^ *lodash\.prototype\." + funcName + " *=.+\n", "m"), "");
      var modified = getAliases(funcName).concat(funcName).reduce(function(result, otherName)  {
            return result.replace(RegExp("^(?: *//.*\s*)* *lodash\." + otherName + " *=.+\n", "m"), "");
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
   function removeIsFunctionFallback(source)  {
      return source.replace(getIsFunctionFallback(source), "");
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
      source = source.replace(matchFunction(source, "isArray"), function(match)  {
            return match.replace(/\(support\.argsObject && *([^)]+)\)/g, "$1");
         }
      );
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
   function removeSupportEnumPrototypes(source)  {
      source = removeSupportProp(source, "enumPrototypes");
      source = source.replace(matchFunction(source, "keys"), function(match)  {
            return match.replace(/\(support\.enumPrototypes[^)]+\)(?:\s*\|\|\s*)?/, "").replace(/\s*if *\(\s*\)[^}]+}/, "");
         }
      );
      source = source.replace(getIteratorTemplate(source), function(match)  {
            return match.replace(/(?: *\/\/.*\n)* *["'] *(?:<% *)?if *\(support\.enumPrototypes *(?:&&|\))[\s\S]+?<% *} *(?:%>|["']).+/g, "").replace(/support\.enumPrototypes\s*\|\|\s*/g, "");
         }
      );
      return source;
   }
;
   function removeSupportNodeClass(source)  {
      source = removeFunction(source, "isNode");
      source = removeSupportProp(source, "nodeClass");
      source = source.replace(matchFunction(source, "shimIsPlainObject"), function(match)  {
            return match.replace(/ *&& *\(support\.nodeClass[\s\S]+?\)\)/, "");
         }
      );
      source = source.replace(matchFunction(source, "clone"), function(match)  {
            return match.replace(/\s*\|\|\s*\(!support\.nodeClass[\s\S]+?\)\)/, "");
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
            return match.replace(/(?:\s*\|\|\s*)?\(support\.nonEnumArgs[^)]+\)\)/, "").replace(/\s*if *\(\s*\)[^}]+}/, "");
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
      source = removeVar(source, "shadowedProps");
      source = removeFromCreateIterator(source, "shadowedProps");
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
            return match.replace(/'if *\(<%= *arrays *%>[^']*/, "$&\n").replace(/(?: *\/\/.*\n)* *["']( *)<% *if *\(support\.unindexedChars[\s\S]+?["']\1<% *} *%>.+/, "");
         }
      );
      return source;
   }
;
   function removeRunInContext(source)  {
      source = removeVar(source, "contextProps");
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
      return source.replace(RegExp("(?:\n +/\*[^*]*\*+(?:[^/][^*]*\*+)*/)?\n" + "(?: *try\b.+\n)?" + " *support\." + propName + " *=.+\n" + "(?:( *).+?catch\b[\s\S]+?\n\1}\n)?"), "");
   }
;
   function removeVar(source, varName)  {
      if (/^(?:cloneableClasses|contextProps|ctorByClass|shadowedProps)$/.test(varName))  {
         source = source.replace(RegExp("(var " + varName + " *=)[\s\S]+?\n\n"), "$1=null;

");
      }
      source = removeFunction(source, varName);
      source = source.replace(RegExp("(?:\n +/\*[^*]*\*+(?:[^/][^*]*\*+)*/)?\n" + "( *)var " + varName + " *= *(?:.+?(?:;|&&\n[^;]+;)|(?:\w+\(|{)[\s\S]+?\n\1.+?;)\n|" + "^ *" + varName + " *=.+?,\n", "m"), "");
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
            var result = _.contains(["backbone", "csp", "legacy", "mobile", "modern", "modularize", "strict", "underscore", "-c", "--stdout", "-d", "--debug", "-h", "--help", "-m", "--minify", "-o", "--output", "-p", "--source-map", "-s", "--silent", "-V", "--version"], value);
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
            var match = value.match(/iife=(.*)/);
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
      var isMobile = isCSP || _.contains(options, "mobile");
      var isModern = isMobile || _.contains(options, "modern");
      var isModularize = _.contains(options, "modularize");
      var isStdOut = _.contains(options, "-c") || _.contains(options, "--stdout");
      var isSilent = isStdOut || _.contains(options, "-s") || _.contains(options, "--silent");
      var isStrict = _.contains(options, "strict");
      var isUnderscore = isBackbone || _.contains(options, "underscore");
      var isLegacy = ! isModern || isUnderscore && _.contains(options, "legacy");
      var exportsOptions = options.reduce(function(result, value)  {
            return /exports/.test(value) ? optionToArray(value).sort() : result;
         }, 
         isUnderscore ? ["commonjs", "global", "node"] : exportsAll.slice());
      var moduleId = options.reduce(function(result, value)  {
            var match = value.match(/moduleId=(.*)/);
            return match ? match[1] : result;
         }, 
         "lodash");
      var outputPath = options.reduce(function(result, value, index)  {
            if (/-o|--output/.test(value))  {
               result = options[index + 1];
               var dirname = path.dirname(result);
               mkdirpSync(dirname);
               result = path.join(fs.realpathSync(dirname), path.basename(result));
            }
            return result;
         }, 
         "");
      var templatePattern = options.reduce(function(result, value)  {
            var match = value.match(/template=(.+)$/);
            return match ? path.join(fs.realpathSync(path.dirname(match[1])), path.basename(match[1])) : result;
         }, 
         "");
      var templateSettings = options.reduce(function(result, value)  {
            var match = value.match(/settings=(.+)$/);
            return match ? _.assign(result, Function("return {" + match[1].replace(/^{|}$/g, "") + "}")()) : result;
         }, 
         _.assign(_.clone(_.templateSettings),  {
               moduleId:moduleId            }
         ));
      var isTemplate = ! ! templatePattern;
      var source = fs.readFileSync(filePath, "utf8");
      var useUnderscoreClone = isUnderscore;
      var exposeAssign = ! isUnderscore, exposeCreateCallback = ! isUnderscore, exposeForIn = ! isUnderscore, exposeForOwn = ! isUnderscore, exposeIsPlainObject = ! isUnderscore, exposeZipObject = ! isUnderscore;
      var isAMD = _.contains(exportsOptions, "amd"), isCommonJS = _.contains(exportsOptions, "commonjs"), isGlobal = _.contains(exportsOptions, "global"), isNode = _.contains(exportsOptions, "node");
      var buildMethods = ! isTemplate && function()  {
         var result;
         var includeMethods = options.reduce(function(accumulator, value)  {
               return /include/.test(value) ? _.union(accumulator, optionToMethodsArray(source, value)) : accumulator;
            }, 
            []);
         var minusMethods = options.reduce(function(accumulator, value)  {
               return /exclude|minus/.test(value) ? _.union(accumulator, optionToMethodsArray(source, value)) : accumulator;
            }, 
            []);
         var plusMethods = options.reduce(function(accumulator, value)  {
               return /plus/.test(value) ? _.union(accumulator, optionToMethodsArray(source, value)) : accumulator;
            }, 
            []);
         var categories = options.reduce(function(accumulator, value)  {
               if (/category|exclude|include|minus|plus/.test(value))  {
                  var array = optionToArray(value);
                  accumulator = _.union(accumulator, /category/.test(value) ? array : array.filter(function(category)  {
                           return /^[A-Z]/.test(category);
                        }
                     ));
               }
               return accumulator;
            }, 
            []);
         if (isUnderscore)  {
            var methods = _.without.apply(_, [_.union(includeMethods, plusMethods)].concat(minusMethods));
            exposeAssign = _.contains(methods, "assign");
            exposeCreateCallback = _.contains(methods, "createCallback");
            exposeForIn = _.contains(methods, "forIn");
            exposeForOwn = _.contains(methods, "forOwn");
            exposeIsPlainObject = _.contains(methods, "isPlainObject");
            exposeZipObject = _.contains(methods, "zipObject");
            methods = _.without.apply(_, [plusMethods].concat(minusMethods));
            useUnderscoreClone = ! _.contains(methods, "clone") && ! _.contains(methods, "cloneDeep");
         }
         if (isLegacy)  {
            dependencyMap.defer = _.without(dependencyMap.defer, "bind");
         }
         if (isModern)  {
            dependencyMap.isEmpty = _.without(dependencyMap.isEmpty, "isArguments");
            dependencyMap.isEqual = _.without(dependencyMap.isEqual, "isArguments");
            dependencyMap.isPlainObject = _.without(dependencyMap.isPlainObject, "isArguments");
            dependencyMap.keys = _.without(dependencyMap.keys, "isArguments");
            dependencyMap.reduceRight = _.without(dependencyMap.reduceRight, "isString");
         }
         if (isUnderscore)  {
            dependencyMap.contains = _.without(dependencyMap.contains, "isString");
            dependencyMap.createCallback = _.without(dependencyMap.createCallback, "isEqual");
            dependencyMap.flatten = _.without(dependencyMap.flatten, "createCallback");
            dependencyMap.isEmpty = ["isArray", "isString"];
            dependencyMap.isEqual = _.without(dependencyMap.isEqual, "forIn", "isArguments");
            dependencyMap.max = _.without(dependencyMap.max, "isArray", "isString");
            dependencyMap.min = _.without(dependencyMap.min, "isArray", "isString");
            dependencyMap.pick = _.without(dependencyMap.pick, "forIn", "isObject");
            dependencyMap.reduceRight = _.without(dependencyMap.reduceRight, "isString");
            dependencyMap.template = _.without(dependencyMap.template, "keys", "values");
            dependencyMap.toArray.push("isArray", "map");
            dependencyMap.value = _.without(dependencyMap.value, "isArray");
            dependencyMap.where.push("find", "isEmpty");
            if (useUnderscoreClone)  {
               dependencyMap.clone = _.without(dependencyMap.clone, "forEach", "forOwn");
            }
         }
         if (isModern || isUnderscore)  {
            dependencyMap.at = _.without(dependencyMap.at, "isString");
            dependencyMap.forEach = _.without(dependencyMap.forEach, "isArguments", "isString");
            dependencyMap.forIn = _.without(dependencyMap.forIn, "isArguments");
            dependencyMap.forOwn = _.without(dependencyMap.forOwn, "isArguments");
            dependencyMap.toArray = _.without(dependencyMap.toArray, "isString");
            if (! isMobile)  {
               dependencyMap.every = _.without(dependencyMap.every, "isArray");
               dependencyMap.find = _.without(dependencyMap.find, "isArray");
               dependencyMap.filter = _.without(dependencyMap.filter, "isArray");
               dependencyMap.forEach = _.without(dependencyMap.forEach, "isArray");
               dependencyMap.map = _.without(dependencyMap.map, "isArray");
               dependencyMap.max.push("forEach");
               dependencyMap.min.push("forEach");
               dependencyMap.reduce = _.without(dependencyMap.reduce, "isArray");
            }
         }
         if (includeMethods.length)  {
            result = getDependencies(includeMethods);
         }
         if (isBackbone && ! result)  {
            result = getDependencies(backboneDependencies);
         }
          else if (isUnderscore && ! result)  {
            result = getDependencies(underscoreMethods);
         }
         if (categories.length)  {
            result = _.union(result || [], getDependencies(categories.reduce(function(accumulator, category)  {
                        var methodNames = getMethodsByCategory(source, capitalize(category));
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
                     [])));
         }
         if (! result)  {
            result = allMethods.slice();
         }
         if (plusMethods.length)  {
            result = _.union(result, getDependencies(plusMethods));
         }
         if (minusMethods.length)  {
            result = _.without.apply(_, [result].concat(minusMethods, getDependants(minusMethods)));
         }
         return result;
      }
();
      var lodash = ! isTemplate && function()  {
         var context = vm.createContext( {
               clearTimeout:clearTimeout, 
               console:console, 
               setTimeout:setTimeout            }
         );
         source = setUseStrictOption(source, isStrict);
         if (isLegacy)  {
            _.each(["getPrototypeOf", "nativeBind", "nativeIsArray", "nativeKeys"], function(varName)  {
                  source = replaceVar(source, varName, "false");
               }
            );
            _.each(["argsClass", "fastBind"], function(propName)  {
                  source = replaceSupportProp(source, propName, "false");
               }
            );
            source = removeKeysOptimization(source);
         }
         if (isMobile || isUnderscore)  {
            source = removeKeysOptimization(source);
            source = removeSetImmediate(source);
         }
         if (isModern || isUnderscore)  {
            source = removeSupportNonEnumShadows(source);
            source = removeSupportEnumPrototypes(source);
            source = removeSupportOwnLast(source);
            source = removeSupportUnindexedChars(source);
            source = removeSupportNodeClass(source);
            if (! isMobile)  {
               source = removeSupportNonEnumArgs(source);
               source = replaceFunction(source, "forEach", ["function forEach(collection, callback, thisArg) {", "  var index = -1,", "      length = collection ? collection.length : 0;", "", "  callback = callback && typeof thisArg == 'undefined' ? callback : lodash.createCallback(callback, thisArg);", "  if (typeof length == 'number') {", "    while (++index < length) {", "      if (callback(collection[index], index, collection) === false) {", "        break;", "      }", "    }", "  } else {", "    each(collection, callback);", "  }", "  return collection;", "}"].join("
"));
               source = replaceFunction(source, "map", ["function map(collection, callback, thisArg) {", "  var index = -1,", "      length = collection ? collection.length : 0;", "", "  callback = lodash.createCallback(callback, thisArg);", "  if (typeof length == 'number') {", "    var result = Array(length);", "    while (++index < length) {", "      result[index] = callback(collection[index], index, collection);", "    }", "  } else {", "    result = [];", "    each(collection, function(value, key, collection) {", "      result[++index] = callback(value, key, collection);", "    });", "  }", "  return result;", "}"].join("
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
                              match = match.replace(/\beach\(/, "forEach(");
                              if (! isUnderscore)  {
                                 return match;
                              }
                           }
                           return match.replace(/^(( *)if *\(.*?\bisArray\([^\)]+\).*?\) *{\n)(( *)var index[^;]+.+\n+)/m, function(snippet, statement, indent, vars)  {
                                 vars = vars.replace(/\b(length *=)[^;]+/, "$1 collection" + methodName == "reduce" ? ".length" : " ? collection.length : 0").replace(RegExp("^  " + indent, "gm"), indent);
                                 return vars + statement.replace(/\bisArray\([^\)]+\)/, "typeof length == 'number'");
                              }
                           );
                        }
                     );
                  }
               );
               source = source.replace(/^( *)var eachIteratorOptions *= *[\s\S]+?\n\1};\n/m, function(match)  {
                     return match.replace(/(^ *'arrays':)[^,]+/m, "$1 false");
                  }
               );
            }
         }
         if (isModern)  {
            source = source.replace(matchFunction(source, "isPlainObject"), function(match)  {
                  return match.replace(/!getPrototypeOf[^:]+:\s*/, "");
               }
            );
            if (! isMobile)  {
               source = removeIsFunctionFallback(source);
            }
         }
         if (isUnderscore)  {
            source = replaceFunction(source, "assign", ["function assign(object) {", "  if (!object) {", "    return object;", "  }", "  for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {", "    var iterable = arguments[argsIndex];", "    if (iterable) {", "      for (var key in iterable) {", "        object[key] = iterable[key];", "      }", "    }", "  }", "  return object;", "}"].join("
"));
            if (useUnderscoreClone)  {
               source = replaceFunction(source, "clone", ["function clone(value) {", "  return isObject(value)", "    ? (isArray(value) ? slice(value) : assign({}, value))", "    : value;", "}"].join("
"));
            }
            source = replaceFunction(source, "contains", ["function contains(collection, target) {", "  var length = collection ? collection.length : 0,", "      result = false;", "  if (typeof length == 'number') {", "    result = indexOf(collection, target) > -1;", "  } else {", "    each(collection, function(value) {", "      return (result = value === target) && indicatorObject;", "    });", "  }", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "defaults", ["function defaults(object) {", "  if (!object) {", "    return object;", "  }", "  for (var argsIndex = 1, argsLength = arguments.length; argsIndex < argsLength; argsIndex++) {", "    var iterable = arguments[argsIndex];", "    if (iterable) {", "      for (var key in iterable) {", "        if (object[key] == null) {", "          object[key] = iterable[key];", "        }", "      }", "    }", "  }", "  return object;", "}"].join("
"));
            source = replaceFunction(source, "difference", ["function difference(array) {", "  var index = -1,", "      length = array.length,", "      flattened = concat.apply(arrayRef, arguments),", "      result = [];", "", "  while (++index < length) {", "    var value = array[index];", "    if (indexOf(flattened, value, length) < 0) {", "      result.push(value);", "    }", "  }", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "flatten", ["function flatten(array, isShallow) {", "  var index = -1,", "      length = array ? array.length : 0,", "      result = [];", "", "  while (++index < length) {", "    var value = array[index];", "    if (isArray(value)) {", "      push.apply(result, isShallow ? value : flatten(value));", "    } else {", "      result.push(value);", "    }", "  }", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "intersection", ["function intersection(array) {", "  var args = arguments,", "      argsLength = args.length,", "      index = -1,", "      length = array ? array.length : 0,", "      result = [];", "", "  outer:", "  while (++index < length) {", "    var value = array[index];", "    if (indexOf(result, value) < 0) {", "      var argsIndex = argsLength;", "      while (--argsIndex) {", "        if (indexOf(args[argsIndex], value) < 0) {", "          continue outer;", "        }", "      }", "      result.push(value);", "    }", "  }", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "isEmpty", ["function isEmpty(value) {", "  if (!value) {", "    return true;", "  }", "  if (isArray(value) || isString(value)) {", "    return !value.length;", "  }", "  for (var key in value) {", "    if (hasOwnProperty.call(value, key)) {", "      return false;", "    }", "  }", "  return true;", "}"].join("
"));
            source = replaceFunction(source, "isEqual", ["function isEqual(a, b, stackA, stackB) {", "  if (a === b) {", "    return a !== 0 || (1 / a == 1 / b);", "  }", "  var type = typeof a,", "      otherType = typeof b;", "", "  if (a === a &&", "      (!a || (type != 'function' && type != 'object')) &&", "      (!b || (otherType != 'function' && otherType != 'object'))) {", "    return false;", "  }", "  if (a == null || b == null) {", "    return a === b;", "  }", "  var className = toString.call(a),", "      otherClass = toString.call(b);", "", "  if (className != otherClass) {", "    return false;", "  }", "  switch (className) {", "    case boolClass:", "    case dateClass:", "      return +a == +b;", "", "    case numberClass:", "      return a != +a", "        ? b != +b", "        : (a == 0 ? (1 / a == 1 / b) : a == +b);", "", "    case regexpClass:", "    case stringClass:", "      return a == String(b);", "  }", "  var isArr = className == arrayClass;", "  if (!isArr) {", "    if (a instanceof lodash || b instanceof lodash) {", "      return isEqual(a.__wrapped__ || a, b.__wrapped__ || b, stackA, stackB);", "    }", "    if (className != objectClass) {", "      return false;", "    }", "    var ctorA = a.constructor,", "        ctorB = b.constructor;", "", "    if (ctorA != ctorB && !(", "          isFunction(ctorA) && ctorA instanceof ctorA &&", "          isFunction(ctorB) && ctorB instanceof ctorB", "        )) {", "      return false;", "    }", "  }", "  stackA || (stackA = []);", "  stackB || (stackB = []);", "", "  var length = stackA.length;", "  while (length--) {", "    if (stackA[length] == a) {", "      return stackB[length] == b;", "    }", "  }", "  var result = true,", "      size = 0;", "", "  stackA.push(a);", "  stackB.push(b);", "", "  if (isArr) {", "    size = b.length;", "    result = size == a.length;", "", "    if (result) {", "      while (size--) {", "        if (!(result = isEqual(a[size], b[size], stackA, stackB))) {", "          break;", "        }", "      }", "    }", "    return result;", "  }", "  forIn(b, function(value, key, b) {", "    if (hasOwnProperty.call(b, key)) {", "      size++;", "      return !(result = hasOwnProperty.call(a, key) && isEqual(a[key], value, stackA, stackB)) && indicatorObject;", "    }", "  });", "", "  if (result) {", "    forIn(a, function(value, key, a) {", "      if (hasOwnProperty.call(a, key)) {", "        return !(result = --size > -1) && indicatorObject;", "      }", "    });", "  }", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "lodash", ["function lodash(value) {", "  return (value instanceof lodash)", "    ? value", "    : new lodashWrapper(value);", "}"].join("
"));
            source = replaceFunction(source, "omit", ["function omit(object) {", "  var props = concat.apply(arrayRef, arguments),", "      result = {};", "", "  forIn(object, function(value, key) {", "    if (indexOf(props, key, 1) < 0) {", "      result[key] = value;", "    }", "  });", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "pick", ["function pick(object) {", "  var index = 0,", "      props = concat.apply(arrayRef, arguments),", "      length = props.length,", "      result = {};", "", "  while (++index < length) {", "    var prop = props[index];", "    if (prop in object) {", "      result[prop] = object[prop];", "    }", "  }", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "result", ["function result(object, property) {", "  var value = object ? object[property] : null;", "  return isFunction(value) ? object[property]() : value;", "}"].join("
"));
            source = replaceFunction(source, "template", ["function template(text, data, options) {", "  text || (text = '');", "  options = defaults({}, options, lodash.templateSettings);", "", "  var index = 0,", "      source = "__p += '",", "      variable = options.variable;", "", "  var reDelimiters = RegExp(", "    (options.escape || reNoMatch).source + '|' +", "    (options.interpolate || reNoMatch).source + '|' +", "    (options.evaluate || reNoMatch).source + '|$'", "  , 'g');", "", "  text.replace(reDelimiters, function(match, escapeValue, interpolateValue, evaluateValue, offset) {", "    source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);", "    if (escapeValue) {", "      source += "' +\n_.escape(" + escapeValue + ") +\n'";", "    }", "    if (evaluateValue) {", "      source += "';\n" + evaluateValue + ";\n__p += '";", "    }", "    if (interpolateValue) {", "      source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";", "    }", "    index = offset + match.length;", "    return match;", "  });", "", "  source += "';\n";", "  if (!variable) {", "    variable = 'obj';", "    source = 'with (' + variable + ' || {}) {\n' + source + '\n}\n';", "  }", "  source = 'function(' + variable + ') {\n' +", "    "var __t, __p = '', __j = Array.prototype.join;\n" +", "    "function print() { __p += __j.call(arguments, '') }\n" +", "    source +", "    'return __p\n}';", "", "  try {", "    var result = Function('_', 'return ' + source)(lodash);", "  } catch(e) {", "    e.source = source;", "    throw e;", "  }", "  if (data) {", "    return result(data);", "  }", "  result.source = source;", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "times", ["function times(n, callback, thisArg) {", "  var index = -1,", "      result = Array(n > -1 ? n : 0);", "", "  while (++index < n) {", "    result[index] = callback.call(thisArg, index);", "  }", "  return result;", "}"].join("
"));
            if (useUnderscoreClone)  {
               source = replaceFunction(source, "toArray", ["function toArray(collection) {", "  if (isArray(collection)) {", "    return slice(collection);", "  }", "  if (collection && typeof collection.length == 'number') {", "    return map(collection);", "  }", "  return values(collection);", "}"].join("
"));
            }
            source = replaceFunction(source, "uniq", ["function uniq(array, isSorted, callback, thisArg) {", "  var index = -1,", "      length = array ? array.length : 0,", "      result = [],", "      seen = result;", "", "  if (typeof isSorted != 'boolean' && isSorted != null) {", "    thisArg = callback;", "    callback = isSorted;", "    isSorted = false;", "  }", "  if (callback != null) {", "    seen = [];", "    callback = lodash.createCallback(callback, thisArg);", "  }", "  while (++index < length) {", "    var value = array[index],", "        computed = callback ? callback(value, index, array) : value;", "", "    if (isSorted", "          ? !index || seen[seen.length - 1] !== computed", "          : indexOf(seen, computed) < 0", "        ) {", "      if (callback) {", "        seen.push(computed);", "      }", "      result.push(value);", "    }", "  }", "  return result;", "}"].join("
"));
            source = replaceFunction(source, "uniqueId", ["function uniqueId(prefix) {", "  var id = ++idCounter + '';", "  return prefix ? prefix + id : id;", "}"].join("
"));
            source = replaceFunction(source, "where", ["function where(collection, properties, first) {", "  return (first && isEmpty(properties))", "    ? null", "    : (first ? find : filter)(collection, properties);", "}"].join("
"));
            source = replaceFunction(source, "without", ["function without(array) {", "  var index = -1,", "      length = array.length,", "      result = [];", "", "  while (++index < length) {", "    var value = array[index];", "    if (indexOf(arguments, value, 1) < 0) {", "      result.push(value);", "    }", "  }", "  return result", "}"].join("
"));
            source = source.replace(matchFunction(source, "find"), function(match)  {
                  var indent = getIndent(match);
                  return match && match + ["", "function findWhere(object, properties) {", "  return where(object, properties, true);", "}", ""].join("
" + indent);
               }
            );
            source = source.replace(getMethodAssignments(source), function(match)  {
                  return match.replace(/^( *)lodash.find *=.+/m, "$&
$1lodash.findWhere = findWhere;");
               }
            );
            source = addChainMethods(source);
            source = source.replace(/,[^']*'imports':[^}]+}/, "");
            source = removeFunction(source, "cachedContains");
            source = source.replace(matchFunction(source, "createCallback"), function(match)  {
                  return match.replace(/\bisEqual\(([^,]+), *([^,]+)[^)]+\)/, "$1 === $2");
               }
            );
            _.each(["max", "min"], function(methodName)  {
                  source = source.replace(matchFunction(source, methodName), function(match)  {
                        return match.replace(/=.+?callback *&& *isString[^:]+:\s*/g, "= ");
                     }
                  );
               }
            );
            source = removeFunction(source, "slice");
            source = source.replace(/^(( *)setTimeout = context.setTimeout)([,;])/m, "$1,
$2slice = arrayRef.slice$3");
            source = source.replace(/([^.]\bslice)\(/g, "$1.call(");
            if (! exposeCreateCallback)  {
               source = source.replace(/\blodash\.(createCallback\()\b/g, "$1");
            }
            if (useUnderscoreClone)  {
               source = removeVar(source, "cloneableClasses");
               source = removeVar(source, "ctorByClass");
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
").replace(/\(args *=.+/, "partialArgs.concat(slice(args))");
                  }
               );
            }
         }
         if (isUnderscore || isModern && ! isMobile && _.contains(buildMethods, "forEach") && _.contains(buildMethods, "forOwn") || ! exposeForOwn)  {
            source = source.replace(matchFunction(source, "each"), "").replace(/^ *lodash\._each *=.+\n/gm, "").replace(/\beach(?=\(collection)/g, "forOwn").replace(/\beach(?=\(\[)/g, "forEach");
         }
         vm.runInContext(source, context);
         return context._;
      }
();
      if (isTemplate)  {
         source = buildTemplate(templatePattern, templateSettings);
      }
       else  {
         allMethods.forEach(function(otherName)  {
               if (! _.contains(buildMethods, otherName))  {
                  source = removeFunction(source, otherName);
               }
            }
         );
         if (isRemoved(source, "isArguments"))  {
            source = removeIsArgumentsFallback(source);
         }
         source = source.replace(matchFunction(source, "template"), function(match)  {
               return match.replace(/iteratorTemplate *&& */g, "").replace(/iteratorTemplate\s*\?\s*([^:]+?)\s*:[^,;]+/g, "$1");
            }
         );
         if (isLegacy)  {
            source = removeSetImmediate(source);
            source = removeSupportProp(source, "fastBind");
            _.each(["isIeOpera", "isV8", "nativeBind", "nativeIsArray", "nativeKeys", "reNative"], function(varName)  {
                  source = removeVar(source, varName);
               }
            );
            source = source.replace(matchFunction(source, "bind"), function(match)  {
                  return match.replace(/(?:\s*\/\/.*)*\s*return support\.fastBind[^:]+:\s*/, "return ");
               }
            );
            source = source.replace(matchFunction(source, "isArray"), function(match)  {
                  return match.replace(/nativeIsArray\s*\|\|\s*/, "");
               }
            );
            if (! isRemoved(source, "keys"))  {
               source = source.replace(matchFunction(source, "keys").replace(/[\s\S]+?var keys *= */, ""), matchFunction(source, "shimKeys").replace(/[\s\S]+?var shimKeys *= */, ""));
               source = removeFunction(source, "shimKeys");
            }
            if (! isRemoved(source, "isArguments"))  {
               source = source.replace(matchFunction(source, "isArguments").replace(/[\s\S]+?function isArguments/, ""), function()  {
                     var fallback = getIsArgumentsFallback(source), body = fallback.match(/isArguments *= *function([\s\S]+? *});/)[1], indent = getIndent(fallback);
                     return body.replace(RegExp("^" + indent, "gm"), indent.slice(0, - 2)) + "
";
                  }
               );
               source = removeIsArgumentsFallback(source);
            }
         }
         if (isModern)  {
            source = removeSupportArgsObject(source);
            source = removeSupportSpliceObjects(source);
            source = removeIsArgumentsFallback(source);
         }
         if (isModern || isUnderscore)  {
            source = removeSupportArgsClass(source);
            source = removeSupportNodeClass(source);
         }
         if (isMobile || isUnderscore)  {
            source = removeVar(source, "iteratorTemplate");
            _.functions(lodash).forEach(function(methodName)  {
                  var reFunc = RegExp("^( *)(var " + methodName.replace(/^_/, "") + " *= *)createIterator\(((?:{|[a-zA-Z])[\s\S]+?)\);\n", "m");
                  if (reFunc.test(source))  {
                     source = source.replace(reFunc, function(match, indent, left)  {
                           return indent + left + getFunctionSource(lodash[methodName], indent) + ";
";
                        }
                     );
                  }
               }
            );
         }
         if (isUnderscore)  {
            function()  {
               var snippet = getMethodAssignments(source), modified = snippet;
               if (! exposeAssign)  {
                  modified = modified.replace(/^(?: *\/\/.*\s*)* *lodash\.assign *=.+\n/m, "");
               }
               if (! exposeCreateCallback)  {
                  modified = modified.replace(/^(?: *\/\/.*\s*)* *lodash\.createCallback *=.+\n/m, "");
               }
               if (! exposeForIn)  {
                  modified = modified.replace(/^(?: *\/\/.*\s*)* *lodash\.forIn *=.+\n/m, "");
               }
               if (! exposeForOwn)  {
                  modified = modified.replace(/^(?: *\/\/.*\s*)* *lodash\.forOwn *=.+\n/m, "");
               }
               if (! exposeIsPlainObject)  {
                  modified = modified.replace(/^(?: *\/\/.*\s*)* *lodash\.isPlainObject *=.+\n/m, "");
               }
               if (! exposeZipObject)  {
                  modified = modified.replace(/^(?: *\/\/.*\s*)* *lodash\.zipObject *=.+\n/m, "");
               }
               source = source.replace(snippet, function()  {
                     return modified;
                  }
               );
            }
();
            source = source.replace(/lodash\.support *= */, "");
            _.each([ {
                  methodName:"forIn", 
                  flag:exposeForIn               }
,  {
                  methodName:"forOwn", 
                  flag:exposeForOwn               }
], function(data)  {
                  if (! data.flag)  {
                     source = source.replace(matchFunction(source, data.methodName), function(match)  {
                           return match.replace(/(callback), *thisArg/g, "$1").replace(/^ *callback *=.+\n/m, "");
                        }
                     );
                  }
               }
            );
            _.each(["each", "forEach"], function(methodName)  {
                  source = source.replace(matchFunction(source, methodName), function(match)  {
                        return match.replace(/\n *return .+?([};\s]+)$/, "$1").replace(/\b(return) +result\b/, "$1");
                     }
                  );
               }
            );
            _.each(["each", "forEach", "forIn", "forOwn"], function(methodName)  {
                  source = source.replace(matchFunction(source, methodName), function(match)  {
                        return match.replace(/=== *false\)/g, "=== indicatorObject)");
                     }
                  );
               }
            );
            _.each(["every", "isEqual"], function(methodName)  {
                  source = source.replace(matchFunction(source, methodName), function(match)  {
                        return match.replace(/\(result *= *(.+?)\);/g, "!(result = $1) && indicatorObject;");
                     }
                  );
               }
            );
            source = source.replace(matchFunction(source, "find"), function(match)  {
                  return match.replace(/return false/, "return indicatorObject");
               }
            );
            source = source.replace(matchFunction(source, "some"), function(match)  {
                  return match.replace(/!\(result *= *(.+?)\);/, "(result = $1) && indicatorObject;");
               }
            );
         }
         if (! isMobile || isUnderscore)  {
            source = removeFromCreateIterator(source, "support");
            source = source.replace(getIteratorTemplate(source), function(match)  {
                  var indent = getIndent(match), snippet = getFunctionSource(lodash._iteratorTemplate, indent);
                  iteratorOptions.forEach(function(property)  {
                        snippet = snippet.replace(RegExp("([^\w.])\b" + property + "\b", "g"), "$1obj." + property);
                     }
                  );
                  snippet = snippet.replace(/var __t.+/, "var __p = '';").replace(/function print[^}]+}/, "").replace(/'(?:\\n|\s)+'/g, "''").replace(/__p *\+= *' *';/g, "").replace(/\s*\+\s*'';/g, ";").replace(/(__p *\+= *)' *' *\+/g, "$1").replace(/(?:; *)([{}])|([{}])(?: *;)/g, "$1$2").replace(/\(\(__t *= *\( *([^)]+?) *\)\) *== *null *\? *'' *: *__t\)/g, "($1)");
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
         if (isRemoved(source, "invert"))  {
            source = replaceVar(source, "htmlUnescapes", "{'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#x27;':"'"}");
         }
         if (isRemoved(source, "isArguments"))  {
            source = replaceSupportProp(source, "argsClass", "true");
         }
         if (isRemoved(source, "isFunction"))  {
            source = removeIsFunctionFallback(source);
         }
         if (isRemoved(source, "mixin"))  {
            source = source.replace(/^( *)mixin\(lodash\).+/m, function(match, indent)  {
                  return indent + ["forOwn(lodash, function(func, methodName) {", "  lodash[methodName] = func;", "", "  lodash.prototype[methodName] = function() {", "    var value = this.__wrapped__,", "        args = [value];", "", "    push.apply(args, arguments);", "    var result = func.apply(lodash, args);", "    return (value && typeof value == 'object' && value == result)", "      ? this", "      : new lodashWrapper(result);", "  };", "});"].join("
" + indent);
               }
            );
         }
         if (isRemoved(source, "value"))  {
            source = removeFunction(source, "wrapperToString");
            source = removeFunction(source, "wrapperValueOf");
            source = removeSupportSpliceObjects(source);
            source = removeLodashWrapper(source);
            source = replaceFunction(source, "lodash", ["function lodash() {", "  // no operation performed", "}"].join("
"));
            source = replaceFunction(source, "mixin", ["function mixin(object) {", "  forEach(functions(object), function(methodName) {", "    lodash[methodName] = object[methodName];", "  });", "}"].join("
"));
            source = source.replace(/(?:\s*\/\/.*)*\n( *)forOwn\(lodash, *function\(func, *methodName\)[\s\S]+?\n\1}.+/g, "").replace(/(?:\s*\/\/.*)*\n( *)(?:each|forEach)\(\['[\s\S]+?\n\1}.+/g, "").replace(/(?:\s*\/\/.*)*\n *lodash\.prototype.+/g, "");
         }
         if (isRemoved(source, "clone"))  {
            source = removeVar(source, "cloneableClasses");
            source = removeVar(source, "ctorByClass");
         }
         if (isRemoved(source, "defer"))  {
            source = removeSetImmediate(source);
         }
         if (isRemoved(source, "isArray"))  {
            source = removeVar(source, "nativeIsArray");
         }
         if (isRemoved(source, "isPlainObject"))  {
            source = removeFunction(source, "shimIsPlainObject");
            source = removeVar(source, "getPrototypeOf");
            source = removeSupportOwnLast(source);
         }
         if (isRemoved(source, "keys"))  {
            source = removeFunction(source, "shimKeys");
         }
         if (isRemoved(source, "parseInt"))  {
            source = removeVar(source, "nativeParseInt");
            source = removeVar(source, "reLeadingZeros");
         }
         if (isRemoved(source, "template"))  {
            source = source.replace(/(?:\n +\/\*[^*]*\*+(?:[^\/][^*]*\*+)*\/)?\n *lodash\.templateSettings[\s\S]+?};\n/, "");
         }
         if (isRemoved(source, "isArguments", "isEmpty"))  {
            source = removeSupportArgsClass(source);
         }
         if (isRemoved(source, "clone", "isEqual", "isPlainObject"))  {
            source = removeSupportNodeClass(source);
         }
         if (! /\beach\(/.test(source))  {
            source = source.replace(matchFunction(source, "each"), "");
         }
         if (source.match(/\bcreateIterator\b/g) || [].length < 2)  {
            source = removeFunction(source, "createIterator");
            source = removeVar(source, "defaultsIteratorOptions");
            source = removeVar(source, "eachIteratorOptions");
            source = removeVar(source, "forOwnIteratorOptions");
            source = removeVar(source, "iteratorTemplate");
            source = removeVar(source, "templateIterator");
            source = removeSupportNonEnumShadows(source);
            source = removeSupportEnumPrototypes(source);
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
         if (! /support\.(?:enumPrototypes|nonEnumShadows|ownLast)\b/.test(source))  {
            source = source.replace(/^ *\(function[\s\S]+?\n(( *)var ctor *= *function[\s\S]+?(?:\n *for.+)+\n)([\s\S]+?)}\(1\)\);\n/m, function(match, setup, indent, body)  {
                  if (/support\.spliceObjects\b/.test(match))  {
                     return match.replace(setup, indent + "var object = { '0': 1, 'length': 1 };
");
                  }
                   else if (/support\.nonEnumArgs\b/.test(match))  {
                     return match.replace(setup, indent + "for (var prop in arguments) { }
");
                  }
                  return body.replace(RegExp("^" + indent, "gm"), indent.slice(0, - 2));
               }
            );
         }
      }
      if (_.size(source.match(/\bfreeModule\b/g)) < 2)  {
         source = removeVar(source, "freeModule");
      }
      if (_.size(source.match(/\bfreeExports\b/g)) < 2)  {
         source = removeVar(source, "freeExports");
      }
      debugSource = cleanupSource(source);
      source = cleanupSource(source);
      var outputUsed = false;
      var isCustom = isLegacy || isMapped || isModern || isStrict || isUnderscore || outputPath || /(?:category|exclude|exports|iife|include|minus|plus)=/.test(options) || ! _.isEqual(exportsOptions, exportsAll);
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
                     stdout.write(data.source);
                     callback(data);
                  }
                   else  {
                     callback(data);
                  }
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
