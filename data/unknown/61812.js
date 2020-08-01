! ✖ / env;
node;
"use strict";
var concat = require("concat-stream"), cli = require("../lib/cli");
var exitCode = 0, useStdIn = process.argv.indexOf("--stdin") > - 1;
if (useStdIn)  {
   process.stdin.pipe(concat( {
            encoding:"string"         }, 
         function(text)  {
            exitCode = cli.execute(process.argv, text);
         }
      ));
}
 else  {
   exitCode = cli.execute(process.argv);
}
process.on("exit", function()  {
      process.exit(exitCode);
   }
);
