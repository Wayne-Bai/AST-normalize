! ✖ / env;
node;
var http = require("http"), flights = require("./data"), db = require("./db"), repl = require("repl"), argv = require("optimist").argv, app = require("./app")(flights, db);
http.createServer(app).listen(app.get("port"), function()  {
      console.log("Houston, we're a go on port " + app.get("port"));
   }
);
var prompt = repl.start( {
      prompt:"airline>"   }
);
prompt.context.flight = flights;
if (argv.flight && argv.destination)  {
   flights[argv.flight].data.destination = argv.destination;
}
;
