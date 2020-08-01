! ✖ / env;
node;
require("../global");
echo("Appending docs to README.md");
cd(__dirname + "/..");
var docs = grep("//@", "shell.js");
docs = docs.replace(/\/\/\@ ?/g, "");
sed("-i", /## Command reference(.|\n)*/, "## Command reference

" + docs, "README.md");
echo("All done.");
