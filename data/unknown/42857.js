! ✖ / env;
node;
var shell = require("shelljs"), child_process = require("child_process"), Q = require("q"), path = require("path"), fs = require("fs"), ROOT = path.join(__dirname, "..", "..");
module.exports.get_target = function()  {
   if (fs.existsSync(path.join(ROOT, "framework", "project.properties")))  {
      var target = shell.grep(/target=android-[\d+]/, path.join(ROOT, "framework", "project.properties"));
      return target.split("=")[1].replace("
", "").replace("", "").replace(" ", "");
   }
    else if (fs.existsSync(path.join(ROOT, "project.properties")))  {
      var target = shell.grep(/target=android-[\d+]/, path.join(ROOT, "project.properties")) || shell.grep(/target=Google Inc.:Google APIs:[\d+]/, path.join(ROOT, "project.properties"));
      return target.split("=")[1].replace("
", "").replace("", "");
   }
}
;
module.exports.check_ant = function()  {
   var d = Q.defer();
   child_process.exec("ant -version", function(err, stdout, stderr)  {
         if (err) d.reject(new Error("ERROR : executing command 'ant', make sure you have ant installed and added to your path."))          else d.resolve()      }
   );
   return d.promise;
}
;
module.exports.check_java = function()  {
   var d = Q.defer();
   child_process.exec("java -version", function(err, stdout, stderr)  {
         if (err)  {
            var msg = "Failed to run 'java -version', make sure your java environment is set up
" + "including JDK and JRE.
" + "Your JAVA_HOME variable is " + process.env.JAVA_HOME + "
";
            d.reject(new Error(msg + err));
         }
          else d.resolve()      }
   );
   return d.promise;
}
;
module.exports.check_android = function()  {
   var valid_target = this.get_target();
   var d = Q.defer();
   child_process.exec("android list targets", function(err, stdout, stderr)  {
         if (err) d.reject(stderr)          else d.resolve(stdout)      }
   );
   return d.promise.then(function(output)  {
         if (! output.match(valid_target))  {
            return Q.reject(new Error("Please install Android target " + valid_target.split("-")[1] + " (the Android newest SDK). Make sure you have the latest Android tools installed as well. Run "android" from your command-line to install/update any missing SDKs or tools."));
         }
         return Q();
      }, 
      function(stderr)  {
         if (stderr.match(/command\snot\sfound/))  {
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
   return Q.all([this.check_ant(), this.check_java(), this.check_android()]);
}
;
