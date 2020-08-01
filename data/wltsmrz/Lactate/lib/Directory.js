
/**
 * Directory methods:
 *
 * #toMiddleware(options)
 * #serveIndex()
 * #bundle(file extension or array, name, callback)
 * #bundleJS(name, callback)
 * #bundleCSS(name, callback)
 */

var fs          = require('fs');
var path        = require('path');
var abridge     = require('abridge');
var FileRequest = require('./FileRequest');

module.exports = Directory;

function Directory() {

  var self = this;
  var root = this.get('root');
  var appendRoot = path.join.bind(this, root);

  function filterFiles(type) {
    var re = new RegExp([ '.', '$' ].join(type));
    return fs.readdirSync(root)
    .filter(function(pathName) {
      return re.test(pathName);
    })
    .map(function(pathName) {
      return path.join(self.get('root'), pathName);
    });
  };

  this.toMiddleware = function toMiddleware(options) {
    if (options) this.set(options);
    var self = this;

    function lactateMiddleware(req, res, next) {
      self.serve(req, res, next);
    };
    
    return lactateMiddleware;
  };
  
  this.serveIndex = function serveIndex(fp, req, res, error) {
    var fp       = fp.replace(/[.+]?\/$/, '');
    var hidden   = this._get('hidden');
    var root     = this._get('root');
    var basePath = fp.substring(root.length) || '/';

    fs.readdir(fp, readCallback);

    function readCallback(err, files) {
      if (err) return error(404);

      // Filter hidden files
      if (!self._get('hidden')) {
        files = files.filter(function(filePath) {
          return !self.isHidden(filePath);
        });
      };

      files = files.sort()
      .map(function(filePath) {
        var href = path.join(basePath, filePath);
        if (fs.lstatSync(path.join(root, basePath, filePath)).isDirectory()) {
            filePath = filePath.concat('/');
            href = href.concat('/');
        };
        return '<li>' + filePath.link(href) + '</li>';
      });

      // Directory is not root directory
      if (fp !== root) {
        files.unshift('Parent directory'.link(path.join(basePath, '..')));
      };

      var content = '<!doctype html>'
      + '<html>'
      + '<head>'
      + '<meta charset="utf-8"/>'
      + '<title>Index of ' + basePath + '</title>'
      + '<link rel="icon" href="about:blank"/>'
      + '</head>'
      + '<body>'
      + '<h1>Index of ' + basePath + '</h1>'
      + '<ul>' + files.join('') + '</ul>'
      + '</body>'
      + '</html>';

      var headers = {
        'Content-Type':'text/html',
        'Content-Length': Buffer.byteLength(content, 'utf8')
      };

      res.writeHead(200, headers);
      res.end(content);
    };

  };

  var bundle = this.get('bundle');
  var rebundle = this.get('rebundle');
  
  this.bundle = function bundle(type, name, cb) {

    var name = [
      typeof name === 'string' 
      ? name.replace(/\.\w+$/, '') 
      : 'common',
      type 
    ].join('.');

    var location = appendRoot(name);

    var files = (
      Array.isArray(type)
    ? type.map(appendRoot)
    : filterFiles(type)
    ).filter(function(file) {
      return file !== location;
    });

    if (!files.length) return;

    var watch = function(file) {
      fs.watch(file, watchCallback);
      function watchCallback(ev) {
        if (ev === 'change') {
          var min = abridge.minify(files);
          min.pipe(fs.createWriteStream(location));
        };
      };
    };

    var min = abridge.minify(files, minifyCallback)
    min.pipe(fs.createWriteStream(location));

    function minifyCallback(err, data) {
      if (!err && rebundle) {
        files.forEach(watch);
      };
      if (typeof cb === 'function') {
        cb(err, data);
      };
    };

  };

  this.bundleJS = this.bundle.bind(this, 'js');
  this.bundleCSS = this.bundle.bind(this, 'css');

  switch (typeof bundle) {
    case 'boolean':
      if (!bundle) break;
      this.bundleJS(bundle);
      this.bundleCSS(bundle);
      break;
    case 'string':
      this.bundle.call(this, bundle);
      break;
  };
  
};
