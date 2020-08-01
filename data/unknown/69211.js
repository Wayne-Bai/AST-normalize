! ✖ / env;
node;
var program = require("commander"), version = require("./package").version, request = require("coap").request, URL = require("url"), through = require("through2"), method = "GET", url;
program.version(version).option("-o, --observe", "Observe the given resource", "boolean", false).option("-n, --no-new-line", "No new line at the end of the stream", "boolean", true).option("-p, --payload <payload>", "The payload for POST and PUT requests").option("-q, --quiet", "Do not print status codes of received packets", "boolean", false).usage("[command] [options] url");
["GET", "PUT", "POST", "DELETE"].forEach(function(name)  {
      program.command(name.toLowerCase()).description("performs a " + name + " request").action(function()  {
            method = name;
         }
      );
   }
);
program.parse(process.argv);
if (! program.args[0])  {
   program.outputHelp();
   process.exit(- 1);
}
url = URL.parse(program.args[0]);
url.method = method;
url.observe = program.observe;
if (url.protocol !== "coap:" || ! url.hostname)  {
   console.log("Wrong URL. Protocol is not coap or no hostname found.");
   process.exit(- 1);
}
req = request(url).on("response", function(res)  {
      if (! res.payload.length && ! program.quiet) process.stderr.write("[1m(" + res.code + ")[0m
")      res.pipe(through(function(chunk, enc, callback)  {
               if (! program.quiet) process.stderr.write("[1m(" + res.code + ")[0m	")               if (program.newLine && chunk) chunk = chunk.toString("utf-8") + "
"               this.push(chunk);
               callback();
            }
         )).pipe(process.stdout);
      if (! res.payload.length) process.exit(0)   }
);
if (method === "GET" || method === "DELETE" || program.payload)  {
   req.end(program.payload);
   return ;
}
process.stdin.pipe(req);
