! ✖ / env;
node;
var Server = require("../src/server/Server");
var tsdHost = process.argv[2] || "localhost", tsdPort = process.argv[3] || 4242, tsdSSL = false, tsdBasicHTTPAuth = null, staticDir = __dirname + "/../static", localHost = "localhost", localPort = 8080;
var dashboardServer = new Server( {
      tsdHost:tsdHost, 
      tsdPort:tsdPort, 
      tsdSSL:tsdSSL, 
      tsdBasicHTTPAuth:tsdBasicHTTPAuth, 
      tsdRewrite:["/tsd/", "/"], 
      staticDir:staticDir, 
      printStackTrace:true, 
      disableAuth:true   }
);
dashboardServer.listen(localPort, localHost);
var requireServer = require("require/server");
requireServer.listen(1234,  {
      host:"localhost", 
      path:__dirname + "/../src/client"   }
);
console.log("opentsdb dashboard is running in development mode on", localHost + ":" + localPort, "and expects TSD to be running on", tsdHost + ":" + tsdPort);
