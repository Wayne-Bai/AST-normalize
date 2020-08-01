! ✖ / env;
node;
var fs = require("fs"), readline = require("readline"), util = require("util"), path = require("path"), projectPath = path.resolve(__dirname, "../.."), filename = path.join(projectPath, "www/cordova.js");
if (fs.existsSync(filename))  {
   var rl = readline.createInterface( {
         input:fs.createReadStream(filename), 
         terminal:false      }
   );
   rl.on("line", function(line)  {
         var splitSpace, splitDash;
         if (/^\/\/\s\d/.test(line))  {
            rl.close();
            splitSpace = line.split(" ");
            if (splitSpace.length > 1)  {
               splitDash = splitSpace[1].split("-");
               if (splitDash.length > 0)  {
                  console.log(splitDash[0]);
               }
            }
         }
      }
   );
}
 else  {
   console.log(util.format("The file "%s" does not exist.", filename));
}
