! ✖ / env;
node;
var backoff = require("../index.js");
var fibonacciBackoff = backoff.fibonacci( {
      randomisationFactor:0, 
      initialDelay:10, 
      maxDelay:300   }
);
fibonacciBackoff.failAfter(10);
fibonacciBackoff.on("backoff", function(number, delay)  {
      console.log(number + " " + delay + "ms");
   }
);
fibonacciBackoff.on("ready", function(number, delay)  {
      fibonacciBackoff.backoff();
   }
);
fibonacciBackoff.on("fail", function()  {
      console.log("fail");
   }
);
fibonacciBackoff.backoff();
