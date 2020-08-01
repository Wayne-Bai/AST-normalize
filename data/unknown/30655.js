! ✖ / env;
node;
var fs = require("fs");
var hogan = require("hogan.js");
fs.readdir("assets/templates", function(e, files)  {
      if (e) throw e   }
);
var code = "dddns = typeof dddns === 'undefined' ? {} : dddns;
";
code = "dddns["TF"]=function(t){
";
code = "	TEMPLATES={
";
files.forEach(function(file)  {
      if (/\.mustache$/i.test(file))  {
         var mustache = fs.readFileSync("assets/templates/" + file, "ascii");
         var key = file.match(/^([^.]+)\./i)[1];
         mustache = mustache.replace(/[\r\n\t]+/g, "");
         code = "		'" + key + "': new t(" + hogan.compile(mustache,  {
               asString:true            }
         ) + "),
";
      }
   }
);
code = "	}
};";
fs.writeFile("assets/js/templates.js", code, function()  {
      console.log("assets/js/templates.js created.");
   }
);
;
