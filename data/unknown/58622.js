! ✖ / env;
node;
"use strict";
var fs = require("fs");
var harmonize = require("harmonize");
var optimist = require("optimist");
var path = require("path");
function _wrapDesc(desc)  {
   var indent = "
      ";
   return indent + desc.split(" ").reduce(function(wrappedDesc, word)  {
         var lastLineIdx = wrappedDesc.length - 1;
         var lastLine = wrappedDesc[lastLineIdx];
         var appendedLastLine = lastLine === "" ? word : lastLine + " " + word;
         if (appendedLastLine.length > 80)  {
            wrappedDesc.push(word);
         }
          else  {
            wrappedDesc[lastLineIdx] = appendedLastLine;
         }
         return wrappedDesc;
      }, 
      [""]).join(indent);
}
;
harmonize();
var argv = optimist.usage("Usage: $0 [--config=<pathToConfigFile>] [TestPathRegExp]").options( {
      config: {
         alias:"c", 
         description:_wrapDesc("The path to a jest config file specifying how to find and execute " + "tests."), 
         type:"string"      }, 
      coverage: {
         description:_wrapDesc("Indicates that test coverage information should be collected and " + "reported in the output."), 
         type:"boolean"      }, 
      maxWorkers: {
         alias:"w", 
         description:_wrapDesc("Specifies the maximum number of workers the worker-pool will spawn " + "for running tests. This defaults to the number of the cores " + "available on your machine. (its usually best not to override this " + "default)"), 
         type:"string"      }, 
      onlyChanged: {
         alias:"o", 
         description:_wrapDesc("Attempts to identify which tests to run based on which files have " + "changed in the current repository. Only works if you're running " + "tests in a git repository at the moment."), 
         type:"boolean"      }, 
      runInBand: {
         alias:"i", 
         description:_wrapDesc("Run all tests serially in the current process (rather than creating " + "a worker pool of child processes that run tests). This is sometimes " + "useful for debugging, but such use cases are pretty rare."), 
         type:"boolean"      }, 
      testEnvData: {
         description:_wrapDesc("A JSON object (string) that specifies data that will be made " + "available in the test environment (via jest.getEnvData())"), 
         type:"string"      }, 
      version: {
         alias:"v", 
         description:_wrapDesc("Print the version and exit"), 
         type:"boolean"      }} ).check(function(argv)  {
      if (argv.runInBand && argv.hasOwnProperty("maxWorkers"))  {
         throw "Both --runInBand and --maxWorkers were specified, but these two " + "options do not make sense together. Which is it?";
      }
      if (argv.onlyChanged && argv._.length > 0)  {
         throw "Both --onlyChanged and a path pattern were specified, but these two " + "options do not make sense together. Which is it? Do you want to run " + "tests for changed files? Or for a specific set of files?";
      }
      if (argv.testEnvData)  {
         argv.testEnvData = JSON.parse(argv.testEnvData);
      }
   }
).argv;
if (argv.help)  {
   optimist.showHelp();
   process.on("exit", function()  {
         process.exit(1);
      }
   );
   return ;
}
var cwd = process.cwd();
var cwdPackageRoot = cwd;
while (! fs.existsSync(path.join(cwdPackageRoot, "package.json")))  {
      if (cwdPackageRoot === "/")  {
         cwdPackageRoot = cwd;
         break;
      }
      cwdPackageRoot = path.resolve(cwdPackageRoot, "..");
   }
var cwdPkgJsonPath = path.join(cwdPackageRoot, "package.json");
var cwdJestBinPath = path.join(cwdPackageRoot, "node_modules/jest-cli");
var jest;
if (fs.existsSync(cwdJestBinPath))  {
   jest = require(cwdJestBinPath);
   if (! jest.runCLI)  {
      console.error("This project requires an older version of Jest than what you have " + "installed globally.
" + "Please upgrade this project past Jest version 0.1.5");
      process.on("exit", function()  {
            process.exit(1);
         }
      );
      return ;
   }
}
 else  {
   jest = require("../");
   if (fs.existsSync(cwdPkgJsonPath))  {
      var cwdPkgJson = require(cwdPkgJsonPath);
      var cwdPkgDeps = cwdPkgJson.dependencies;
      var cwdPkgDevDeps = cwdPkgJson.devDependencies;
      if (cwdPkgDeps && cwdPkgDeps["jest-cli"] || cwdPkgDevDeps && cwdPkgDevDeps["jest-cli"])  {
         console.error("Please run `npm install` to use the version of Jest intended for " + "this project.");
         process.on("exit", function()  {
               process.exit(1);
            }
         );
         return ;
      }
   }
}
if (! argv.version)  {
   console.log("Using Jest CLI v" + jest.getVersion());
}
jest.runCLI(argv, cwdPackageRoot, function(success)  {
      process.on("exit", function()  {
            process.exit(success ? 0 : 1);
         }
      );
   }
);
