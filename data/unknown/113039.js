! ✖ / env;
node;
var fs = require("fs");
var asm = require("../static/asm.js");
function processAsm(filename, filters)  {
   var file = fs.readFileSync(filename, "utf-8");
   return asm.processAsm(file, filters);
}
;
var cases = fs.readdirSync("./cases").filter(function(x)  {
      return x.match(/\.asm$/);
   }
).map(function(x)  {
      return "./cases/" + x;
   }
);
var failures = 0;
function assertEq(a, b, context)  {
   if (a != b)  {
      console.log("Fail: ", a, " != ", b, context);
      failures++;
   }
}
;
function testFilter(filename, suffix, filters)  {
   var result = processAsm(filename, filters);
   var expected = filename + suffix;
   try {
      var file = fs.readFileSync(expected, "utf-8").split("
");
   }
   catch (e) {
      return ;
   }
   assertEq(file.length, result.length, expected);
   if (file.length != result.length) return    for (var i = 0; i < file.length; ++i)  {
         assertEq(file[i], result[i].text, expected + ":" + i + 1);
      }
}
;
cases.forEach(function(x)  {
      testFilter(x, "",  {} );
   }
);
cases.forEach(function(x)  {
      testFilter(x, ".directives",  {
            directives:true         }
      );
   }
);
cases.forEach(function(x)  {
      testFilter(x, ".directives.labels",  {
            directives:true, 
            labels:true         }
      );
   }
);
cases.forEach(function(x)  {
      testFilter(x, ".directives.labels.comments",  {
            directives:true, 
            labels:true, 
            commentOnly:true         }
      );
   }
);
if (failures)  {
   console.log(failures + " failures");
}
