var fs = require('fs');
  gm = require('gm');

module.exports = function (config) {

  
  var opts = config.options, aD = {
    zoom : function (srcPath, newWidth, outStream, cb) {
      var zoomLevel = opts.artisticDirection.zoom || '112.5%';
      
      zoomLevel = zoomLevel.replace(/[^\d.]/g, '')/100;
      
      gm(fs.createReadStream(srcPath))
      .resize(newWidth * zoomLevel)
      .size({bufferStream:true}, function (err, dimensions) {
        if (err) { return err; }
        this
        .gravity('Center')
        .crop(newWidth, dimensions.height)
        .stream(function (err, stdout, _, cmd) {
          if (err) cb(err);
          stdout.pipe(outStream);
          
          stdout.on('end', cb);
        });
      });
      
        
    }
  }
  
  return aD;
  
};
    
