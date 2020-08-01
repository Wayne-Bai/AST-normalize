! ✖ / env;
node;
var config =  {
   http: {
      defaultPort:80, 
      indexFile:"/index.html", 
      resourceDir:"public"   }, 
   redis: {
      port:6379, 
      host:"localhost", 
      subscriptionChannel:"data"   }} ;
var $r =  {
   express:require("express"), 
   opts:require("opts"), 
   redis:require("redis"), 
   websocket:require("websocket"), 
   uid:require("./uid")}
;
$r.opts.parse([ {
      short:"p", 
      long:"port", 
      description:"Port to open", 
      value:true, 
      required:false   }
]);
var app = $r.express.createServer();
var serverPort = $r.opts.get("port") || config.http.defaultPort;
app.configure(function()  {
      app.use($r.express.static(__dirname + "/" + config.http.resourceDir));
   }
);
app.get("/", function(request, response)  {
      app.render(config.http.indexFile);
   }
);
app.listen(serverPort, function()  {
      console.log(new Date() + " : Server is listening on port " + serverPort + ".");
   }
);
var wsConnections = [];
var wsServer = new $r.websocket.server( {
      httpServer:app, 
      autoAcceptConnections:true   }
);
wsServer.broadcast = function(message, conToExclude)  {
   wsConnections.forEach(function(connection)  {
         if (conToExclude && connection.uid && conToExclude == connection.uid)  {
            return ;
         }
         connection.sendUTF(message);
      }
   );
}
;
wsServer.on("connect", function(connection)  {
      console.log(new Date() + " : Connection accepted.");
      connection.uid = $r.uid.generate();
   }
);
console.log("UID : " + connection.uid);
wsConnections.push(connection);
connection.on("message", function(message)  {
      var data;
      if (message.type === "utf8")  {
         data = message.utf8Data;
      }
       else if (message.type === "binary")  {
         data = message.binaryData;
      }
      publisher.publish("data", connection.uid + "@" + data);
   }
);
connection.on("close", function()  {
      console.log(new Date() + " : Connection " + connection.remoteAddress + "disconnected.");
      wsConnections.splice(wsConnections.indexOf(connection), 1);
   }
);
;
var publisher = $r.redis.createClient(config.redis.port, config.redis.host);
var subscriber = $r.redis.createClient(config.redis.port, config.redis.host);
publisher.on("error", function(err)  {
      console.log(new Date() + " : Redis error - " + err);
   }
);
subscriber.subscribe(config.redis.subscriptionChannel);
subscriber.on("error", function(err)  {
      console.log(new Date() + " : Redis error - " + err);
   }
);
subscriber.on("message", function(channel, message)  {
      if (channel == config.redis.subscriptionChannel)  {
         var pos = message.indexOf("@");
         var uid = message.substring(0, pos);
         var content = message.substring(pos + 1);
         wsServer.broadcast(content, uid);
      }
   }
);
