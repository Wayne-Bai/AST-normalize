! ✖ / env;
node;
"use strict";
var fs = require("fs");
var path = require("path");
var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var file = path.join(home, ".remonit.json");
if (! fs.existsSync(file))  {
   var config =  {
      email:"", 
      password:""   }
;
   fs.writeFileSync(file, JSON.stringify(config, null, 2));
   console.log("
Notice: please edit ~/.remonit.json with proper configuration.");
   console.log("See https://github.com/zefei/remonit-cli for more info.
");
}
