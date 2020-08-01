! ✖ / env;
node;
var vm = require("vm");
var jsio = require("./packages/jsio.js");
jsio("from base import *");
jsio.path.add(".");
jsio.path.add("./packages");
jsio("import preprocessors.cls as cls");
jsio("import preprocessors.import as importc");
global.jsio = jsio;
var preprocessEval = function(cmd, context, filename, callback)  {
   var src = cmd.toString();
   if (src.match(/^\(.*\)/))  {
      src = src.slice(1, cmd.length - 2);
   }
   var def =  {
      path:filename, 
      src:src   }
;
   cls(filename, def);
   importc(filename, def);
   var err, result;
   try {
      result = vm.runInThisContext(def.src, def.path);
   }
   catch (e) {
      err = e;
   }
   callback(err, result);
}
;
var startRepl = function()  {
   console.log("js.io repl starting
");
   require("repl").start( {
         useGlobal:true, 
         eval:preprocessEval      }
   );
}
;
if (process.argv.length > 2)  {
   var fs = require("fs");
   var src = fs.readFileSync(process.argv[2]);
   preprocessEval(src, null, process.argv[2], function(error, result)  {
         if (error)  {
            console.log(error.stack);
         }
         process.exit(error ? 1 : 0);
      }
   );
}
 else  {
   startRepl();
}
