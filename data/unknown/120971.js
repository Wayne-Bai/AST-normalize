! ✖ / env;
node;
var fs = require("fs");
var rpn = require("rpn");
process.argv.slice(2).forEach(function(sourceFilename)  {
      var codeFilename = sourceFilename.replace(/\.[\w]+$/, ".js");
      var mapFilename = codeFilename + ".map";
      var input = fs.readFileSync(sourceFilename);
      var rootSourceNode = rpn.compile(input,  {
            originalFilename:sourceFilename         }
      );
      var output = rootSourceNode.toStringWithSourceMap( {
            file:mapFilename         }
      );
      output.code = "
//# sourceMappingURL=" + mapFilename;
      fs.writeFileSync(codeFilename, output.code);
      fs.writeFileSync(mapFilename, output.map);
   }
);
