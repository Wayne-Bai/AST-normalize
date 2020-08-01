! ✖ / env;
node;
var SOURCE = "src/";
var assert = require("assert"), fs = require("fs"), lcovParse = require("lcov-parse"), parseDataUri = require("parse-data-uri"), sourcemap = require("source-map");
var sourcemapFile = process.argv[2];
var lcovFile = process.argv[3];
var sourcemapData = fs.readFileSync(sourcemapFile).toString();
var sourcemap = new sourcemap.SourceMapConsumer(sourcemapData);
lcovParse(lcovFile, function(err, data)  {
      assert(! err);
      var lines = data[0].lines.details;
      var fileToCov =  {} ;
      lines.forEach(function(line)  {
            var pos = sourcemap.originalPositionFor( {
                  line:line.line, 
                  column:0               }
            );
            if (pos == null)  {
               return ;
            }
            var filename = pos.source;
            if (! filename || filename.indexOf("node_modules") >= 0)  {
               return ;
            }
            var base = filename.indexOf(SOURCE);
            if (base == - 1) return             filename = filename.slice(base);
            if (! fileToCov[filename]) fileToCov[filename] = []            fileToCov[filename][pos.line] = line.hit;
         }
      );
      for (var filename in fileToCov)  {
            var cov = fileToCov[filename];
            console.log("SF:" + filename);
            for (var i = 0; i < cov.length; i++)  {
                  if (cov[i] != null)  {
                     console.log("DA:" + i + "," + cov[i]);
                  }
               }
            console.log("end_of_record");
         }
   }
);
