! ✖ / env;
node;
"use strict";
var pluginlist = ["org.apache.cordova.device", "org.apache.cordova.device-motion", "org.apache.cordova.device-orientation", "org.apache.cordova.geolocation", "org.apache.cordova.console", "com.ionic.keyboard"];
var fs = require("fs");
var path = require("path");
var sys = require("sys");
var exec = require("child_process").exec;
var dirPlugins = path.join(__dirname, "../../plugins");
var CORDOVA_PLATFORMS = process.env.CORDOVA_PLATFORMS;
function getDirectories(srcpath)  {
   return fs.readdirSync(srcpath).filter(function(file)  {
         return fs.statSync(path.join(srcpath, file)).isDirectory();
      }
   );
}
;
var deleteFolderRecursive = function(strPath)  {
   if (fs.existsSync(strPath))  {
      fs.readdirSync(strPath).forEach(function(file, index)  {
            var curPath = path.join(strPath, file);
            if (fs.lstatSync(curPath).isDirectory())  {
               deleteFolderRecursive(curPath);
            }
             else  {
               fs.unlinkSync(curPath);
            }
         }
      );
      fs.rmdirSync(strPath);
   }
}
;
function puts(error, stdout, stderr)  {
   sys.puts(stdout);
}
;
pluginlist.forEach(function(plug)  {
      exec("cordova plugin remove " + plug, puts);
   }
);
pluginlist.forEach(function(plug)  {
      exec("cordova plugin add " + plug, puts);
   }
);
exec("gulp image:cordova", puts);
