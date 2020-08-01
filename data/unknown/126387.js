! ✖ / env;
node;
function()  {
   if (typeof WScript !== "undefined")  {
      WScript.echo("npm does not work when run
" + "with the Windows Scripting Host

" + "'cd' to a different directory,
" + "or type 'npm.cmd <args>',
" + "or type 'node npm <args>'.");
      WScript.quit(1);
      return ;
   }
   process.title = "npm";
   var log = require("../lib/utils/log.js");
   log.waitForConfig();
   log.info("ok", "it worked if it ends with");
   var fs = require("graceful-fs"), path = require("path"), npm = require("../lib/npm.js"), ini = require("../lib/utils/ini.js"), errorHandler = require("../lib/utils/error-handler.js"), configDefs = require("../lib/utils/config-defs.js"), shorthands = configDefs.shorthands, types = configDefs.types, nopt = require("nopt");
   if (path.basename(process.argv[1]).slice(- 1) === "g")  {
      process.argv.splice(1, 1, "npm", "-g");
   }
   log.verbose(process.argv, "cli");
   var conf = nopt(types, shorthands);
   npm.argv = conf.argv.remain;
   if (npm.deref(npm.argv[0])) npm.command = npm.argv.shift()    else conf.usage = true   if (conf.version)  {
      console.log(npm.version);
      return ;
   }
   if (conf.versions)  {
      var v = process.versions;
      v.npm = npm.version;
      console.log(v);
      return ;
   }
   log.info("npm@" + npm.version, "using");
   log.info("node@" + process.version, "using");
   var semver = require("semver"), nodeVer = process.version, reqVer = npm.nodeVersionRequired;
   if (reqVer && ! semver.satisfies(nodeVer, reqVer))  {
      return errorHandler(new Error("npm doesn't work with node " + nodeVer + "
Required: node@" + reqVer), true);
   }
   process.on("uncaughtException", errorHandler);
   if (conf.usage && npm.command !== "help")  {
      npm.argv.unshift(npm.command);
      npm.command = "help";
   }
   conf._exit = true;
   npm.load(conf, function(er)  {
         if (er) return errorHandler(er)         npm.commands[npm.command](npm.argv, errorHandler);
      }
   );
}
();
