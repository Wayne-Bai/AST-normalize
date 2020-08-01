! ✖ / env;
node;
var fs = require("fs");
var path = require("path");
var Q = require("q");
var updateNotifier = require("update-notifier");
var utils = require("./utils");
var origDir = process.cwd();
var ccaRoot = path.join(__dirname, "..");
var cordova = require("cordova");
var cordovaLib = cordova.cordova_lib;
var hooks = require("./hooks");
function main()  {
   var commandLineFlags = require("./parse-command-line")();
   utils.exit.pause_on_exit = commandLineFlags.pause_on_exit;
   var pkg = require("../package.json");
   updateNotifier( {
         pkg:pkg, 
         updateCheckInterval:1000 * 60 * 60 * 24      }
   ).notify();
   var command = commandLineFlags._[0];
   var packageVersion = require("../package").version;
   utils.colorizeConsole();
   hooks.registerHooks();
   function printCcaVersionPrefix()  {
      console.log("cca v" + packageVersion);
   }
;
   if (command == "exec")  {
      return require("./tools-check").fixEnv().then(function()  {
            require("./exec")(process.argv.slice(3));
         }
      ).done(null, utils.fatal);
   }
   if (commandLineFlags.v)  {
      command = "version";
   }
   if (commandLineFlags.h || ! command)  {
      command = "help";
   }
   function autoAddPlatforms()  {
      var plats = [];
      if (process.argv.indexOf("android") != - 1 && ! fs.existsSync(path.join("platforms", "android")))  {
         plats.push("android");
      }
      if (process.argv.indexOf("ios") != - 1 && ! fs.existsSync(path.join("platforms", "ios")))  {
         plats.push("ios");
      }
      if (plats.length === 0)  {
         return Q();
      }
      var argv = require("optimist").options("link",  {
            type:"boolean"         }
      ).options("verbose",  {
            type:"boolean", 
            alias:"d"         }
      ).argv;
      var opts =  {
         link:argv.link, 
         verbose:argv.verbose      }
;
      return require("./cordova-commands").runCmd(["platform", "add", plats, opts]).then(require("./write-out-cca-version"));
   }
;
   function beforeCordovaPrepare()  {
      return autoAddPlatforms().then(function()  {
            if (commandLineFlags["skip-upgrade"])  {
               return ;
            }
            if (! fs.existsSync(path.join("www", "manifest.json")))  {
               return Q.reject("This is not a cca project (no www/manifest.json file). Perhaps you meant to use the cordova-cli?");
            }
            return require("./upgrade-project").upgradeProjectIfStale(commandLineFlags.y);
         }
      );
   }
;
   function forwardCurrentCommandToCordova()  {
      cordovaLib.events.removeListener("results", console.log);
      cordovaLib.events.removeListener("log", console.log);
      cordovaLib.events.removeListener("warn", console.warn);
      cordovaLib.events.removeListener("verbose", console.log);
      return cordova.cli(process.argv);
   }
;
   function printVersionThenPrePrePrepareThenForwardCommandToCordova()  {
      printCcaVersionPrefix();
      return beforeCordovaPrepare().then(forwardCurrentCommandToCordova);
   }
;
   var commandActions =  {
      pre-prepare:function()  {
         return require("./pre-prepare")();
      }, 
      update-app:function()  {
         return commandActions["post-prepare"]();
      }, 
      post-prepare:function()  {
         return require("./post-prepare")();
      }, 
      checkenv:function()  {
         printCcaVersionPrefix();
         return require("./tools-check")();
      }, 
      push:function()  {
         printCcaVersionPrefix();
         return Q.fcall(function()  {
               var extraFlag = commandLineFlags._[1] || "";
               if (extraFlag)  {
                  require("optimist").showHelp(console.log);
                  return Q.reject("Flag "" + extraFlag + "" not understood.  Did you mean `--target=" + extraFlag + "`?");
               }
               return require("./push-to-harness")(commandLineFlags.target, commandLineFlags.watch);
            }
         );
      }, 
      run:function()  {
         printCcaVersionPrefix();
         var platform = commandLineFlags._[1];
         if (platform === "chrome" || platform === "canary")  {
            return require("./run-in-chrome")(platform);
         }
          else  {
            return beforeCordovaPrepare().then(forwardCurrentCommandToCordova);
         }
      }, 
      create:function()  {
         printCcaVersionPrefix();
         return Q.fcall(function()  {
               var destAppDir = commandLineFlags._[1] || "";
               if (! destAppDir)  {
                  require("optimist").showHelp(console.log);
                  return Q.reject("No output directory given.");
               }
               destAppDir = path.resolve(destAppDir);
               var packageId = commandLineFlags._[2] || "";
               var appName = commandLineFlags._[3] || "";
               return require("./create-app")(destAppDir, ccaRoot, origDir, packageId, appName, commandLineFlags);
            }
         );
      }, 
      upgrade:function()  {
         printCcaVersionPrefix();
         return require("./upgrade-project").upgradeProject(true);
      }, 
      version:function()  {
         console.log(packageVersion);
         return Q.when();
      }, 
      help:function()  {
         printCcaVersionPrefix();
         require("optimist").showHelp(console.log);
         return Q.when();
      }, 
      plugin:printVersionThenPrePrePrepareThenForwardCommandToCordova, 
      plugins:function()  {
         return commandActions.plugin.apply(this, arguments);
      }, 
      platform:function()  {
         printCcaVersionPrefix();
         return forwardCurrentCommandToCordova();
      }, 
      platforms:function()  {
         return commandActions.platform.apply(this, arguments);
      }, 
      analytics:function()  {
         return Q.when();
      }, 
      build:printVersionThenPrePrePrepareThenForwardCommandToCordova, 
      compile:printVersionThenPrePrePrepareThenForwardCommandToCordova, 
      emulate:printVersionThenPrePrePrepareThenForwardCommandToCordova, 
      prepare:printVersionThenPrePrePrepareThenForwardCommandToCordova, 
      serve:printVersionThenPrePrePrepareThenForwardCommandToCordova   }
;
   cordovaLib.cordova.config.setAutoPersist(false);
   var projectRoot = cordovaLib.cordova.findProjectRoot();
   if (projectRoot)  {
      cordovaLib.cordova.config(projectRoot, require("./default-config")(ccaRoot));
      process.chdir(projectRoot);
   }
   if (! commandActions.hasOwnProperty(command))  {
      utils.fatal("Invalid command: " + command + ". Use --help for usage.");
   }
   if (commandLineFlags.d)  {
      cordovaLib.events.on("results", console.log);
      cordovaLib.events.on("log", console.log);
      cordovaLib.events.on("warn", console.warn);
      cordovaLib.events.on("verbose", console.log);
   }
   var analyticsLoader = require("./analytics-loader");
   if (command === "analytics")  {
      analyticsLoader.analyticsCommand(commandLineFlags._[1]);
   }
   if (commandLineFlags["android-minSdkVersion"])  {
      process.env["ORG_GRADLE_PROJECT_cdvMinSdkVersion"] = commandLineFlags["android-minSdkVersion"];
   }
   analyticsLoader.getAnalyticsModule().then(function(analytics)  {
         analytics.sendEvent("cca", command);
      }
   ).then(commandActions[command]).then(null, function(e)  {
         if (e instanceof cordovaLib.CordovaError)  {
            utils.fatal(e.message.replace(/\bcordova /, "cca "));
         }
          else  {
            throw e;
         }
      }
   ).done();
}
;
if (require.main === module)  {
   main();
}
 else  {
   module.exports.parseCLI = main;
}
