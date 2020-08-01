! ✖ / env;
node;
"use strict";
var fs = require("fs");
var program = require("commander");
var forever = require("forever");
var version = require("../package.json").version;
program.version(version).option("-c, --config [file]", "Specify a custom configuration file [default config]").option("-d, --docker", "Enable docker mode to use environment variables rather than a config file [default false]");
program.command("run").description("Run the Crypton server").action(function()  {
      process.configFile = program.config;
      process.docker = program.docker;
      var app = require("../app");
      app.start();
   }
);
program.command("db:init").description("Initialize the Crypton database").action(function()  {
      process.configFile = program.config;
      process.docker = program.docker;
      require("./init")();
   }
);
program.command("db:drop").description("Drop the Crypton sdatabase").action(function()  {
      process.configFile = program.config;
      process.docker = program.docker;
      require("./drop")();
   }
);
program.command("status").description("Print the status of the daemonized the Crypton server").action(function()  {
      getServer(function(data)  {
            if (! data)  {
               console.log("No Crypton server daemon is running");
            }
             else  {
               console.log(data);
            }
         }
      );
   }
);
program.command("start").description("Daemonize the Crypton server").action(function()  {
      getServer(function(data)  {
            if (data)  {
               console.log("Crypton already running");
               process.exit(1);
            }
            var monitor = forever.startDaemon(__filename,  {
                  options:["run"]               }
            );
            console.log("Crypton server started");
         }
      );
   }
);
program.command("stop").description("Stop the daemonized Crypton server").action(function()  {
      getServer(function(data)  {
            if (! data)  {
               console.log("Crypton is not running");
               process.exit(1);
            }
            forever.stop(data.index);
            console.log("Crypton server stopped");
         }
      );
   }
);
program.command("restart").description("Restart the daemonized Crypton server").action(function()  {
      getServer(function(data)  {
            if (! data)  {
               console.log("Crypton is not running");
               process.exit(1);
            }
            forever.restart(data.index);
            console.log("Crypton server restarted");
         }
      );
   }
);
program.command("logs").description("Print the latest Crypton server logs").action(function()  {
      getServer(function(data)  {
            if (! data)  {
               console.log("Crypton is not running");
               process.exit(1);
            }
            forever.tail(data.index,  {} , function(err, log)  {
                  console.log(log.line);
               }
            );
         }
      );
   }
);
program.command("tail").description("Tail Crypton server logs to stdout").action(function()  {
      getServer(function(data)  {
            if (! data)  {
               console.log("Crypton is not running");
               process.exit(1);
            }
            forever.tail(data.index,  {
                  stream:true               }, 
               function(err, log)  {
                  console.log(log.line);
               }
            );
         }
      );
   }
);
program.command("cleanlogs").description("Remove the log files").action(function()  {
      forever.cleanUp(true);
   }
);
program.parse(process.argv);
if (! program.args[0])  {
   program.help();
}
function getServer(callback)  {
   forever.list(false, function(err, data)  {
         if (err)  {
            console.log(err);
            process.exit(1);
         }
         for (var i in data)  {
               if (~ data[i].file.indexOf("crypton/server/bin/cli.js"))  {
                  data[i].index = i;
                  return callback(data[i]);
               }
            }
         callback(null);
      }
   );
}
;
