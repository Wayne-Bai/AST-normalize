! ✖ / env;
node;
var express = require("express");
var sprintf = require("sprintf").sprintf;
var Cluster = require("cluster2");
var argv = require("optimist").usage("Usage: $0 -h [host] -p [port]").default("h", "localhost").default("p", 8080).argv;
function handleRequest(req, res)  {
   res.writeHead(200,  {} );
   res.end("");
}
;
function run()  {
   var server = express.createServer(), cluster;
   server.get("*", handleRequest);
   server.post("*", handleRequest);
   server.put("*", handleRequest);
   server.del("*", handleRequest);
   cluster = new Cluster( {
         port:argv.p, 
         monPort:3002      }
   );
   cluster.listen(function(callback)  {
         callback(server);
         console.log("Server listening on %s:%s", argv.h, argv.p);
      }
   );
}
;
run();
