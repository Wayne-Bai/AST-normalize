! ✖ / env;
node(function()  {
      "use strict";
      var walk = require("../lib/walk"), count = 0, saneCount = 0;
      function sort(a, b)  {
         a = a.toLowerCase();
         b = b.toLowerCase();
         if (a > b) return - 1         if (a < b) return 1         return 0;
      }
;
      process.argv.forEach(function(startpath, index)  {
            if (index > 1)  {
               emitter = walk(startpath);
               emitter.on("name", function(path, file, stat)  {
                     saneCount = 1;
                  }
               );
               emitter.on("names", function(path, files, stats)  {
                     files.sort(sort);
                  }
               );
               emitter.on("error", function(path, err, next)  {
                     next();
                  }
               );
               emitter.on("directoryError", function(path, stats, next)  {
                     next();
                  }
               );
               emitter.on("nodeError", function(path, stats, next)  {
                     next();
                  }
               );
               emitter.on("file", function(path, stat, next)  {
                     count = 1;
                     console.log([path, "/", stat.name].join(""));
                     next();
                  }
               );
               emitter.on("directory", function(path, stat, next)  {
                     count = 1;
                     console.log([path, "/", stat.name].join(""));
                     next();
                  }
               );
               emitter.on("symbolicLink", function(path, stat, next)  {
                     count = 1;
                     console.log([path, "/", stat.name].join(""));
                     next();
                  }
               );
               emitter.on("errors", function(path, stats, next)  {
                     next();
                  }
               );
               emitter.on("files", function(path, stats, next)  {
                     next();
                  }
               );
               emitter.on("directories", function(path, stats, next)  {
                     next();
                  }
               );
               emitter.on("symbolicLinks", function(path, stats, next)  {
                     next();
                  }
               );
               emitter.on("end", function()  {
                     console.log("The eagle has landed. [" + count + " == " + saneCount + "]");
                  }
               );
            }
         }
      );
   }
());
