! ✖ / bin / node;
require.paths.push(__dirname);
var testrunner = require("caolan-nodeunit/lib/nodeunit").testrunner;
process.chdir(__dirname);
testrunner.run(["test"]);
