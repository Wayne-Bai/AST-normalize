! ✖ / env;
node;
var express = require("express");
_ = require("underscore");
async = require("async");
var config = require("./lib/config-load")();
var inject = require("./lib/inject");
var balance = require("./lib/balance");
var middleware = require("./lib/middleware");
var locals = require("./lib/locals");
var flash = require("./lib/flash");
var mongoose = require("./lib/mongoose");
var redis = require("./lib/redis");
var reload = require("./lib/reload")();
var emailer = require("./lib/emailer");
var user = require("./components/user");
var dashboard = require("./components/dashboard");
var errors = require("./components/errors");
module.exports = createApp;
function createApp(config)  {
   var app = express();
   app.config = app.locals.config = config;
   mongoose(app, config);
   redis(app);
   inject(app);
   middleware(app);
   locals(app);
   flash(app);
   emailer(app);
   reload();
   user(app, config);
   dashboard(app, config);
   errors(app, config);
   return app;
}
;
function startApp()  {
   var app = createApp(config);
   app.listen(config.port);
   console.log("Listening on", config.port);
}
;
if (module === require.main)  {
   var debugMode = process.execArgv && process.execArgv[0] && process.execArgv[0].indexOf("--debug") > - 1;
   var simpleMode = process.argv[2] == "simple";
   if (debugMode || simpleMode) startApp()    else balance(startApp)}
