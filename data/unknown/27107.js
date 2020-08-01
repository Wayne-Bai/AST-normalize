! ✖ / env;
node;
global.sys = require(/^v0\.[012]/.test(process.version) ? "sys" : "util");
var fs = require("fs");
var uglify = require("uglify-js"), jsp = uglify.parser, pro = uglify.uglify;
var code = fs.readFileSync("embed-tokens.js", "utf8").replace(/^#.*$/gm, "");
var ast = jsp.parse(code, null, true);
function fooBar()  {
}
;
console.log(sys.inspect(ast, null, null));
