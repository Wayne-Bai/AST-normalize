! ✖ / env;
node;
"use strict";
var remonit = require("./remonit.js");
remonit.connect(function(err)  {
      if (err)  {
         console.log(err + "
");
         return ;
      }
      remonit.get("stats", function(err, result)  {
            if (err)  {
               console.log(err + "
");
               remonit.close();
               return ;
            }
            console.log(JSON.stringify(result, null, 2));
            remonit.close();
         }
      );
   }
);
