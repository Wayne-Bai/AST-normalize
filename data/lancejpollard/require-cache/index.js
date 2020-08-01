var initialized = false
  , cachePath
  , cache
  , fs = require('fs');

function requireCache(_cachePath) {
  if (initialized) return;

  initialized = true;

  var Module = require('module')
    , path = require('path');

  // where the json gets saved
  cachePath = _cachePath || path.join(process.cwd(), 'tmp/require.cache.json');

  var filenames, moduleLookup;

  try {
    cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  } catch (e) {
    cache = {};
  }

  requireCache.cache = cache;

  // hashes
  filenames = cache.filenames = cache.filenames || {};
  moduleLookup = cache.moduleLookup = cache.moduleLookup || {};

  // Module.prototype.load override
  var load = Module.prototype.load;

  function prototypeLoad(filename) {
    load.apply(this, arguments);

    var extension = path.extname(filename) || '.js';
    if (!Module._extensions[extension]) extension = '.js';

    moduleLookup[filename] = {
        filename: this.filename
      , paths: this.paths
      , extension: extension
    }
  }

  function prototypeLoadOptimized(filename) {
    var data = moduleLookup[filename];

    if (!data)
      return prototypeLoad.apply(this, arguments);

    this.filename = data.filename;
    this.paths = data.paths;

    Module._extensions[data.extension](this, filename);

    this.loaded = true;
  };

  // Module._resolveFilename override
  var _resolveFilename = Module._resolveFilename;

  function resolveFilenameOptimized(request, parent) {
    return filenames[request + ':' + parent.id]
      || (filenames[request + ':' + parent.id] = _resolveFilename.apply(Module, arguments));
  }

  Module._resolveFilename = resolveFilenameOptimized;
  Module.prototype.load = prototypeLoadOptimized;

  process.on('exit', requireCache.save);
}

requireCache.save = function() {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(cache || {}));
  } catch (e) {
    console.log(e);
  }
}

requireCache.clear = function() {
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
  initialized = false;
  cachePath = undefined;
}

module.exports = requireCache;
