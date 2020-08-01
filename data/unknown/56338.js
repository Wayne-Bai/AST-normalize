! ✖ / env;
node;
require("./proof")(1, function(step, parse, deepEqual)  {
      step(function()  {
            parse("CancelBundleTask", step());
         }, 
         function(object)  {
            var expected =  {
               bundleInstanceTask: {
                  instanceId:"i-12345678", 
                  bundleId:"bun-cla322b9", 
                  state:"canceling", 
                  startTime:new Date(Date.UTC(2008, 9, 7, 11, 41, 50)), 
                  updateTime:new Date(Date.UTC(2008, 9, 7, 11, 51, 50)), 
                  progress:"20%", 
                  storage: {
                     S3: {
                        bucket:"my-bucket", 
                        prefix:"my-new-image"                     }}                }} ;
            deepEqual(object, expected, "parse cancel bundle task");
         }
      );
   }
);
