! ✖ / env;
node;
"use strict";
var fs = require("fs");
var program = require("commander");
var shell = require("shelljs");
program.version("0.0.1").on("--help", function()  {
      console.log("  Run this for bootstraping the Grunt toolchain.");
      console.log("");
   }
).parse(process.argv);
var rootDir = shell.pwd();
var packages = [];
var usingCachePackages = [];
var tasks = [];
var usedByTasksPackages = [];
shell.cd("task/package");
shell.exec("node runNpmCmd.js install cache");
usingCachePackages = ["dependency", "compression"];
usingCachePackages.forEach(function(pkg)  {
      shell.cd(pkg);
      if (shell.test("-L", "node_modules/qx-cache"))  {
         fs.unlinkSync("node_modules/qx-cache");
      }
      shell.mkdir("-p", "node_modules");
      fs.symlinkSync("../../cache/", "node_modules/qx-cache", "dir");
      shell.cd("../");
   }
);
packages = shell.ls(".").filter(function(dirOrFile)  {
      return ["cache"].indexOf(dirOrFile) === - 1 && dirOrFile.indexOf(".") === - 1;
   }
);
packages.forEach(function(pkg)  {
      shell.exec("node runNpmCmd.js install " + pkg);
   }
);
shell.cd(rootDir);
tasks = ["source", "build"];
usedByTasksPackages = ["compression", "dependency", "library", "resource", "translation", "locale"];
tasks.forEach(function(task)  {
      shell.cd("task/" + task);
      packages.forEach(function(pkg)  {
            usedByTasksPackages.forEach(function(usedPkg)  {
                  var nodeModulePath = "node_modules/qx-" + usedPkg;
                  if (shell.test("-L", nodeModulePath))  {
                     fs.unlinkSync(nodeModulePath);
                  }
                  shell.mkdir("-p", "node_modules");
                  fs.symlinkSync("../../package/" + usedPkg + "/", nodeModulePath, "dir");
               }
            );
            shell.exec("npm install");
         }
      );
      shell.cd(rootDir);
   }
);
