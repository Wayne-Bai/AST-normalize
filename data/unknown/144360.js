! ✖ / env;
node;
var common = require("./common.js");
var build = require("./build.js");
var fs = require("fs.extra");
var watch = require("./files/watch.js");
var exec = require("child_process").exec;
var config = common.config;
function main()  {
   watch.add(config.projectDirectory).add(config.srcDir, true);
   watch.onChange(function(file, prev, curr, action)  {
         console.log("file has changed : ", file);
         if (config.notificationsActive && /^darwin/.test(process.platform))  {
            var message = "file has changed : 
" + file.replace(config.projectDirectory, "");
            try {
               exec("terminal-notifier -message "" + message + """,  {} , function(error, stdout, stderr)  {
                  }
               );
            }
            catch (e) {
               console.log("Notifier error :" + "Tried to used terminal-notified but terminal notifier is not installed
" + "Install terminal-notifier my using :
" + "> sudo make notifier" + "or disable the notifier in config.js => notificationsActive:false");
            }
         }
         if (/(scss|sass)$/.test(file))  {
            compassFileChanged(file);
         }
          else if (file.indexOf(config.componentListFileName) > - 1)  {
            componentListFileChanged(file);
         }
          else  {
            componentListFileChanged();
         }
      }
   );
}
;
var compassFileChanged = function()  {
   try {
      var child = exec("compass compile",  {
            cwd:config.projectDirectory + "tools/config"         }, 
         function(error, stdout, stderr)  {
            setTimeout(function()  {
                  if (error)  {
                     console.log(error, stdout, stderr);
                  }
                  common.moveDocCSSFile();
               }, 
               10);
         }
      );
   }
   catch (e) {
      console.log(e);
   }
}
;
var componentListFileChanged = function(file)  {
   var result = common.updateConfigFromComponentList();
   if (result == "ok")  {
      common.build();
      compassFileChanged();
   }
    else  {
      console.log("error in components file : ", result);
   }
}
;
compassFileChanged();
main();
