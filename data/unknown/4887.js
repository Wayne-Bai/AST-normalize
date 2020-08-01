! ✖ / env;
node;
var util = require("util");
var test = require("tap").test;
var FreeImage = null;
try {
   FreeImage = require(__dirname + "/../../build/Release/freeimage").FreeImage;
}
catch (exception) {
   test = function(name)  {
      console.log("Skipping %s on this platform.", name);
   }
;
   return ;
}
test("loading an image from a buffer", function(t)  {
      var xpm = ["/* XPM */", "static char * XFACE[] = {", "/* <Values> */", "/* <width/cols> <height/rows> <colors> <char on pixel>*/", ""5 1 5 1",", "/* <Colors> */", ""W c #ffffff",", ""B c #000000",", ""r c #ff0000",", ""g c #00ff00",", ""b c #0000ff",", "/* <Pixels> */", ""WBrgb",", "};"].join("
");
      var imageBuffer = new Buffer(xpm);
      var image = FreeImage.loadFromMemory(imageBuffer);
      image = image.convertTo32Bits();
      t.equal(image.buffer.readUInt32LE(0), 4294967295);
      t.equal(image.buffer.readUInt32LE(4), 4278190080);
      t.equal(image.buffer.readUInt32LE(8), 4294901760);
      t.equal(image.buffer.readUInt32LE(12), 4278255360);
      t.equal(image.buffer.readUInt32LE(16), 4278190335);
      t.end();
   }
);
