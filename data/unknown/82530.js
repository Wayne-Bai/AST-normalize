! ✖ / env;
node;
var fs = require("fs");
var https = require("https");
var path = require("path");
var config = require("../lib/configuration");
var mozlog = require("mozlog");
var isMain = process.argv[1] === __filename;
if (isMain)  {
   process.chdir(path.dirname(__dirname));
}
var config = require("../lib/configuration");
mozlog.config(config.get("logging"));
var logger = require("mozlog")("server.main");
var helmet = require("helmet");
var express = require("express");
var consolidate = require("consolidate");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var serveStatic = require("serve-static");
var i18n = require("../lib/i18n")(config.get("i18n"));
var routes = require("../lib/routes")(config, i18n);
var routeLogging = require("../lib/logging/route_logging");
var fourOhFour = require("../lib/404");
var serverErrorHandler = require("../lib/500");
var localizedRender = require("../lib/localized-render");
var csp = require("../lib/csp");
var STATIC_DIRECTORY = path.join(__dirname, "..", "..", config.get("static_directory"));
var PAGE_TEMPLATE_DIRECTORY = path.join(config.get("page_template_root"), config.get("page_template_subdirectory"));
logger.info("page_template_directory: %s", PAGE_TEMPLATE_DIRECTORY);
function makeApp()  {
   "use strict";
   var app = express();
   app.engine("html", consolidate.handlebars);
   app.set("view engine", "html");
   app.set("views", PAGE_TEMPLATE_DIRECTORY);
   app.use(i18n);
   app.use(localizedRender( {
            i18n:i18n         }
      ));
   app.use(helmet.xframe("deny"));
   app.use(helmet.xssFilter());
   app.use(helmet.hsts( {
            maxAge:config.get("hsts_max_age"), 
            includeSubdomains:true, 
            force:true         }
      ));
   app.use(helmet.nosniff());
   if (config.get("csp.enabled"))  {
      app.use(csp);
   }
   app.disable("x-powered-by");
   app.use(routeLogging());
   app.use(cookieParser());
   app.use(bodyParser.json());
   var ableOptions =  {
      dir:config.get("experiments.dir"), 
      git:config.get("experiments.git"), 
      watch:config.get("experiments.watch"), 
      addRoutes:true   }
;
   app.use(require("express-able")(ableOptions));
   routes(app);
   app.use(serveStatic(STATIC_DIRECTORY,  {
            maxAge:config.get("static_max_age")         }
      ));
   app.use(fourOhFour);
   app.use(serverErrorHandler);
   return app;
}
;
var app, port;
function listen(theApp)  {
   "use strict";
   app = theApp || app;
   if (config.get("use_https"))  {
      port = config.get("port");
      var tlsoptions =  {
         key:fs.readFileSync(config.get("key_path")), 
         cert:fs.readFileSync(config.get("cert_path"))      }
;
      https.createServer(tlsoptions, app).listen(port);
      app.on("error", function(e)  {
            if ("EACCES" === e.code)  {
               logger.error("Permission Denied, maybe you should run this with sudo?");
            }
             else if ("EADDRINUSE" === e.code)  {
               logger.error("Unable to listen for connections, this service might already be running?");
            }
            throw e;
         }
      );
   }
    else  {
      port = config.get("port");
      app.listen(port, "0.0.0.0");
   }
   if (isMain)  {
      logger.info("Firefox Account Content server listening on port", port);
   }
   return true;
}
;
function makeHttpRedirectApp()  {
   "use strict";
   var redirectProtocol = config.get("use_https") ? "https://" : "http://";
   var redirectPort = port === 443 ? "" : ":" + port;
   var httpApp = express();
   httpApp.get("*", function(req, res)  {
         var redirectTo = redirectProtocol + req.host + redirectPort + req.url;
         res.redirect(301, redirectTo);
      }
   );
   return httpApp;
}
;
function listenHttpRedirectApp(httpApp)  {
   "use strict";
   var httpPort = config.get("use_https") ? config.get("redirect_port") : config.get("http_port");
   httpApp.listen(httpPort, "0.0.0.0");
   if (isMain)  {
      logger.info("Firefox Account HTTP redirect server listening on port", httpPort);
   }
}
;
if (isMain)  {
   app = makeApp();
   listen(app);
   var httpApp = makeHttpRedirectApp();
   listenHttpRedirectApp(httpApp);
}
 else  {
   module.exports =  {
      listen:listen, 
      makeApp:makeApp, 
      makeHttpRedirectApp:makeHttpRedirectApp, 
      listenHttpRedirectApp:listenHttpRedirectApp   }
;
}
