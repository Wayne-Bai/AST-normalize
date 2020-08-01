! ✖ / env;
node;
var path = require("path");
var format = require("util").format;
var dashdash = require("../lib/dashdash");
var fruits = ["apple", "pear", "cherry", "strawberry", "banana"];
function parseFruit(option, optstr, arg)  {
   if (fruits.indexOf(arg) === - 1)  {
      throw new Error(format("arg for "%s" is not a known fruit: "%s"", optstr, arg));
   }
   return arg;
}
;
dashdash.addOptionType( {
      name:"fruit", 
      takesArg:true, 
      helpArg:"FRUIT", 
      parseArg:parseFruit, 
      default:"apple"   }
);
var options = [ {
   names:["pie", "p"], 
   type:"fruit"}
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
console.log("pie fruit: %s", opts.pie);
