! ✖ / env;
node;
var scripts = require("./lib/scripts");
var config = require("./lib/config");
var deploy = require("./lib/deploy");
var pkg = require("./package.json");
var showUsage = function()  {
   console.log("usage: nd [init | deploy | remove] -b <branch> -d <directory>");
}
;
var getArgs = function()  {
   var getOptionValue = function(option, defaultValue)  {
      var options = process.argv.slice(3);
      var index = options.indexOf(option);
      return index === - 1 ? defaultValue : options[index + 1];
   }
;
   return  {
      command:process.argv[2], 
      branch:getOptionValue("-b", "master"), 
      directory:getOptionValue("-d", "deploy")   }
;
}
;
var getSettings = function(args, callback)  {
   var settings = config.load(args.directory + "/deploy.json");
   if (! settings)  {
      console.log(process.cwd() + "/" + args.directory + " does not exist – run [nd init] first");
      return process.exit(1);
   }
   settings.directory = args.directory;
   settings.branch = args.branch;
   settings.sshport = settings.sshport || 22;
   return callback(settings);
}
;
var init = function(args)  {
   config.generate(function(settings)  {
         if (config.validate(settings))  {
            scripts.generate(args.directory, settings);
            config.save(args.directory + "/deploy.json", settings);
         }
      }
   );
}
;
var run = function(args)  {
   getSettings(args, function(settings)  {
         console.log("deploying " + settings.branch + " " + "to " + settings.server + ":" + settings.path + "/" + settings.name);
         deploy.run(settings);
      }
   );
}
;
var remove = function(args)  {
   getSettings(args, function(settings)  {
         console.log("removing " + settings.server + ":" + settings.path + "/" + settings.name);
         deploy.remove(settings);
      }
   );
}
;
var args = getArgs();
switch(args.command) {
   case "i":
 
      
   case "init":
 
         return init(args);
      
   case "d":
 
      
   case "deploy":
 
         return run(args);
      
   case "r":
 
      
   case "remove":
 
         return remove(args);
      
   case "-v":
 
      
   case "--version":
 
         return console.log("v" + pkg.version);
      
   default:
 
         showUsage();
         return process.exit(1);
      
}
;
