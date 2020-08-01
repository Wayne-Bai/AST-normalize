! ✖ / env;
node;
var Ostatus = require("ostatus"), Util = require("util"), Hcard = Ostatus.hcard, Webfinger = Ostatus.webfinger;
var _main = function(argv)  {
   if (argv.length < 3)  {
      console.log("Usage: finger [account]");
      process.exit(- 1);
   }
   try {
      var reference = argv[2];
      if (reference.length < 5 || reference.substring(0, 5) != "acct:" && reference.substring(0, 5) != "http:")  {
         reference = "acct:" + reference;
      }
      Webfinger.lookup(reference, _result);
   }
   catch (error) {
      _error(error);
   }
}
;
var _error = function(error)  {
   console.log("Error: " + error.message);
   process.exit(- 1);
}
;
var _result = function(error, result)  {
   if (error)  {
      _error(error);
   }
    else  {
      console.log(Util.inspect(result));
   }
}
;
_main(process.argv);
