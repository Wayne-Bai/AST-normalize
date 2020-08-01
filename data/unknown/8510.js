! ✖ / env;
node;
var express = require("express"), http = require("http"), bower = require("bower"), async = require("async");
var server_settings = require("./settings/server");
var env = process.env.IRC_ENV || "dev";
var init_plugins = require("./lib/plugins").initialize, static = require("./lib/static"), connection = require("./lib/connection");
var cwd = __dirname;
async.waterfall([function(callback)  {
      console.log("Fetching Subway plugins...");
      init_plugins(callback);
   }
, function(callback)  {
      console.log("Downloading dependencies...");
      bower.commands.install().on("end", function(results)  {
            callback(null, results);
         }
      );
   }
, function(results, callback)  {
      console.log("Compiling static resources...");
      static(function()  {
            callback(null);
         }
      );
   }
], function(err, result)  {
      var app = express().use(express.urlencoded()).use(express.cookieParser(server_settings.cookie_secret || "subway_secret")).use(express.static(cwd + "/tmp"));
      app.configure(function()  {
            app.set("views", __dirname + "/tmp");
         }
      );
      app.engine("ejs", require("ejs").renderFile);
      var http = require("http").Server(app);
      var io = require("socket.io")(http);
      http.listen(server_settings[env] ? server_settings[env].port : server_settings.dev.port);
      connection(io, app);
   }
);
