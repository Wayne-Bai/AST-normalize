! ✖ / env;
node;
"use strict";
var fs = require("fs"), path = require("path"), inDir = process.argv[2], optionKey = process.argv[3], jsFileRegExp = /\.js$/, exists = fs.existsSync || path.existsSync, bootstrapSrcDir, bootstrapPaths, popoverContent, allPlugins = [];
if (! inDir)  {
   console.log("Usage: bootstrap-amd bootstrapSrcDir");
   console.log("git clone https://github.com/twitter/bootstrap.git");
   process.exit(1);
}
;
inDir = path.normalize(inDir);
if (inDir.lastIndexOf("/") !== inDir.length - 1)  {
   inDir = "/";
}
;
bootstrapSrcDir = path.join(inDir, "js/");
if (! exists(bootstrapSrcDir) || ! fs.statSync(bootstrapSrcDir).isDirectory())  {
   console.log("The directory does not appear to contain Twitter Bootstrap, " + "not converting any files. Looking for "js" directory " + "in the source directory failed.");
   process.exit(1);
}
;
bootstrapPaths = fs.readdirSync(bootstrapSrcDir);
bootstrapPaths.forEach(function(fileName)  {
      var srcPath = bootstrapSrcDir + fileName;
      if (fs.statSync(srcPath).isFile() && jsFileRegExp.test(srcPath))  {
         var content = fs.readFileSync(srcPath, "utf8");
         convert(fileName, replacejQuery(content));
         if (! /popover/.test(fileName))  {
            allPlugins.push(replacejQuery(content));
         }
          else  {
            popoverContent = replacejQuery(content);
         }
         ;
      }
      ;
   }
);
allPlugins.push(popoverContent);
createBootstrapAll();
createPackageJson();
console.log("Done. See '" + path.join(inDir, "amd") + "' for the AMD version of the Bootstrap and '" + path.join(inDir, "amd/src") + "' for AMD modules.");
function mkDir(dir)  {
   if (! exists(dir))  {
      fs.mkdirSync(dir, 511);
   }
   ;
}
;
;
function replacejQuery(content)  {
   return content.replace(/window\.jQuery/gim, "jQuery");
}
;
function createBootstrapAll()  {
   var content = allPlugins.join(""), content = "define(" + "[ 'jquery' ], function ( jQuery ) {
" + content + "
});";
   fs.writeFile(path.normalize(inDir + "/amd/main.js"), content);
}
;
;
function createPackageJson()  {
   var packageJson = fs.readFileSync(inDir + "package.json", "utf8");
   packageJson = JSON.parse(packageJson);
   packageJson.name = "bootstrap-amd";
   packageJson.description = "AMD version of Twitter Bootstrap JavaScript modules. Converted with bootstrap-amd npm package.";
   packageJson.keywords = ["bootstrap", "twitter", "modules", "ready to use", "modals", "affix", "tooltips", "collapse", "dropdowns", "popovers", "carousel", "scrollspy", "alert messages", "typeahead", "togglable tabs", "buttons", "transitions"];
   packageJson.dependencies =  {
      jquery:">1.5.0"   }
;
   delete packageJson.scripts;
   delete packageJson.devDependencies;
   packageJson = JSON.stringify(packageJson, null, "  ");
   fs.writeFile(path.normalize(inDir + "/amd/package.json"), packageJson);
}
;
;
function convert(fileName, contents)  {
   var moduleName, outFileName, i, segment, fileParts = fileName.split("-"), files = getDependencies(fileName), tempDir = inDir;
   if (fileParts[0].indexOf("bootstrap") !== - 1)  {
      outFileName = fileParts[1];
   }
    else  {
      outFileName = fileName;
   }
   ;
   if (moduleName !== "bootstrap" && fileParts.length > 1)  {
      mkDir(inDir + "amd/");
      for (i = 0; i < fileParts.length - 1; i++)  {
            tempDir = inDir + "amd/src/";
            mkDir(tempDir);
         }
      ;
   }
   ;
   contents = "define(" + "[ " + files.join(",") + " ], function ( jQuery ) {
" + contents + "
});";
   fs.writeFileSync(tempDir + outFileName, contents);
}
;
;
function getDependencies(fileName)  {
   var deps;
   if (optionKey !== "--no-transition")  {
      switch(fileName) {
         case "bootstrap-transition.js":
 
               deps = ["'jquery'"];
               break;
            
         case "bootstrap-popover.js":
 
               deps = ["'jquery', './tooltip', './transition'"];
               break;
            
         default:
 
               deps = ["'jquery', './transition'"];
               break;
            
}
;
      ;
   }
    else  {
      fileName === "bootstrap-popover.js" ? deps = ["'jquery', './tooltip'"] : deps = ["'jquery'"];
   }
   ;
   return deps;
}
;
;
