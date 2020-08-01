
/* Source Maps */

var app = protos.app;
var util = require('util');
var pathModule = require('path');

var config = app.asset_compiler.config;

if (config.sourceMaps.length) {
  
  var sourceMaps = config.sourceMaps;
  
  // LESS Source Maps

  if (sourceMaps.indexOf('less') >= 0) {
    
    app.addFilter('less_options', function(options, file) {
      options.compress = true;
      options.sourceMap = true;
      return options;
    });

  }
  
  // SASS Source Maps
  
  if (sourceMaps.indexOf('scss') >= 0) {
    
    app.addFilter('sass_options', function(options, file) {
      var success = options.success;
      delete options.data;
      options.file = file;
      options.sourceComments = 'map';
      options.outputStyle = 'compressed';
      options.success = function(css, map) {
        map = map.replace(app.paths.public, ''); // Normalize map sources
        css = css.replace('/*# sourceMappingURL=undefined */', '');
        css += util.format('\n/*# sourceMappingURL=data:application/json,%s */', encodeURIComponent(map));
        success(css);
      }
      return options;
    });
    
  }
  
  // CoffeeScript Source Maps
  
  if (sourceMaps.indexOf('coffee') >= 0) {
    
    app.addFilter('coffee_options', function(options, file) {
      if (options instanceof Object) {
        options.filename = file;
        options.sourceMap = true;
      } else {
        options = {
          filename: file,
          sourceMap: true
        }
      }
      return options;
    });
    
    app.addFilter('compiled_coffee', function(out, file) {
      if (out instanceof Object) {
        file = file.replace(app.paths.public, '');
        var map = out.v3SourceMap.replace(/"sources": \[\n    ""/, util.format('"sources": [\n    "%s"', file));
        out = util.format('%s\n//@ sourceMappingURL=data:application/json,%s', out.js, encodeURIComponent(map));
      }
      return out;
    });
    
  }
  
}