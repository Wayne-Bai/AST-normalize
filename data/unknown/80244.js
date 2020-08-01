! ✖ / env;
node;
var through = require("through2");
var prefix = require("autoprefixer");
module.exports = function(browsers, options)  {
   options = options ||  {} ;
   return through.obj(function(file, enc, cb)  {
         if (file.isStream())  {
            throw new Error("Streams not supported");
         }
         if (! file.isNull())  {
            if (file.sourceMap)  {
               options.map =  {
                  prev:file.sourceMap.mappings ? file.sourceMap : undefined, 
                  annotation:false, 
                  sourcesContent:true               }
;
               options.to = options.from = file.relative;
            }
            var contents = file.contents.toString();
            var result = prefix.apply(this, browsers).process(contents, options);
            contents = result.css;
            file.contents = new Buffer(contents);
            if (file.sourceMap)  {
               var map = JSON.parse(result.map.toString());
               map.sources = file.sourceMap.sources;
               map.file = file.sourceMap.file;
               file.sourceMap = map;
            }
         }
         this.push(file);
         cb();
      }
   );
}
;
