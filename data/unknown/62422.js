! ✖ / env;
node;
var fs = require("fs");
var split = require("split");
var termops = require("../lib/util/termops.js");
var type = process.argv[2];
if (type !== "phrase" && type !== "term" && type !== "feature")  {
   console.log("Usage: collisions.js <phrase|term|feature>");
   process.exit(1);
}
var idx =  {} ;
var collisions =  {} ;
var count = 0;
process.stdin.pipe(split()).on("data", function(d)  {
      var hash = type === "phrase" ? termops.phrase(termops.tokenize(d)) : type === "feature" ? termops.feature(d) : termops.terms(termops.tokenize(d))[0];
      if (idx[hash] === undefined)  {
         idx[hash] = d;
      }
       else  {
         if (collisions[hash] === undefined)  {
            collisions[hash] = [idx[hash]];
         }
         collisions[hash].push(d);
      }
   }
).on("end", function()  {
      for (var i in collisions)  {
            process.stdout.write(JSON.stringify( {
                     hash:i, 
                     terms:collisions[i]                  }
               ) + "
");
         }
   }
);
