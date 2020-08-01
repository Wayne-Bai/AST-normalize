! ✖ / env;
node;
const;
db = require("../lib/db.js"), config = require("../lib/configuration.js"), logging = require("../lib/logging.js"), logger = logging.logger, bcrypt = require("../lib/bcrypt");
logging.enableConsoleLogging();
var want = process.argv.length > 2 ? parseInt(process.argv[2], 10) : 2000;
logger.info("creating " + want + " test users... this can take a while...");
db.open(config.get("database"), function(error)  {
      if (error)  {
         logger.error("can't open database: " + error);
         return setTimeout(function()  {
               process.exit(1);
            }, 
            0);
      }
      bcrypt.encrypt(config.get("bcrypt_work_factor"), "THE PASSWORD", function(err, hash)  {
            if (err)  {
               logger.error("error creating test users - bcrypt encrypt pass: " + err);
               process.exit(1);
            }
            var have = 0;
            for (var i = 1; i <= want; i++)  {
                  db.addTestUser(i + "@loadtest.domain", hash, function(err, email)  {
                        if (++have == want)  {
                           logger.warn("created " + want + " test users");
                           bcrypt.shutdown();
                           db.close();
                        }
                     }
                  );
               }
         }
      );
   }
);
