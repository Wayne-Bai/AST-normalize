! ✖ / env;
node;
var fs = require("fs");
var path = require("path");
var commander = require("commander");
var global_options =  {} ;
var saveCompletion = function(options, completions, callback)  {
   var txt = JSON.stringify(completions, null, 4);
   fs.writeFile(options.output, txt);
   callback(null, txt);
}
;
var saveFile = function(options, item, output, callback)  {
   if (options.output)  {
      var dest_path = path.resolve(options.output, item.type);
      fs.mkdir(dest_path, 493, function(err)  {
            if (err && err.errno !== 47)  {
               return callback(err);
            }
            var file_path = path.resolve(dest_path, "node-" + item.type + "-" + item.name + ".sublime-snippet");
            console.log("Making file " + file_path);
            fs.writeFile(file_path, output);
            callback(null, output, file_path);
         }
      );
   }
    else  {
      var output = ["Output for " + item, "-----------------------------------------", output].join("");
      callback(null, output);
   }
}
;
var FunctionReflect = function(fn)  {
   this.fn = fn;
   var s = fn.toString();
   var iOpenParams = s.indexOf("(");
   var closeParams = s.indexOf(")");
   this.name = s.substring(s.indexOf("function") + 8, iOpenParams);
   this.name = this.name.trim();
   this.params = s.slice(iOpenParams, closeParams + 1);
   var args = s.slice(iOpenParams + 1, closeParams).replace(/,/g, " ").split(" ").filter(function(arg)  {
         return arg !== "";
      }
   );
   var count = 0;
   this.param_templates = args.map(function(arg)  {
         return "${" + ++count + ":" + arg + "}";
      }
   );
   this.className = null;
   this.methodName = null;
   var iUnderscore = this.name.indexOf("_");
   if (iUnderscore >= 0)  {
      this.className = this.name.substr(0, iUnderscore);
      this.methodName = this.name.substr(iUnderscore + 1);
   }
   this.body = s.substring(s.indexOf("{") + 1, s.indexOf("}") - 1);
   return this;
}
;
function list(val)  {
   return val.split(",");
}
;
exports.doc_builder = function(options, callback)  {
   var output = [];
   global_options = options;
   if (options.global)  {
      createGlobals(output);
   }
   if (options.full)  {
      createNodeLibs(options, output);
   }
   if (options.ns && options.ns.length > 0)  {
      createNamespaces(options, output);
   }
   if (options.type === "completions")  {
      createCompletions(options, output, callback);
   }
    else  {
      createSnippets(options, output, callback);
   }
}
;
var createGlobals = function(output)  {
   var gKey;
   for (gKey in global)  {
         if (typeof global[gKey] === "function")  {
            var snippet =  {
               type:"global", 
               name:gKey, 
               reflection:FunctionReflect(global[gKey])            }
;
            snippet["args"] = snippet.reflection.params.trim();
            snippet["function_string"] = "" + snippet.name + snippet.reflection.params.trim() + ";";
            snippet["function_template"] = "" + snippet.name + "(" + snippet.reflection.param_templates.join(", ") + ");$0";
            output.push(snippet);
         }
      }
   var pKey;
   for (pKey in process)  {
         if (typeof process[pKey] === "function")  {
            var snippet =  {
               type:"process", 
               name:pKey, 
               reflection:FunctionReflect(process[pKey])            }
;
            snippet["args"] = snippet.reflection.params.trim();
            snippet["function_string"] = "" + [snippet.type, snippet.name].join(".") + snippet.reflection.params.trim() + ";";
            snippet["function_template"] = "" + [snippet.type, snippet.name].join(".") + "(" + snippet.reflection.param_templates.join(", ") + ");$0";
            output.push(snippet);
         }
      }
   var rKey;
   for (rKey in require)  {
         if (typeof require[rKey] === "function")  {
            var snippet =  {
               type:"require", 
               name:rKey, 
               reflection:FunctionReflect(require[rKey])            }
;
            snippet["args"] = snippet.reflection.params.trim();
            snippet["function_string"] = "" + [snippet.type, snippet.name].join(".") + snippet.reflection.params.trim() + ";";
            snippet["function_template"] = "" + [snippet.type, snippet.name].join(".") + "(" + snippet.reflection.param_templates.join(", ") + ");$0";
            output.push(snippet);
         }
      }
   return output;
}
;
var createNodeLibs = function(options, output)  {
   var files = ["_debugger", "_linklist", "assert", "buffer", "buffer_ieee754", "child_process", "cluster", "console", "constants", "crypto", "dgram", "dns", "events", "freelist", "fs", "http", "https", "module", "net", "os", "path", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "sys", "timers", "tls", "tty", "url", "util", "vm", "zlib"];
   createNamespaces(options, files, output);
}
;
var createNamespaces = function(options, files, output)  {
   var i = 0, j = files.length;
   for (; i < j; i++)  {
         var item = require(files[i]);
         var rKey;
         for (rKey in item)  {
               if (typeof item[rKey] === "function")  {
                  var snippet =  {
                     type:files[i], 
                     name:rKey, 
                     reflection:FunctionReflect(item[rKey])                  }
;
                  snippet["args"] = snippet.reflection.params.trim();
                  snippet["function_string"] = "" + options.expert ? snippet.name : [snippet.type, snippet.name].join(".") + snippet.reflection.params.trim() + ";";
                  snippet["function_template"] = "" + options.expert ? snippet.name : [snippet.type, snippet.name].join(".") + "(" + snippet.reflection.param_templates.join(", ") + ");$0";
                  output.push(snippet);
               }
            }
      }
}
;
var createSnippets = function(options, snippets, callback)  {
   var i = 0, j = snippets.length;
   for (; i < j; i++)  {
         var item = snippets[i];
         var output = [];
         output.push("<snippet>");
         output.push("   <content><![CDATA[" + item.function_string + "]]></content>");
         output.push("   <tabTrigger>" + [item.type, item.name].join(".") + "</tabTrigger>");
         output.push("   <scope>source.js</scope>");
         output.push("   <description>" + item.args + "</description>");
         output.push("</snippet>");
         saveFile(options, item, output.join("
"), callback);
      }
}
;
var createCompletions = function(options, output, callback)  {
   var i = 0, j = output.length;
   var completion =  {
      scope:"source.js - variable.other.js", 
      completions:[]   }
;
   for (; i < j; i++)  {
         var item = output[i];
         completion.completions.push( {
               trigger:item.function_string, 
               contents:item.function_template            }
         );
      }
   saveCompletion(options, completion, callback);
}
;
