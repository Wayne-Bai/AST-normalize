! ✖ / env;
node;
var exec = require("child_process").exec;
var path = require("path");
var pkg = require(path.join(process.argv[2], "package.json"));
if (! pkg.ionic || ! pkg.ionic.plugins)  {
   console.log("[plugins hook] Not running without ionic.plugins array in package.json");
   process.exit(0);
}
var pluginsToRemove;
exec("cordova plugin list", function(error, stdout, stderr)  {
      if (error) return       pluginsToRemove = stdout.toString().trim().split(/[\r\n]+/g).map(function(line)  {
            return line.split(" ")[0];
         }
      );
      if (pluginsToRemove[0] == "No")  {
         pluginsToRemove = [];
      }
      removePlugin();
   }
);
function removePlugin()  {
   if (! pluginsToRemove.length)  {
      addPlugin();
      return ;
   }
   var name = pluginsToRemove.pop();
   console.log("[plugins hook] Removing plugin " + name);
   exec("cordova plugin remove " + name, removePlugin);
}
;
var pluginsToAdd = pkg.ionic.plugins.slice();
function addPlugin()  {
   if (! pluginsToAdd.length) return    var source = pluginsToAdd.pop();
   console.log("[plugins hook] Adding plugin " + source);
   exec("cordova plugin add " + source, addPlugin);
}
;
