! ✖ / env;
node;
global.env =  {
   run: {
      start:new Date(), 
      finish:null   }, 
   args:[], 
   conf: {} , 
   dirname:".", 
   pwd:null, 
   opts: {} , 
   sourceFiles:[], 
   version: {} }
;
function(args)  {
   if (args[0] && typeof args[0] === "object")  {
      args = [__dirname, process.cwd()];
   }
   require("jsdoc/util/runtime").initialize(args);
}
(Array.prototype.slice.call(arguments, 0));
global.app =  {
   jsdoc: {
      scanner:new require("jsdoc/src/scanner").Scanner(), 
      parser:null, 
      name:require("jsdoc/name")   }} ;
global.dump = function()  {
   var doop = require("jsdoc/util/doop").doop;
   var _dump = require("jsdoc/util/dumper").dump;
   for (var i = 0, l = arguments.length; i < l; i++)  {
         console.log(_dump(doop(arguments[i])));
      }
}
;
function()  {
   "use strict";
   var logger = require("jsdoc/util/logger");
   var path = require("jsdoc/path");
   var runtime = require("jsdoc/util/runtime");
   var cli = require(path.join(global.env.dirname, "cli"));
   cli.setVersionInfo().loadConfig();
   if (! global.env.opts.test)  {
      cli.configureLogger();
   }
   cli.logStart();
   function cb(errorCode)  {
      cli.logFinish();
      cli.exit(errorCode || 0);
   }
;
   if (runtime.isRhino())  {
      try {
         cli.runCommand(cb);
      }
      catch (e) {
         if (e.rhinoException)  {
            logger.fatal(e.rhinoException.printStackTrace());
         }
          else  {
            console.trace(e);
            cli.exit(1);
         }
      }
   }
    else  {
      cli.runCommand(cb);
   }
}
();
