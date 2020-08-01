! ✖ / env;
node;
var util = require("util");
var fwk = require("fwk");
var express = require("express");
var http = require("http");
var app = express.createServer();
var io = require("socket.io").listen(app);
var cfg = fwk.populateConfig(require("./config.js").config);
var edit = require("./lib/edit.js").edit( {
      cfg:cfg   }
);
app.configure(function()  {
      app.use(express.static(__dirname + "/public"));
      app.use(express.cookieParser());
      app.use(express.methodOverride());
   }
);
app.configure("development", function()  {
      app.use(express.errorHandler( {
               dumpExceptions:true, 
               showStack:true            }
         ));
   }
);
app.configure("production", function()  {
      app.use(express.errorHandler());
   }
);
app.get("/file", function(req, res, next)  {
      var path = req.param("path");
      edit.read(path, function(err, buf)  {
            if (err)  {
               res.send(err.message, 500);
            }
             else  {
               res.send(buf);
            }
         }
      );
   }
);
app.put("/file", function(req, res, next)  {
      req.setEncoding("utf8");
      var path = req.param("path");
      var buf = "";
      req.on("data", function(chunk)  {
            buf = chunk;
         }
      );
      req.on("end", function()  {
            edit.write(path, buf, function(err)  {
                  if (err)  {
                     res.send(err.message, 500);
                  }
                   else  {
                     console.log("write " + path);
                     res.json( {
                           ok:true                        }
                     );
                  }
               }
            );
         }
      );
   }
);
app.get("/autocomplete", function(req, res, next)  {
      var path = req.param("path");
      var current = req.param("current");
      edit.autocomplete(path, current, function(err, paths)  {
            if (err)  {
               res.send(err.message, 500);
            }
             else  {
               res.json( {
                     ok:true, 
                     paths:paths                  }
               );
            }
         }
      );
   }
);
io.sockets.on("connection", function(socket)  {
      socket.emit("ping",  {
            msg:"Hello. I know socket.io."         }
      );
      socket.on("pong", function(data)  {
            console.log(data.msg);
         }
      );
   }
);
app.listen(35710, "127.0.0.1");
