! ✖ / env;
node;
var Stubcell = require("../lib/stubcell");
var program = require("commander");
var path = require("path");
var package = require("../package.json");
program.version(package.version).option("-p,--port <n>", "server start port, default is 8090", parseInt).option("-e,--entry [entry filepath]", "entry yaml file, default is " + process.cwd() + "/entry.yaml ").option("-b,--basepath [stub json basepath]", "json basepath, default is entry.yaml parent path ").option("--record_target [record target server]", "record target server, default is null (no record file)").option("-s,--silent", "hide detail info, default is false").option("-l,--loose", "compare loose").parse(process.argv);
var stubcell = new Stubcell();
var entry = program.entry || process.cwd() + "/entry.yaml";
entry = path.resolve(entry);
var basepath = program.basepath;
var port = program.port || 8090;
var debug = ! program.silent;
var record =  {} ;
if (program.record_target) record.target = program.record_targetif (record.proxy) record.debug = debugstubcell.loadEntry(entry,  {
      debug:debug, 
      basepath:basepath, 
      record:record, 
      looseCompare:program.loose   }
);
var app = stubcell.server();
var app = app.listen(port);
app.on("listening", function()  {
      console.log("[32m" + "Listening on " + port + "[39m");
      console.log("[32m" + "entry yaml is " + entry + "[39m");
      console.log("[32m" + "silent is " + ! debug + "[39m");
      console.log("[32m" + "record proxy is " + record.proxy + "[39m");
      console.log("[32m" + "loose compare " + program.loose + "[39m");
   }
);
