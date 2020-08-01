! ✖ / env;
node;
var shelljs = require("shelljs"), child_process = require("child_process"), Q = require("q"), path = require("path"), fs = require("fs"), which = require("which"), ROOT = path.join(__dirname, "..", "..");
var isWindows = process.platform == "win32";
function forgivingWhichSync(cmd)  {
   try {
      return which.sync(cmd);
   }
   catch (e) {
      return "";
   }
}
;
function tryCommand(cmd, errMsg)  {
   var d = Q.defer();
   child_process.exec(cmd, function(err, stdout, stderr)  {
         if (err) d.reject(new Error(errMsg))          else d.resolve(stdout)      }
   );
   return d.promise;
}
;
module.exports.get_target = function()  {
   if (fs.existsSync(path.join(ROOT, "framework", "project.properties")))  {
      var target = shelljs.grep(/target=android-[\d+]/, path.join(ROOT, "framework", "project.properties"));
      return target.split("=")[1].replace("
", "").replace("", "").replace(" ", "");
   }
    else if (fs.existsSync(path.join(ROOT, "project.properties")))  {
      var target = shelljs.grep(/target=android-[\d+]/, path.join(ROOT, "project.properties")) || shelljs.grep(/target=Google Inc.:Google APIs:[\d+]/, path.join(ROOT, "project.properties"));
      if (target == "" || ! target)  {
         target = shelljs.grep(/target=Google Inc.:Glass Development Kit Preview:[\d+]/, path.join(ROOT, "project.properties"));
      }
      return target.split("=")[1].replace("
", "").replace("", "");
   }
}
;
module.exports.check_ant = function()  {
   return tryCommand("ant -version", "Failed to run "ant -version", make sure you have ant installed and added to your PATH.");
}
;
module.exports.check_gradle = function()  {
   var sdkDir = process.env["ANDROID_HOME"];
   var wrapperDir = path.join(sdkDir, "tools", "templates", "gradle", "wrapper");
   if (! fs.existsSync(wrapperDir))  {
      return Q.reject(new Error("Could not find gradle wrapper within android sdk. Might need to update your Android SDK.
" + "Looked here: " + wrapperDir));
   }
   return Q.when();
}
;
module.exports.check_java = function()  {
   var javacPath = forgivingWhichSync("javac");
   var hasJavaHome = ! ! process.env["JAVA_HOME"];
   return Q().then(function()  {
         if (hasJavaHome)  {
            if (! javacPath)  {
               process.env["PATH"] = path.delimiter + path.join(process.env["JAVA_HOME"], "bin");
            }
         }
          else  {
            if (javacPath)  {
               if (fs.existsSync("/usr/libexec/java_home"))  {
                  return tryCommand("/usr/libexec/java_home", "Failed to run: /usr/libexec/java_home").then(function(stdout)  {
                        process.env["JAVA_HOME"] = stdout.trim();
                     }
                  );
               }
                else  {
                  var maybeJavaHome = path.dirname(path.dirname(javacPath));
                  if (fs.existsSync(path.join(maybeJavaHome, "lib", "tools.jar")))  {
                     process.env["JAVA_HOME"] = maybeJavaHome;
                  }
                   else  {
                     throw new Error("Could not find JAVA_HOME. Try setting the environment variable manually");
                  }
               }
            }
             else if (isWindows)  {
               var firstJdkDir = shelljs.ls(process.env["ProgramFiles"] + "\java\jdk*")[0] || shelljs.ls("C:\Program Files\java\jdk*")[0] || shelljs.ls("C:\Program Files (x86)\java\jdk*")[0];
               if (firstJdkDir)  {
                  firstJdkDir = firstJdkDir.replace(/\//g, path.sep);
                  if (! javacPath)  {
                     process.env["PATH"] = path.delimiter + path.join(firstJdkDir, "bin");
                  }
                  process.env["JAVA_HOME"] = firstJdkDir;
               }
            }
         }
      }
   ).then(function()  {
         var msg = "Failed to run "java -version", make sure your java environment is set up
" + "including JDK and JRE.
" + "Your JAVA_HOME variable is: " + process.env["JAVA_HOME"];
         return tryCommand("java -version", msg);
      }
   ).then(function()  {
         msg = "Failed to run "javac -version", make sure you have a Java JDK (not just a JRE) installed.";
         return tryCommand("javac -version", msg);
      }
   );
}
;
module.exports.check_android = function()  {
   return Q().then(function()  {
         var androidCmdPath = forgivingWhichSync("android");
         var adbInPath = ! ! forgivingWhichSync("adb");
         var hasAndroidHome = ! ! process.env["ANDROID_HOME"] && fs.existsSync(process.env["ANDROID_HOME"]);
         if (hasAndroidHome && ! androidCmdPath)  {
            process.env["PATH"] = path.delimiter + path.join(process.env["ANDROID_HOME"], "tools");
         }
         if (androidCmdPath && ! hasAndroidHome)  {
            var parentDir = path.dirname(androidCmdPath);
            if (path.basename(parentDir) == "tools")  {
               process.env["ANDROID_HOME"] = path.dirname(parentDir);
               hasAndroidHome = true;
            }
         }
         if (hasAndroidHome && ! adbInPath)  {
            process.env["PATH"] = path.delimiter + path.join(process.env["ANDROID_HOME"], "platform-tools");
         }
         if (! process.env["ANDROID_HOME"])  {
            throw new Error("ANDROID_HOME is not set and "android" command not in your PATH. You must fulfill at least one of these conditions.");
         }
         if (! fs.existsSync(process.env["ANDROID_HOME"]))  {
            throw new Error("ANDROID_HOME is set to a non-existant path: " + process.env["ANDROID_HOME"]);
         }
         return module.exports.check_android_target(module.exports.get_target());
      }
   );
}
;
module.exports.check_android_target = function(valid_target)  {
   var msg = "Failed to run "android". Make sure you have the latest Android SDK installed, and that the "android" command (inside the tools/ folder) is added to your PATH.";
   return tryCommand("android list targets", msg).then(function(output)  {
         if (! output.match(valid_target))  {
            throw new Error("Please install Android target "" + valid_target + "".
" + "Hint: Run "android" from your command-line to open the SDK manager.");
         }
      }
   );
}
;
module.exports.run = function()  {
   return Q.all([this.check_java(), this.check_android()]);
}
;
