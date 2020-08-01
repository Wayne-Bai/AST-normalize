
/**
  Image Magick
  
  Provides an interface with the imagemagick CLI commands to perform
  image processing on the application.
  
 */

var app = protos.app;
var magick = protos.requireDependency('node-imagemagick', "ImageMagick Middleware", 'magick');

function ImageMagick(config, middleware) {
  
  app[middleware] = magick;
  
}

module.exports = ImageMagick;
