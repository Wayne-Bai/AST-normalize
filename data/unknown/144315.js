! ✖ / env;
node;
var termkit =  {
   version:1}
;
require.paths.unshift(__dirname + "/../Shared/");
var http = require("http"), io = require("socket.io-node"), router = require("./router");
var config = require("./config").getConfig();
var server = http.createServer(function(request, result)  {
   }
);
server.listen(2222);
var ioServer = io.listen(server);
ioServer.sockets.on("connection", function(client)  {
      var p = new router.router(client);
   }
);
