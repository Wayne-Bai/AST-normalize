! ✖ / env;
node;
var express = require("express");
var spah = require(__dirname + "/../src/_Spah-edge");
var stateDefaults =  {
   document:"index.html"}
;
var stateServer = new spah.stateServer();
stateServer.addExpander( {
      path:"//type == 'page'"   }, 
   function(results, root, attachments, strategy)  {
      resultSet[0].update(Page.find(1));
      return strategy.done();
   }
);
var fs = require("fs");
var appHTML = fs.readSync(__dirname + "/views/layouts/application.html");
var appBlueprint = spah.dom.bluePrint.compile();
var app = express.createServer();
app.get("/", function(request, response)  {
      var clientState = request.params("state");
      var state = stateServer.stateWith(clientState);
      state.updateWith(stateServer.defaults());
      stateServer.respond(request, response, appBlueprint, state);
   }
);
app.get("/search", function(request, response)  {
      stateServer.instruct("");
   }
);
