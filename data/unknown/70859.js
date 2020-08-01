! ✖ / env;
node;
var PropertiesLoader = require("../lib/resource/propertiesLoader");
var ResourceLoader = require("../lib/resource/resourceLoader");
var Version = require("../package.json").version;
var program = require("commander");
var bearcat = require("../index");
var Path = require("path");
var fs = require("fs");
bearcat.createApp();
var Root;
function()  {
   Root = this;
}
();
Root.bearcat = bearcat;
process.env.LOADER_BIN = "on";
var resourceLoader = new ResourceLoader();
var propertiesLoader = new PropertiesLoader();
var BearcatBin =  {} ;
var rootPath = process.cwd();
var defaultCpath = rootPath + "/context.json";
var defaultConfigPath = rootPath + "/config";
var defaultOutputFile = "bearcat-bootstrap.js";
var defaultEnv = "dev";
program.version(Version);
program.command("generate").alias("g").description("generate bearcat-bootstrap.js for frontend").option("-o, --output [value]", "specify bearcat-bootstrap.js file output file").option("-c, --context [value]", "specify bearcat context.json file path").option("-C, --config [value]", "specify config directory path").option("-e, --env [value]", "specify config env").action(function(opts)  {
      doGenerateIdPaths(opts);
   }
);
program.parse(process.argv);
function doGenerate(opts)  {
   var cpath = defaultCpath;
   if (opts["context"])  {
      cpath = Path.join(rootPath, opts["context"]);
   }
   var outputFile = defaultOutputFile;
   if (opts["output"])  {
      outputFile = Path.join(rootPath, opts["output"]);
   }
   var configPath = defaultConfigPath;
   if (opts["config"])  {
      configPath = Path.join(rootPath, opts["config"]);
   }
   var env = defaultEnv;
   if (opts["env"])  {
      env = opts["env"];
   }
   var metas = resourceLoader.load(cpath);
   fs.writeFileSync(outputFile, "var Root;
");
   fs.appendFileSync(outputFile, "(function() { Root = this; }());
");
   fs.appendFileSync(outputFile, "var metas = " + JSON.stringify(metas) + ";
");
   fs.appendFileSync(outputFile, "Root.__bearcatData__ = {};
");
   fs.appendFileSync(outputFile, "Root.__bearcatData__.metas = {};
");
   fs.appendFileSync(outputFile, "Root.__bearcatData__.configData = {};
");
   var idPaths =  {} ;
   for (var id in metas)  {
         var meta = metas[id];
         var fpath = meta["fpath"];
         var ftype = meta["ftype"];
         fs.appendFileSync(outputFile, "var id = "" + id + "";
");
         fs.appendFileSync(outputFile, "var meta = metas[id];
");
         fs.appendFileSync(outputFile, "var fpath = meta["fpath"];
");
         fpath = require.resolve(fpath);
         if (ftype === "object")  {
            fs.appendFileSync(outputFile, "meta["func"] = require("" + fpath + "")["func"];
");
         }
          else  {
            fs.appendFileSync(outputFile, "meta["func"] = require("" + fpath + "");
");
         }
         fs.appendFileSync(outputFile, "Root.__bearcatData__.metas[id] = meta;
");
         idPaths[id] = Path.relative(process.cwd(), fpath);
      }
   var properties = propertiesLoader.loadProperties(configPath, env);
   fs.appendFileSync(outputFile, "var properties = " + JSON.stringify(properties) + ";
");
   fs.appendFileSync(outputFile, "Root.__bearcatData__.configData = properties;
");
   console.log(outputFile + " generated...");
}
;
function doGenerateIdPaths(opts)  {
   var base = opts["base"];
   var cpath = defaultCpath;
   if (opts["context"])  {
      cpath = Path.join(rootPath, opts["context"]);
   }
   var outputFile = defaultOutputFile;
   if (opts["output"])  {
      outputFile = Path.join(rootPath, opts["output"]);
   }
   var configPath = defaultConfigPath;
   if (opts["config"])  {
      configPath = Path.join(rootPath, opts["config"]);
   }
   var env = defaultEnv;
   if (opts["env"])  {
      env = opts["env"];
   }
   var metas = resourceLoader.load(cpath);
   fs.writeFileSync(outputFile, "var Root;
");
   fs.appendFileSync(outputFile, "(function() { Root = this; }());
");
   fs.appendFileSync(outputFile, "Root.__bearcatData__ = {};
");
   fs.appendFileSync(outputFile, "Root.__bearcatData__.idPaths = {};
");
   var idPaths =  {} ;
   for (var id in metas)  {
         var meta = metas[id];
         var fpath = meta["fpath"];
         var ftype = meta["ftype"];
         fpath = require.resolve(fpath);
         var p = process.cwd();
         if (base)  {
            p = p + "/" + base;
         }
         idPaths[id] = Path.relative(p, fpath);
      }
   fs.appendFileSync(outputFile, "var idPaths = " + JSON.stringify(idPaths) + ";
");
   fs.appendFileSync(outputFile, "Root.__bearcatData__.idPaths = idPaths;
");
   fs.appendFileSync(outputFile, "if(typeof bearcat === "undefined") {return;}
");
   fs.appendFileSync(outputFile, "bearcat.createApp();");
   console.log(outputFile + " idPaths generated...");
}
;
BearcatBin.doGenerate = doGenerate;
BearcatBin.doGenerateIdPaths = doGenerateIdPaths;
module.exports = BearcatBin;
