! ✖ / env;
node;
var Sails = require("../lib/app");
var path = require("path");
var Womb = require("child_process");
var CaptainsLog = require("captains-log");
module.exports = function()  {
   var log = CaptainsLog();
   var appPath = process.cwd();
   var pathToSails = path.resolve(appPath, "/node_modules/sails");
   if (! Sails.isLocalSailsValid(pathToSails, appPath))  {
      pathToSails = path.resolve(__dirname, "./sails.js");
   }
   console.log();
   log.info("Running app in debug mode...");
   Womb.exec("ps", function(error, stdout, stderr)  {
         if (error || stderr || ! stdout.toString().match(/node-inspector/))  {
            log.info("You probably want to install / run node-inspector to help with debugging!");
            log.info("https://github.com/node-inspector/node-inspector");
            console.log();
         }
         log.info("( to exit, type " + "<CTRL>+<C>" + " )".grey);
         console.log();
         Womb.spawn("node", ["--debug", pathToSails, "lift"],  {
               stdio:"inherit"            }
         );
      }
   );
}
;
