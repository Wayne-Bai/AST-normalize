! ✖ / env;
node;
var telehash = require("../lib/mesh.js");
telehash.add(require("telehash-udp4"));
var readline = require("readline");
var rl = readline.createInterface( {
      input:process.stdin, 
      output:process.stdout   }
);
function error(err)  {
   console.error(err);
   process.exit(1);
}
;
telehash.log( {
      debug:console.log   }
);
telehash.generate(function(err, id)  {
      if (err) return error(err)      telehash.mesh( {
            id:id         }, 
         function(err, mesh)  {
            if (err) return error(err)            if (process.argv[2]) mesh.link(process.argv[2])            rl.on("line", function(line)  {
                  var link = mesh.link(JSON.parse(line));
                  link.status(function(err)  {
                        if (err) return error(err)                        setTimeout(function()  {
                              process.exit(0);
                           }, 
                           100);
                     }
                  );
                  setTimeout(function()  {
                        error("timeout");
                     }, 
                     2000);
               }
            );
         }
      );
   }
);
