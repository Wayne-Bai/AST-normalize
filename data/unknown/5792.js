! ✖ / env;
node;
var fs = require("fs");
var path = require("path");
var argv = process.argv;
var Carmen = require("../index.js");
var f = argv[2];
var t = argv[3];
if (! f || ! t)  {
   console.log("Usage: carmen-copy.js <from> <to>");
   process.exit(1);
}
try {
   var from = Carmen.auto(f);
}
catch (err) {
   console.warn("Error: Could not load index %s", f);
   process.exit(1);
}
try {
   var to = Carmen.auto(t);
}
catch (err) {
   console.warn("Error: Could not load index %s", t);
   process.exit(1);
}
console.log("Copying %s => %s", f, t);
var carmen = new Carmen( {
      from:from, 
      to:to   }
);
carmen.copy(from, to, function(err)  {
      if (err) throw err      to.stopWriting(function(err)  {
            if (err) throw err            console.log("Done.");
            process.exit(0);
         }
      );
   }
);
