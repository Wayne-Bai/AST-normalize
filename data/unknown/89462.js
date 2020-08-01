! ✖ / env;
node;
var cli = require("cli");
cli.parse(null, ["install", "test", "edit", "remove", "uninstall", "ls"]);
console.log("Command is: " + cli.command);
