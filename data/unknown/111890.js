! ✖ / env;
node;
var cp = require("child_process");
var path = require("path");
var rootPath = path.join(__dirname, "..");
cp.exec("cp -r node_modules/font-awesome chrome/",  {
      cwd:rootPath   }, 
   function(err)  {
      if (err) throw err   }
);
