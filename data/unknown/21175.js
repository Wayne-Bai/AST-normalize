! ✖ / env;
node;
var fs = require("fs");
var path = require("path");
var cwd = process.cwd();
var uglifyJsPath = path.join(cwd, "../../", "hooks", "after_prepare", "uglify.js");
fs.unlink(uglifyJsPath);
console.log("Removed: ", uglifyJsPath);
