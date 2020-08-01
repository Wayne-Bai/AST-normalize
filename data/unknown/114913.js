! ✖ / env;
node;
var path = require("path");
var format = require("util").format;
var dashdash = require("../lib/dashdash");
var durationRe = /^([1-9]\d*)([smhd])$/;
function parseDuration(option, optstr, arg)  {
   var d;
   var match = durationRe.exec(arg);
   if (! match)  {
      throw new Error(format("arg for "%s" is not a valid duration: "%s"", optstr, arg));
   }
   var num = match[1];
   var scope = match[2];
   var t = 0;
   switch(scope) {
      case "s":
 
            t = num * 1000;
            break;
         
      case "m":
 
            t = num * 60 * 1000;
            break;
         
      case "h":
 
            t = num * 60 * 60 * 1000;
            break;
         
      case "d":
 
            t = num * 24 * 60 * 60 * 1000;
            break;
         
}
;
   return t;
}
;
dashdash.addOptionType( {
      name:"duration", 
      takesArg:true, 
      helpArg:"DURATION", 
      parseArg:parseDuration   }
);
var options = [ {
   names:["time", "t"], 
   type:"duration"}
];
try {
   var opts = dashdash.parse( {
         options:options      }
   );
}
catch (e) {
   console.error("%s: error: %s", path.basename(process.argv[1]), e.message);
   process.exit(1);
}
if (opts.time)  {
   console.log("duration: %d ms", opts.time);
}
