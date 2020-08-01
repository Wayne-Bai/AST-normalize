! ✖ / env;
node;
var async = require("async");
var Utils = require("./ci-utils"), utils = new Utils();
var args = process.argv.splice(2);
var inWebinosRoot = false;
if (args !== undefined && args[0] !== undefined) if (args[0] === "0") inWebinosRoot = truevar cwd = process.cwd();
async.parallel( {
      runUnitTests:function(callback)  {
         var unitTestScript = inWebinosRoot ? cwd + "/tools/travis/unit-tests.sh" : cwd + "../travis/unit-tests.sh";
         utils.executeShellScript(unitTestScript, [0], [], false, function(code, argsToForward, stdout)  {
               if (code !== 0)  {
                  callback(new Error("Unit tests failed"), stdout);
               }
                else  {
                  callback(null, stdout);
               }
            }
         );
      }, 
      runPZHTests:function(callback)  {
         var pzpTestScript = inWebinosRoot ? cwd + "/tools/travis/auto-test.sh" : cwd + "../travis/auto-test.sh";
         utils.executeShellScript(pzpTestScript, [], [], false, function(code, argsToForward, stdout)  {
               if (code !== 0)  {
                  callback(new Error("PZH tests failed"), stdout);
               }
                else  {
                  callback(null, stdout);
               }
            }
         );
      }, 
      runAndroidTests:function(callback)  {
         if (process.env["RUN_ANDROID_CI"] === "yes")  {
            var Utils = require("./ci-utils"), utils = new Utils();
            var androidCi = require("./android-ci");
            androidCi.run(inWebinosRoot, function(code, message)  {
                  if (code === 0) callback(null, message)                   else callback(new Error(message))               }
            );
         }
          else  {
            console.log("Android CI not performed");
            callback(null);
         }
      }} , function(err, results)  {
      if (err) process.exit(1)       else process.exit(0)   }
);
