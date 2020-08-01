! ✖ / bin / node;
var fs = require("fs");
var requirejs = require("requirejs");
var config =  {
   baseUrl:"src", 
   name:"main", 
   out:"dist/sumo-min.js"}
;
requirejs.optimize(config, function(buildResponse)  {
      fs.appendFile(config.out, "define(["main"], function (main) { return main; });", function(err)  {
            if (err) throw err            console.log("sumo has been trained, wrestle now!");
         }
      );
   }, 
   function(err)  {
      console.log(err);
   }
);
