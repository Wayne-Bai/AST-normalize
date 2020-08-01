! ✖ / env;
node;
var irc = require("irc");
var express = require("express");
var messages = ["First message"];
var client = new irc.Client("irc.freenode.net", "makeryintercom",  {
      channels:["#omgtest"]   }
);
client.addListener("message", function(from, to, message)  {
      console.log(from + " => " + to + ": " + message);
   }
);
client.addListener("message", function(from, to, message)  {
      var matcher = /^makery:\s?(.*)/i.exec(message);
      if (matcher !== null)  {
         console.log("Makery message: ", matcher[1]);
         messages.push(matcher[1]);
      }
   }
);
client.addListener("error", function(message)  {
      console.log("error: ", message);
   }
);
var app = express();
app.get("/", function(req, res)  {
      res.json(messages);
   }
);
app.post("/", function(req, res)  {
      console.log(req);
   }
);
app.listen(8080);
