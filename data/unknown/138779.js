! ✖ / env;
node;
var port = 8000;
var path = require("path");
var http = require("http");
var assetsPath = process.argv[2] || "./";
var catapult = require(path.join(__dirname, "../lib/catapult.js"));
var manifestServer = new catapult.ManifestServer().setManifestsFolder(assetsPath);
var manifestFileWatcher = new catapult.ManifestFileWatcher().setManifestServer(manifestServer);
var httpserver = http.createServer(function(req, res)  {
      if (! manifestServer.onHttpRequest(req, res))  {
         res.writeHead(404);
         res.write("<!DOCTYPE html><html><body><h1>Unknown API</h1>" + JSON.stringify(manifestServer.manifests, null, "	") + "</body></html>");
         res.end();
      }
   }
);
var manifestWebsockets = new catapult.ManifestWebsocket().setManifestFileWatcher(manifestFileWatcher).createWebsocketServer(httpserver);
httpserver.listen(port, "0.0.0.0", function()  {
      console.log("Manifest server listening on 0.0.0.0:" + port + "
Manifest URLS:
http://localhost:" + port + "/manifests.json");
   }
);
