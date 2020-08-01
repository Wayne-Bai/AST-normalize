! ✖ / env;
node;
var file = require("../../aui-base/scripts/file"), path = require("path");
var root = path.join(__dirname, "../../../"), srcDir = path.join(root, "src"), tempPath = path.join(srcDir, "aui-ace-editor", "js", ".aui-ace-editor.js");
file.remove(tempPath);
