! ✖ / env;
node;
var path = require("path");
var tap = require("tap");
process.env["FILESYSTEM_BUILD"] = "/tmp/test";
process.env["FILESYSTEM_CACHE"] = "/tmp/test";
process.env["CONFIG_FILES"] = path.join(__dirname, "data", "default_config.js");
var config = require("../lib/config");
config.init( {
      config-files:process.env["CONFIG_FILES"]   }
);
tap.test("A single config works as expected", function(test)  {
      config.withConfig(function(conf)  {
            test.deepEqual(conf,  {
                  foo:"bar", 
                  buz:"baz", 
                  huh:undefined, 
                  animals: {
                     cat:"Snowball", 
                     dog:"Spot", 
                     lamma:"Rojer"                  }, 
                  bar:42, 
                  buildDir:"/tmp/test", 
                  cacheDir:"/tmp/test", 
                  keysDir:"/tmp/test/keys", 
                  force:undefined, 
                  debug:false, 
                  bind_address:undefined, 
                  controller_server_port:undefined, 
                  generator_endpoint:undefined, 
                  generator_server_port:undefined, 
                  awsAccessKeyId:undefined, 
                  awsSecretAccessKey:undefined, 
                  maximumNumberOfConcurrentBuilds:10, 
                  varPath:"/tmp/var"               }, 
               "Deep Equals of configuration object");
            test.end();
         }
      );
   }
);
