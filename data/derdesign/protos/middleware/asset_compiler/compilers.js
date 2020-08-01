
/* Asset compilers */

var app = protos.app;

var mw = {
  name: 'asset_compiler',
  desc: 'Asset Compiler Middleware',
}

var _ = require('underscore');
var config = app.asset_compiler.config;

var less = protos.requireDependency('less', mw.desc, mw.name);
var sass = protos.requireDependency('node-sass', mw.desc, mw.name);
var stylus = protos.requireDependency('stylus', mw.desc, mw.name);
var nib = protos.requireDependency('nib', mw.desc, mw.name);
var coffee = protos.requireDependency('coffee-script', mw.desc, mw.name);

var pathModule = require('path');

// Note: 
// The .extend() calls below first override an empty object with the 
// original config options. Then, such new object is overridden with
// the options for each particular file to be compiled. This is to
// ensure the configuration does not override file-specific configs.

// Asset compilers

module.exports = {
  
  less: function(source, file, callback) {
    var options = _.extend({}, config.lessOpts);
    options = _.extend(options, {
      filename: pathModule.basename(file),
      paths: [pathModule.dirname(file)],
      compress: false
    });
    options = app.applyFilters('less_options', options, file);
    less.render(source, options, function(err, out) {
      if (err) {
        callback(err);
      } else {
        out = app.applyFilters('compiled_less', out.css, file, options);
        callback(err, out);
      }
    });
  },

  scss: function(source, file, callback) {
    var options = _.extend({}, config.sassOpts);
    options = _.extend(options, {
      data: source,
      error: callback,
      success: function(css) {
        css = app.applyFilters('compiled_sass', css, file, options);
        callback(null, css);
      },
      includePaths: [pathModule.dirname(file)]
    });
    options = app.applyFilters('sass_options', options, file);
    sass.render(options);
  },

  styl: function(source, file, callback) {
    var options = _.extend({}, config.stylusOpts);
    options = app.applyFilters('stylus_options', options, file);
    stylus(source, options)
      .set('filename', file)
      .use(nib())
      .import('nib')
      .render(function(err, out) {
        if (!err) out = app.applyFilters('compiled_stylus', out, file, options);
        callback(err, out)
      });
  },
  
  coffee: function(source, file, callback) {
    var out, options = config.coffeeOpts ? _.extend({}, config.coffeeOpts) : null;
    if (options) options = _.extend(options, {filename: file});
    options = app.applyFilters('coffee_options', options, file);
    out = coffee.compile(source, options);
    out = app.applyFilters('compiled_coffee', out, file, options);
    out = (out instanceof Object) ? out.js : out; // CoffeeScript outputs object when sourceMaps are enabled
    callback(null, out);
  }

}