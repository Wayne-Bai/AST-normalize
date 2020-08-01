! ✖ / env;
node;
var _ = require("lodash");
var util = require("util");
var path = require("path");
var rconf = require("../lib/app/configuration/rc");
module.exports = function()  {
   var commands = rconf.commands;
   var deploy = commands && commands.deploy;
   var modulePath = deploy && deploy.module;
   var module;
   if (! modulePath)  {
      console.error("No module specified for the `deploy` command.");
      console.error("To use `sails deploy`, set a `commands.deploy.module` setting in your .sailsrc file");
      return ;
   }
   try {
      module = require(path.resolve(process.cwd(), "node_modules", modulePath));
   }
   catch (e) {
      console.error("Could not require module at path: " + modulePath + ".  Please check the path and try again.");
   }
   try {
      module( {
            config:rconf         }, 
         function(err, result)  {
            if (err)  {
               console.error("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
               console.error("Deployed failed!  Details below:");
               console.error("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
               console.error(err);
            }
         }
      );
   }
   catch (e) {
      console.error("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
      console.error("Could not run deploy!  Details below:");
      console.error("=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-");
      console.error(e);
   }
}
;
