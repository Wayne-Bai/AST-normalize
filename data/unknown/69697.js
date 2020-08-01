! ✖ / env;
node;
var fs = require("fs"), commander = require("commander");
var createRoboHydraServer = require("robohydra").createRoboHydraServer;
function()  {
   "use strict";
   function showHelpAndDie(message)  {
      if (message)  {
         console.error(message);
      }
      console.error(commander.helpInformation());
      process.exit(1);
   }
;
   function commaList(val)  {
      return val.split(/,/);
   }
;
   function colonList(val)  {
      return val.split(/:/);
   }
;
   commander.version("0.5.200000000000001").usage("mysetup.conf [confvar=value confvar2=value2 ...]").option("-I <path>", "Adds a new path in the plugin search path list", colonList).option("-P, --plugins <plugin-list>", "Load plugins at startup", commaList).option("-n, --no-config", "Don't read a configuration file").option("-p, --port <port>", "Listen on this port (default 3000)").option("-q, --quiet", "Quiet (don't print messages on screen)").parse(process.argv);
   var extraPluginLoadPath = [], extraPlugins = [];
   if (commander.I)  {
      extraPluginLoadPath = extraPluginLoadPath.concat(commander.I);
   }
   if (commander.plugins)  {
      extraPlugins = extraPlugins.concat(commander.plugins);
   }
   var args = commander.args;
   var fileConfig =  {} ;
   if (commander.config)  {
      if (commander.args.length < 1)  {
         showHelpAndDie();
      }
      var configPath = args.shift();
      var robohydraConfigString = fs.readFileSync(configPath, "utf-8");
      fileConfig = JSON.parse(robohydraConfigString);
      if (! fileConfig.plugins)  {
         showHelpAndDie(configPath + " doesn't seem like a valid RoboHydra plugin (missing 'plugins' property in the top-level object)");
      }
   }
   var extraVars =  {} ;
   for (var i = 0, len = args.length; i < len; i++)  {
         var varAndValue = args[i].split("=", 2);
         if (varAndValue.length !== 2)  {
            showHelpAndDie();
         }
          else  {
            extraVars[varAndValue[0]] = varAndValue[1];
         }
      }
   var server;
   try {
      server = createRoboHydraServer( {
            plugins:extraPlugins.concat(fileConfig.plugins || []), 
            pluginLoadPaths:fileConfig.pluginLoadPaths || [].concat(extraPluginLoadPath), 
            summoner:fileConfig.summoner, 
            secure:fileConfig.secure, 
            sslOptions:fileConfig.sslOptions, 
            quiet:commander.quiet || fileConfig.quiet         }, 
         extraVars);
   }
   catch (e) {
      if (e.code === "ENOENT")  {
         console.error("Cannot read file '" + e.path + "'.");
      }
       else  {
         throw e;
      }
      process.exit(1);
   }
   var port = commander.port || fileConfig.port || 3000;
   server.on("error", function(e)  {
         if (e.code === "EADDRINUSE")  {
            console.error("Couldn't listen in port " + port + ", aborting.");
         }
      }
   );
   server.listen(port, function()  {
         if (commander.quiet)  {
            return ;
         }
         var protocol = fileConfig.secure ? "https" : "http";
         var adminUrl = protocol + "://localhost:" + port + "/robohydra-admin";
         console.log("RoboHydra ready on port %d - Admin URL: %s", port, adminUrl);
      }
   );
}
();
