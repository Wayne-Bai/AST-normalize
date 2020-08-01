! ✖ / env;
node;
require.paths.unshift(__dirname + "/../../lib/");
var WebSocketServer = require("websocket").server;
var express = require("express");
var app = express.createServer();
app.configure(function()  {
      app.use(express.static(__dirname + "/public"));
      app.set("views", __dirname);
      app.set("view engine", "ejs");
   }
);
app.get("/", function(req, res)  {
      res.render("index",  {
            layout:false         }
      );
   }
);
app.listen(8080);
var wsServer = new WebSocketServer( {
      httpServer:app, 
      fragmentOutgoingMessages:false   }
);
var connections = [];
var canvasCommands = [];
wsServer.on("request", function(request)  {
      var connection = request.accept("whiteboard-example", request.origin);
      connections.push(connection);
      console.log(connection.remoteAddress + " connected - Protocol Version " + connection.websocketVersion);
      connection.sendUTF(JSON.stringify( {
               msg:"initCommands", 
               data:canvasCommands            }
         ));
      connection.on("close", function()  {
            console.log(connection.remoteAddress + " disconnected");
            var index = connections.indexOf(connection);
            if (index !== - 1)  {
               connections.splice(index, 1);
            }
         }
      );
      connection.on("message", function(message)  {
            if (message.type === "utf8")  {
               try {
                  var command = JSON.parse(message.utf8Data);
                  if (command.msg === "clear")  {
                     canvasCommands = [];
                  }
                   else  {
                     canvasCommands.push(command);
                  }
                  connections.forEach(function(destination)  {
                        destination.sendUTF(message.utf8Data);
                     }
                  );
               }
               catch (e) {
               }
            }
         }
      );
   }
);
console.log("Whiteboard test app ready");
