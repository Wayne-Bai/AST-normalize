! ✖ / env;
node;
var dashdash = require("../lib/dashdash");
var options = [ {
   names:["verbose", "v"], 
   type:"bool", 
   help:"More verbose output."}
];
try {
   var opts = dashdash.parse( {
         options:options      }
   );
}
catch (e) {
   console.error("hello: error: %s", e.message);
   process.exit(1);
}
if (opts.verbose)  {
   console.log("# opts:", opts);
   console.log("# args:", opts._args);
}
