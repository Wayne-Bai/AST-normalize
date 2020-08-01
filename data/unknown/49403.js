! ✖ / env;
node;
var fs = require("fs");
var path = require("path");
var cwd = process.cwd();
var scriptPath = __dirname;
var paths = [path.join(cwd, "..", "..", "hooks"), path.join(cwd, "..", "..", "hooks", "after_prepare")];
for (var pathIndex in paths)  {
      if (! fs.existsSync(paths[pathIndex]))  {
         console.log("Creating directory: ", paths[pathIndex]);
         fs.mkdirSync(paths[pathIndex]);
      }
   }
var minifyFilePath = path.join(cwd, "after_prepare", "cordova-minify.js");
var minifyFile = fs.readFileSync(minifyFilePath);
console.log("Grabbing Minifier File from minify package in node_modules");
var minifyFileNewPath = path.join(paths[1], "minify.js");
console.log("Copying Minifier File to Cordova hooks/after_prepare");
fs.writeFileSync(minifyFileNewPath, minifyFile);
console.log("Finished set-up! Your JS, CSS, and img files will be automatically compressed, and your JS files uglified!");
console.log();
console.log("cordova-minify - developed by Alastair Paragas@2014, Stela Inc. cordova-minify is an open-source/MIT project");
console.log("Any issues? Do not hesitate to post bugs and issues to https://github.com/alastairparagas/cordova-minify");
