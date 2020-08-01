! ✖ / env;
node;
var fs = require("fs");
var printer = require("./lib/printer.js");
var util = require("./lib/util.js");
var hulken = require("./lib/hulken.js");
var index = this;
if (process.argv.length > 2)  {
   if (process.argv[2])  {
      var arg = process.argv[2];
      if (arg === "make_options")  {
         util.createExampleOptions();
      }
       else  {
         var pathToOptionsFile = arg;
         printer.print("setting options from file ".cyan + pathToOptionsFile.bold.magenta);
         fs.readFile(pathToOptionsFile, "utf-8", function(err, data)  {
               if (err)  {
                  printer.print("HULKEN ERROR: ".bold.green + err.toString().red);
               }
                else  {
                  var hulken_options = JSON.parse(data);
                  index.run(function()  {
                     }, 
                     function()  {
                     }, 
                     hulken_options);
               }
            }
         );
      }
   }
}
exports.run = function(error, success, options)  {
   hulken.smash(error, success, options);
}
;
