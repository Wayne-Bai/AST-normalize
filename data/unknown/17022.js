! ✖ / env;
node;
var hyperquest = require("hyperquest");
var concat = require("concat-stream");
var split = require("split");
var thru = require("through2");
var fs = require("fs");
var url = "https://api.github.com/repos/iojs/io.js/contents";
var dirs = ["/test/parallel", "/test/pummel"];
var httpOpts =  {
   headers: {
      User-Agent:null   }} ;
dirs.forEach(function(dir)  {
      var req = hyperquest(url + dir, httpOpts);
      req.pipe(concat(function(data)  {
               if (req.response.statusCode !== 200)  {
                  throw new Error(url + dir + ": " + data.toString());
               }
               downloadBufferTests(dir, JSON.parse(data));
            }
         ));
   }
);
function downloadBufferTests(dir, files)  {
   files.forEach(function(file)  {
         if (! /test-buffer.*/.test(file.name)) return          hyperquest(file.download_url, httpOpts).pipe(split()).pipe(testfixer(file.name)).pipe(fs.createWriteStream(__dirname + "/../test/node-" + file.name));
      }
   );
}
;
function testfixer(filename)  {
   var firstline = true;
   return thru(function(line, enc, cb)  {
         line = line.toString();
         if (firstline)  {
            line = "var Buffer = require('../').Buffer
" + "if (process.env.OBJECT_IMPL) Buffer.TYPED_ARRAY_SUPPORT = false
" + line;
            firstline = false;
         }
         line = line.replace(/^(var common = require.*)/, "// $1");
         line = line.replace(/(.*)require\('buffer'\)(.*)/, "$1require('../')$2");
         line = line.replace(/require\('smalloc'\)/, "{ kMaxLength: 0x3FFFFFFF }");
         line = line.replace(/(.*console\..*)/, "// $1");
         if (filename === "test-buffer-big.js")  {
            line = line.replace(/(.*new Int8Array.*RangeError.*)/, "// $1");
            line = line.replace(/(.*new ArrayBuffer.*RangeError.*)/, "// $1");
            line = line.replace(/(.*new Float64Array.*RangeError.*)/, "// $1");
         }
         if (filename === "test-buffer.js")  {
            line = line.replace(/b\[0\] = -1;/, "b[0] = 255;");
         }
         if (filename === "test-buffer.js")  {
            line = line.replace(/^(var crypto = require.*)/, "// $1");
            line = line.replace(/(crypto.createHash.*\))/, "1 /*$1*/");
         }
         cb(null, line + "
");
      }
   );
}
;
