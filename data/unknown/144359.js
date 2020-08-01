! ✖ / env;
node;
var args = process.argv.slice(2), libPath = __dirname + "/../lib", fs = require("fs"), jake = require(libPath + "/jake.js"), api = require(libPath + "/api.js"), utils = require(libPath + "/utils.js"), Program = require(libPath + "/program.js").Program, program = new Program(), Loader = require(libPath + "/loader.js").Loader, loader = new Loader(), pkg = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString()), opts, envVars, taskNames;
jake.version = pkg.version;
global.jake = jake;
process.addListener("uncaughtException", function(err)  {
      program.handleErr(err);
   }
);
program.parseArgs(args);
if (! program.preemptiveOption())  {
   opts = program.opts;
   envVars = program.envVars;
   for (var p in api)  {
         global[p] = api[p];
      }
   jake.opts = opts;
   for (var p in utils)  {
         jake[p] = utils[p];
      }
   jake.FileList = require(libPath + "/file_list").FileList;
   jake.PackageTask = require(libPath + "/package_task").PackageTask;
   jake.NpmPublishTask = require(libPath + "/npm_publish_task").NpmPublishTask;
   for (var p in envVars)  {
         process.env[p] = envVars[p];
      }
   loader.load(opts.jakefile);
   var dirname = opts.directory;
   if (dirname)  {
      process.chdir(dirname);
   }
   taskNames = program.taskNames;
   taskNames = taskNames.length ? taskNames : ["default"];
   task("__root__", taskNames, function()  {
      }
   );
   if (opts.tasks)  {
      jake.showAllTaskDescriptions(opts.tasks);
   }
    else  {
      jake.Task["__root__"].invoke();
   }
}
