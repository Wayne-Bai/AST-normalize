! ✖ / env;
node;
var fs = require("fs");
var _ = require("underscore");
_.str = require("underscore.string");
_.mixin(_.str.exports());
var LIB_PATH = "lib";
var context =  {} ;
console.log("Loading Singly modules...");
fs.readdir(LIB_PATH, function(err, files)  {
      files.filter(function(file)  {
            return /\.js$/.test(file);
         }
      ).forEach(function(file)  {
            context[_.camelize(file.replace(".js", ""))] = require(file);
         }
      );
      console.log("Finished loading Singly modules.");
      var repl = require("repl").start( {} );
      repl.on("exit", function()  {
            console.log("Bye!");
            process.exit(0);
         }
      );
      _.extend(repl.context, context);
   }
);
