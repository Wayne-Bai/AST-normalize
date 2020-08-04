! ✖ / env;
node(function()  {
      "use strict";
   }
);
var xmpp = require("./Connection");
var ws = require("./webserver");
var featureManager = require("./FeatureManager.js");
var fs = require("fs");
var path = require("path");
var rpc = require("webinos-jsonrpc2");
var argv = process.argv;
var WebinosFeatures = require("./WebinosFeatures.js");
var logger = require("./Logger").getLogger("pzp", "info");
var webinos = require("find-dependencies")(__dirname);
var pzp = webinos.global.require(webinos.global.pzp.location, "lib/pzp");
var webinosPath = webinos.global.require(webinos.global.util.location, "lib/webinosPath.js").webinosPath;
var wId = webinos.global.require(webinos.global.util.location, "lib/webinosId.js");
function initializeWidgetServer(port)  {
   var wrt = webinos.global.require(webinos.global.manager.widget_manager.location, "lib/ui/widgetServer");
   if (typeof wrt !== "undefined")  {
      wrt.start(false, false, port, function(msg, wrtPort)  {
            if (msg === "startedWRT")  {
               logger.info("Started the WRT");
               var wrtConfig =  {} ;
               wrtConfig.runtimeWebServerPort = wrtPort;
               wrtConfig.pzpWebSocketPort = pzp.session.getWebinosPorts().pzp_webSocket;
               wrtConfig.pzpPath = pzp.session.getWebinosPath();
               fs.writeFile(path.join(pzp.session.getWebinosPath(), "wrt/webinos_runtime.json"), JSON.stringify(wrtConfig, null, " "), function(err)  {
                     if (err)  {
                        logger.warn("error saving runtime configuration file: " + err);
                     }
                      else  {
                        logger.info("saved configuration runtime file");
                     }
                  }
               );
            }
             else  {
               logger.warn("error starting wrt server: " + msg);
            }
         }
      );
   }
}
;
var optimist = require("optimist").usage("Usage: $0 <index> --jid=<your jid> --password=<your password> [--bosh=<bosh url>] [--widgets]













var argv = optimist.argv;
if (argv._ == "")  {
   optimist.showHelp();
   logger.error("Add an index to the commandline.");
   return ;
}
var port = 8000 + 10 * argv._;
logger.info("Using index=" + argv._ + ", jid=" + argv.jid + " and port=" + port);
var webinosRoot;
wId.fetchDeviceName("Pzp", undefined, function(deviceName)  {
      webinosRoot = path.join(webinosPath(), deviceName);
   }
);
pzp.session.getWebinosPath = function()  {
   return webinosRoot;
}
;
pzp.session.getWebinosPorts = function()  {
   return  {
      pzp_webSocket:port + 1   }
;
}
;
var rpcRegistry = new rpc.Registry();
var rpcHandler = new rpc.RPCHandler(this, rpcRegistry);
var connection = new xmpp.Connection(rpcHandler);
logger.verbose("Initialising connection to xmpp server.");
connection.connect( {
      jid:argv.jid, 
      password:argv.password, 
      bosh:argv.bosh   }, 
   function()  {
      logger.info("Connected to the XMPP server.");
   }
);
connection.on("end", function()  {
      logger.info("Connection has been terminated. Stopping...");
      process.exit(1);
   }
);
logger.verbose("Starting servers...");
ws.start(port, port + 1, rpcHandler, connection);
featureManager.initialize(connection, rpcHandler);
if (argv.widgets)  {
   initializeWidgetServer(port + 1);
}
logger.verbose("Done starting servers.");
;