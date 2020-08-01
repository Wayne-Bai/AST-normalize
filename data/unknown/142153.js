! ✖ / env;
node;
var wrench = require("wrench"), path = require("path"), buildPath = path.normalize(__dirname + "/../../build/");
wrench.rmdirSyncRecursive(buildPath, true);
