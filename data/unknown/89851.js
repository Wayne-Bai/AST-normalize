! ✖ / env;
node;
var WebSocket = require("ws");
var WebSocketServer = WebSocket.Server;
var DevToolsAgentProxy = module.exports = function()  {
   this.wss = null;
   this.backend = null;
   this.frontend = null;
   this.debuggerAgent = null;
   this.port = process.argv[2] || 9999;
   this.bind_to = process.argv[3] || "0.0.0.0";
   this.ipc_port = process.argv[4] || 3333;
   this.verbose = process.argv[5] || false;
}
;
function()  {
   process.on("uncaughtException", function(err)  {
         console.error("webkit-devtools-agent: Websockets service uncaught exception: ");
         console.error(err.stack);
      }
   );
   this.onFrontendMessage = function(message)  {
      var self = this;
      var data;
      try {
         data = JSON.parse(message);
      }
      catch (e) {
         console.log(e.stack);
      }
      var command = data.method.split(".");
      var domainName = command[0];
      if (domainName !== "Debugger")  {
         this.backend.send(message);
         return ;
      }
      var id = data.id;
      var method = command[1];
      var params = data.params;
   }
;
   this.frontends = [];
   this.onFrontendConnection = function(socket)  {
      var self = this;
      socket.on("message", this.onFrontendMessage.bind(this));
      socket.on("close", function()  {
            for (var i = 0; i < this.frontends.length; i++)  {
                  if (this.frontends[i] === socket)  {
                     this.frontends.splice(i, 1);
                  }
               }
         }
.bind(this));
      this.frontends.push(socket);
      if (this.verbose)  {
         console.log("webkit-devtools-agent: new frontend connection!");
      }
   }
;
   this.onBackendOpen = function()  {
      this.wss = new WebSocketServer( {
            port:this.port, 
            host:this.bind_to         }
      );
      if (this.verbose)  {
         console.log("webkit-devtools-agent: Websockets " + "service started on %s:%s", this.bind_to, this.port);
      }
      this.wss.on("connection", this.onFrontendConnection.bind(this));
   }
;
   this.onBackendMessage = function(message)  {
      this.frontends.forEach(function(socket)  {
            socket.send(message);
         }
      );
   }
;
   this.start = function()  {
      this.backend = new WebSocket("ws://localhost:" + this.ipc_port);
      this.backend.on("open", this.onBackendOpen.bind(this));
      this.backend.on("message", this.onBackendMessage.bind(this));
      this.frontends = [];
   }
;
   this.stop = function()  {
      if (this.wss)  {
         this.frontends = [];
         this.wss.close();
         this.wss = null;
         if (this.verbose)  {
            console.log("webkit-devtools-agent: Websockets service with PID " + process.pid + " has stopped");
         }
      }
   }
;
}
.call(DevToolsAgentProxy.prototype);
var proxy = new DevToolsAgentProxy();
proxy.start();
["exit", "SIGTERM", "SIGHUP"].forEach(function(s)  {
      process.on(s, function()  {
            proxy.stop();
         }
      );
   }
);
