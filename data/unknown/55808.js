! ✖ / env;
node;
require("./proof")(1, function(step, parse, deepEqual)  {
      step(function()  {
            parse("DeleteSecurityGroup", step());
         }, 
         function(object)  {
            var expected =  {
               return:true            }
;
            deepEqual(object, expected, "parse delete security group");
         }
      );
   }
);
