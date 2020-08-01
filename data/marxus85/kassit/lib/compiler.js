(function() {
  var coffee, fs, less, uglifier, writer;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  fs = require('fs');
  less = require('less');
  coffee = require('coffee-script');
  writer = require('kassit/lib/writer');
  uglifier = require('kassit/lib/uglifier');
  this.Compiler = (function() {
    function Compiler(app, path) {
      this.doDevTmp = __bind(this.doDevTmp, this);      this.app = app;
      this.path = path;
    }
    Compiler.prototype.doProdRaw = function(input) {
      var ext, file, _i, _ref;
      _ref = input.split('.'), file = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), ext = _ref[_i++];
      ext = ext.toLowerCase();
      if (this[ext] != null) {
        return this[ext](input, fs.readFileSync(input, 'utf-8'));
      }
      return [0, 0];
    };
    Compiler.prototype.doDevTmp = function(input) {
      var data, ext, output, _i, _ref, _ref2;
      _ref = input.split('.'), output = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), ext = _ref[_i++];
      output = output.join('.').replace("" + this.path + "/", "" + this.path + ".dev/");
      ext = ext.toLowerCase();
      if (this[ext] != null) {
        try {
          data = fs.readFileSync(input, 'utf-8');
          _ref2 = this[ext](input, data), data = _ref2[0], ext = _ref2[1];
          return writer.writeFile("" + output + "." + ext, data, function(err) {
            if (err) {
              throw err;
            } else {
              return console.log("  ::compiled: " + output + "." + ext);
            }
          });
        } catch (err) {
          return console.log("  ::error: " + input + "\n:: " + err.message + "\n");
        }
      }
    };
    Compiler.prototype.getPkgName = function(input) {
      var ext, pkg, _i, _ref;
      _ref = input.replace("" + this.path + "/", '').replace(/\//g, '.').split('.'), pkg = 2 <= _ref.length ? __slice.call(_ref, 0, _i = _ref.length - 1) : (_i = 0, []), ext = _ref[_i++];
      return pkg.join('.');
    };
    Compiler.prototype.getTmplName = function(input) {
      var pkg;
      pkg = this.getPkgName(input);
      return pkg.replace('templates.', '');
    };
    Compiler.prototype.wrapTemplate = function(data, tmpl, type) {
      type = type.toUpperCase();
      return "(function(){" + this.app + ".Templates['" + tmpl + "'] = new Kassit.Template." + type + "(" + data + ")}).call(this)";
    };
    Compiler.prototype.js = function(input, data) {
      return [data, 'js'];
    };
    Compiler.prototype.coffee = function(input, data) {
      return [coffee.compile(data), 'js'];
    };
    Compiler.prototype.ejs = function(input, data) {
      return [this.wrapTemplate(JSON.stringify(data), this.getTmplName(input), 'ejs'), 'js'];
    };
    Compiler.prototype.tmpl = function(input, data) {
      return [this.wrapTemplate(JSON.stringify(data), this.getTmplName(input), 'tmpl'), 'js'];
    };
    Compiler.prototype.kup = function(input, data) {
      return [
        this.wrapTemplate(JSON.stringify("function(){" + (uglifier.squeeze(coffee.compile(data, {
          bare: true
        }))) + "}"), this.getTmplName(input), 'kup'), 'js'
      ];
    };
    Compiler.prototype.css = function(input, data) {
      return [data, 'css'];
    };
    Compiler.prototype.less = function(input, data) {
      less.render(data, __bind(function(err, css) {
        if (err) {
          throw err;
        } else {
          return data = css;
        }
      }, this));
      return [data, 'css'];
    };
    return Compiler;
  })();
}).call(this);
