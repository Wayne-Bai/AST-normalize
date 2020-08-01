! ✖ / env;
node;
var _ = require("lodash");
var program = require("./_commander");
var package = require("../package.json");
var NOOP = function()  {
}
;
program.version(package.version, "-v, --version");
process.argv = _.map(process.argv, function(arg)  {
      return arg === "-V" ? "-v" : arg;
   }
);
program.command("version").description("").action(program.versionInformation);
program.command("generate [type]").description("").action(require("./we-generator"));
program.unknownOption = NOOP;
program.parse(process.argv);
var NO_COMMAND_SPECIFIED = program.args.length === 0;
if (NO_COMMAND_SPECIFIED)  {
   program.usageMinusWildcard();
}
