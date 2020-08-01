! ✖ / env;
node;
var fs = require("fs");
var exec = require("child_process").exec;
function run_node(filename)  {
   var cmd = "";
   cmd = "node tools/doc/generate.js --format=html --template=doc/template.html ";
   cmd = filename + " > out/" + filename.split(".").shift() + ".html";
   return exec(cmd, function(err, stdout, stderr)  {
         if (err) throw err      }
   );
}
;
files = fs.readdirSync("doc/api");
for (var x = 0, l = files.length; x < l; x++)  {
      var filename = "doc/api/" + files[x];
      console.log("File Name: " + filename);
      run_node(filename);
   }
