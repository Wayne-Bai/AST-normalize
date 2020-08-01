! ✖ / env;
node;
var json = require("./parse").parse(function(line)  {
      return line.indexOf("coverage") === - 1;
   }
);
var out = require("./parse").paths(json);
out.forEach(function(line, k)  {
      out[k] = "src/" + line;
   }
);
console.log(out.join(" "));
