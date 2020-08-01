! ✖ / env;
node;
var http = require("http");
var options =  {
   host:"127.0.0.1", 
   port:50088, 
   path:"/", 
   method:"GET"}
;
var toRun = 10000;
var completed = 0;
var started = new Date();
for (var i = 1; i <= toRun; i++)  {
      var req = http.request(options, function(res)  {
            var buffer = new Buffer(0);
            res.on("data", function(chunk)  {
                  buffer = chunk;
               }
            );
            res.on("end", function()  {
                  var bLength = buffer.length;
                  completed++;
                  if (completed == toRun)  {
                     var finished = new Date();
                     console.log("finished in", finished.getTime() - started.getTime(), "ms");
                  }
               }
            );
         }
      );
      req.end();
   }
