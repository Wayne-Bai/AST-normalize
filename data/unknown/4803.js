! ✖ / env;
node;
var path = require("path"), fs = require("fs"), filepath = path.join(path.dirname(fs.realpathSync(__filename)), ".."), util = require("util"), spawn = require("child_process").spawn;
function installBowerDeps()  {
   console.log("REBOUND POSTINSTALL: Rebound NPM Install Success!");
   console.log("REBOUND POSTINSTALL: Installing Rebound Bower Deps...");
   ps = spawn("bower", ["install"],  {
         stdio:"inherit", 
         cwd:filepath      }
   );
   ps.on("exit", npmInstallHandlebars);
   ps.on("error", function(err)  {
         console.log("REBOUND POSTINSTALL: Error Running Rebound Bower Install!", err);
      }
   );
}
;
function npmInstallHandlebars()  {
   console.log("REBOUND POSTINSTALL: Rebound Bower Install Success!");
   console.log("REBOUND POSTINSTALL: Installing Handlebars NPM Deps...");
   ps = spawn("npm", ["install"],  {
         stdio:"inherit", 
         cwd:filepath + "/bower_components/handlebars"      }
   );
   ps.on("exit", gruntBuildHandlebars);
   ps.on("error", function(err)  {
         console.log("REBOUND POSTINSTALL: Error Running Handlebars NPM Install!", err);
      }
   );
}
;
function gruntBuildHandlebars()  {
   console.log("REBOUND POSTINSTALL: Handlebars NPM Install Success!");
   console.log("REBOUND POSTINSTALL: Building Handlebars...");
   ps = spawn("grunt", ["build"],  {
         stdio:"inherit", 
         cwd:filepath + "/bower_components/handlebars"      }
   );
   ps.on("exit", gruntBuildRebound);
   ps.on("error", function(err)  {
         console.log("REBOUND POSTINSTALL: Error Running Handlebars Grunt Build!", err);
      }
   );
}
;
function gruntBuildRebound()  {
   console.log("REBOUND POSTINSTALL: Handlebars Grunt Build Success!");
   console.log("REBOUND POSTINSTALL: Running Rebound Grunt Build...");
   ps = spawn("grunt", ["build"],  {
         stdio:"inherit", 
         cwd:filepath      }
   );
   ps.on("error", function(err)  {
         console.log("REBOUND POSTINSTALL: Error Running Rebound Grunt Build!", err);
      }
   );
}
;
installBowerDeps();
