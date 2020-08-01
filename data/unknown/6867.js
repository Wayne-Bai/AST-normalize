! ✖ / env;
node;
var fs = require("fs"), PNG = require("pngjs").PNG;
var png = new PNG( {
      width:10, 
      height:10, 
      filterType:- 1   }
);
for (var y = 0; y < png.height; y++)  {
      for (var x = 0; x < png.width; x++)  {
            var idx = png.width * y + x << 2;
            var col = x < png.width >> 1 ^ y < png.height >> 1 ? 229 : 255;
            png.data[idx] = col;
            png.data[idx + 1] = col;
            png.data[idx + 2] = col;
            png.data[idx + 3] = 255;
         }
   }
png.pack().pipe(fs.createWriteStream(__dirname + "/bg.png"));
