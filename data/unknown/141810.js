! ✖ / env;
node;
var fs = require("fs");
var file = process.argv[2] || "/dev/stdin";
var arr = fs.readFileSync(file, "utf-8").trim().split("
");
var ret =  {} ;
arr.forEach(function(line)  {
      var s = line.split(" ");
      ret[s[0]] = s[1];
   }
);
console.log(JSON.stringify(ret, null, 2));
