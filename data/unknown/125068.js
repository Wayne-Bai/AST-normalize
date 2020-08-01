! ✖ / env;
node;
var logger = require("../lib/logger");
var createNode = require("./init").createNode;
var node = createNode();
node.storage.emptyDatabase(function(err)  {
      if (err)  {
         logger.error(err.stack ? err.stack : err.toString());
         process.exit(1);
      }
      logger.info("Database has been reset!");
      process.exit(0);
   }
);
