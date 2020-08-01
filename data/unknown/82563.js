! ✖ / env;
node;
var cmd = process.argv[2] || "start";
require("../commands/" + cmd)(process.argv.slice(3));
