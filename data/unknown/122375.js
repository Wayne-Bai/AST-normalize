! ✖ / env;
node;
var pluginlist = ["org.apache.cordova.device@0.2.12", "org.apache.cordova.console@0.2.11", "org.apache.cordova.inappbrowser@0.5.2", "com.ionic.keyboard@1.0.3", "com.pushwoosh.plugins.pushwoosh@3.3.0", "https://bitbucket.org/180vita/cordova-adjust-sdk/", "com.danielcwilson.plugins.googleanalytics@0.6.0", "org.apache.cordova.statusbar@0.1.8"];
var fs = require("fs");
var path = require("path");
var sys = require("sys");
var exec = require("child_process").exec;
function puts(error, stdout, stderr)  {
   sys.puts(stdout);
}
;
pluginlist.forEach(function(plugin)  {
      exec("cordova plugin add " + plugin, puts);
   }
);
