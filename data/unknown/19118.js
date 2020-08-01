! ✖ / env;
node;
function()  {
   "use strict";
   var fs = require("fs");
   var compiledVars = ["args", "argsIndex", "argsLength", "callback", "collection", "createCallback", "ctor", "guard", "hasOwnProperty", "index", "isArguments", "isArray", "isString", "iterable", "length", "nativeKeys", "object", "objectTypes", "ownIndex", "ownProps", "result", "skipProto", "source", "thisArg"];
   var iteratorOptions = ["args", "arrays", "bottom", "firstArg", "hasDontEnumBug", "hasEnumPrototype", "isKeysFast", "loop", "nonEnumArgs", "noCharByIndex", "shadowed", "top", "useHas"];
   var minNames = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
   minNames.push.apply(minNames, minNames.map(function(value)  {
            return value + value;
         }
      ));
   var propWhitelist = ["_", "__wrapped__", "after", "all", "amd", "any", "assign", "at", "attachEvent", "bind", "bindAll", "bindKey", "clearTimeout", "clone", "cloneDeep", "collect", "compact", "compose", "contains", "countBy", "criteria", "debounce", "defaults", "defer", "delay", "detect", "difference", "drop", "each", "environment", "escape", "evaluate", "every", "exports", "extend", "filter", "find", "first", "flatten", "foldl", "foldr", "forEach", "forIn", "forOwn", "functions", "global", "groupBy", "has", "head", "imports", "identity", "include", "index", "indexOf", "initial", "inject", "interpolate", "intersection", "invert", "invoke", "isArguments", "isArray", "isBoolean", "isDate", "isElement", "isEmpty", "isEqual", "isEqual", "isFinite", "isFinite", "isFunction", "isNaN", "isNull", "isNumber", "isObject", "isPlainObject", "isRegExp", "isString", "isUndefined", "keys", "last", "lastIndexOf", "map", "max", "memoize", "merge", "methods", "min", "mixin", "noConflict", "object", "omit", "once", "opera", "pairs", "partial", "partialRight", "pick", "pluck", "random", "range", "reduce", "reduceRight", "reject", "rest", "result", "select", "setImmediate", "setTimeout", "shuffle", "size", "some", "sortBy", "sortedIndex", "source", "tail", "take", "tap", "template", "templateSettings", "throttle", "times", "toArray", "unescape", "union", "uniq", "unique", "uniqueId", "value", "values", "variable", "VERSION", "where", "without", "wrap", "zip", "__chain__", "chain", "findWhere"];
   function preprocess(source, options)  {
      source || source = "";
      options || options =  {} ;
      source = source.replace(/@(?:alias|category)\b.*/g, "");
      if (options.isTemplate)  {
         return source;
      }
      source = source.replace(RegExp("\.(" + propWhitelist.join("|") + ")\b", "g"), function(match, prop)  {
            return "['" + prop.replace(/['\n\r\t]/g, "\$&") + "']";
         }
      );
      source = source.replace(/__e *= *_\['escape']/g, "__e=_.escape");
      source = source.replace("collection['indexOf'](target)", "collection.indexOf(target)");
      source = source.replace("result[length]['value']", "result[length].value");
      source = source.replace(/^([ "'\w]+:)? *"[^"\\\n]*(?:\\.[^"\\\n]*)*"|'[^'\\\n]*(?:\\.[^'\\\n]*)*'/gm, function(string, captured)  {
            if (/:$/.test(captured))  {
               string = string.slice(captured.length);
            }
            string = string.replace(/\[object |delete |else (?!{)|function | in |return\s+[\w"']|throw |typeof |use strict|var |@ |(["'])\\n\1|\\\\n|\\n|\s+/g, function(match)  {
                  return match == false || match == "\n" ? "" : match;
               }
            );
            return captured || "" + string;
         }
      );
      source = source.replace(/reEmptyString\w+ *=.+/g, function(match)  {
            return match.replace(/ |\\n/g, "");
         }
      );
      source = source.replace(""__p += '"", ""__p+='"").replace(""';
"", ""';"");
      source = source.replace(/(?:\s*\/\/.*\n)* *var sourceURL[^;]+;|\+ *sourceURL/g, "");
      function()  {
         var properties = ["criteria", "index", "value"], snippets = source.match(/( +)function (?:compareAscending|sortBy)\b[\s\S]+?\n\1}/g);
         if (! snippets)  {
            return ;
         }
         snippets.forEach(function(snippet)  {
               var modified = snippet;
               properties.forEach(function(property, index)  {
                     var minName = minNames[index], reBracketProp = RegExp("\['(" + property + ")'\]", "g"), reDotProp = RegExp("\." + property + "\b", "g"), rePropColon = RegExp("([^?\s])\s*(["'])?\b" + property + "\2 *:", "g");
                     modified = modified.replace(reBracketProp, "['" + minName + "']").replace(reDotProp, "['" + minName + "']").replace(rePropColon, "$1'" + minName + "':");
                  }
               );
               source = source.replace(snippet, modified);
            }
         );
      }
();
      var snippets = source.match(RegExp(["( +)var iteratorTemplate\b[\s\S]+?\n\1}", "createIterator\((?:{|[a-zA-Z]+)[\s\S]+?\);\n", "( +)var [a-zA-Z]+IteratorOptions\b[\s\S]+?\n\2}", "( +)function createIterator\b[\s\S]+?\n\3}"].join("|"), "g"));
      if (! snippets)  {
         return source;
      }
      snippets.forEach(function(snippet, index)  {
            var isCreateIterator = /function createIterator\b/.test(snippet), isIteratorTemplate = /var iteratorTemplate\b/.test(snippet), modified = snippet;
            modified = modified.replace(RegExp("\.(" + iteratorOptions.join("|") + ")\b", "g"), function(match, prop)  {
                  return "['" + prop.replace(/['\n\r\t]/g, "\$&") + "']";
               }
            );
            if (isCreateIterator)  {
               source = source.replace(snippet, modified);
               snippet = modified = modified.replace(/return factory\([\s\S]+$/, "");
            }
            iteratorOptions.forEach(function(property, index)  {
                  var minName = minNames[index];
                  modified = isIteratorTemplate ? modified.replace(RegExp("\b" + property + "\b", "g"), minName) : modified.replace(RegExp("'" + property + "'", "g"), "'" + minName + "'");
               }
            );
            compiledVars.forEach(function(variable, index)  {
                  var minName = minNames[index];
                  modified = modified.replace(RegExp("([^.]\b)" + variable + "\b(?!' *[\]:])", "g"), "$1" + minName);
                  if (/^(?:boolean|function|object|number|string|undefined)$/.test(variable))  {
                     modified = modified.replace(RegExp("(typeof [^']+')" + minName + "'", "g"), "$1" + variable + "'");
                  }
               }
            );
            source = source.replace(snippet, modified);
         }
      );
      return source;
   }
;
   if (module != require.main)  {
      module.exports = preprocess;
   }
    else  {
      function()  {
         var options = process.argv;
         if (options.length < 3)  {
            return ;
         }
         var filePath = options[options.length - 1], isTemplate = options.indexOf("-t") > - 1 || options.indexOf("--template") > - 1, source = fs.readFileSync(filePath, "utf8");
         fs.writeFileSync(filePath, preprocess(source,  {
                  isTemplate:isTemplate               }
            ), "utf8");
      }
();
   }
}
();
