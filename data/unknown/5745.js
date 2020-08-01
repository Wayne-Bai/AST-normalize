! ✖ / env;
node;
var shell = require("shelljs"), child_process = require("child_process"), Q = require("q");
get_highest_sdk = function(results)  {
   var reg = /\d+/;
   var apiLevels = [];
   for (var i = 0; i < results.length; i++)  {
         apiLevels[i] = parseInt(results[i].match(reg)[0]);
      }
   apiLevels.sort(function(a, b)  {
         return b - a;
      }
   );
   console.log(apiLevels[0]);
}
;
get_sdks = function()  {
   var d = Q.defer();
   child_process.exec("android list targets", function(err, stdout, stderr)  {
         if (err) d.reject(stderr)          else d.resolve(stdout)      }
   );
   return d.promise.then(function(output)  {
         var reg = /android-\d+/gi;
         var results = output.match(reg);
         if (results.length === 0)  {
            return Q.reject(new Error("No android sdks installed."));
         }
          else  {
            get_highest_sdk(results);
         }
         return Q();
      }, 
      function(stderr)  {
         if (stderr.match(/command\snot\sfound/) || stderr.match(/'android' is not recognized/))  {
            return Q.reject(new Error("The command "android" failed. Make sure you have the latest Android SDK installed, and the "android" command (inside the tools/ folder) is added to your path."));
         }
          else  {
            return Q.reject(new Error("An error occurred while listing Android targets"));
         }
      }
   );
}
;
module.exports.run = function()  {
   return Q.all([get_sdks()]);
}
;
