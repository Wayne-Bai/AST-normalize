var fs = require('fs');
var path = require('path');

var compressor = require('yuicompressor');
var browserify = require('browserify');
var writer = fs.createWriteStream(path.normalize('dist/astarisx.js'));

browserify({standalone: "Astarisx"}).add('./main.js').bundle().pipe(writer);

writer.on('finish', function() {
    console.error('Write successful. Compressing...');
    compressor.compress('./dist/astarisx.js', {
        //Compressor Options:
        charset: 'utf8',
        type: 'js',
    }, function(err, data, extra) {
      fs.writeFile("./dist/astarisx.min.js", data, function(err) {
        if(err) {
            console.error(err);
        } else {
            console.log("Files saved!");
        }
      });
    //err   If compressor encounters an error, it's stderr will be here
    //data  The compressed string, you write it out where you want it
    //extra The stderr (warnings are printed here in case you want to echo them
    });
});

