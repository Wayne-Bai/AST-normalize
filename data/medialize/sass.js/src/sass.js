/*global Module, FS, ALLOC_STACK*/
/*jshint strict:false*/

function noop(){}

function stripLeadingSlash(text) {
  return text.slice(0, 1) === '/' ? text.slice(1) : text;
}

function addLeadingSlash(text) {
  return text.slice(0, 1) !== '/' ? ('/' + text) : text;
}

function stripTrailingSlash(text) {
  return text.slice(-1) === '/' ? text.slice(0, -1) : text;
}

function addTrailingSlash(text) {
  return text.slice(-1) !== '/' ? (text + '/') : text;
}

var Sass = {
  style: {
    nested: 0,
    expanded: 1,
    compact: 2,
    compressed: 3
  },
  comments: {
    'none': 0,
    'default': 1
  },
  _options: {
    style: 0,
    comments: 0
  },
  _files: {},
  _path: '/sass/',

  FS: FS,
  Module: Module,

  options: function(options) {
    if (typeof options !== 'object') {
      return;
    }

    Object.keys(options).forEach(function(key) {
      switch (key) {
        case 'style':
          Sass._options[key] = Number(options[key]);
          break;
        case 'comments':
          Sass._options[key] = Number(!!options[key]);
          break;
      }
    });
  },

  _absolutePath: function(filename) {
    return Sass._path + stripLeadingSlash(filename);
  },

  _createPath: function(parts) {
    var base = [];

    while (parts.length) {
      var directory = parts.shift();
      try {
        FS.createFolder(base.join('/'), directory, true, true);
      } catch(e) {
        // IGNORE file exists errors
      }

      base.push(directory);
    }
  },

  _ensurePath: function(filename) {
    var parts = filename.split('/');
    parts.pop();

    if (!parts.length) {
      return;
    }

    try {
      FS.stat(parts.join('/'));
      return;
    } catch(e) {
      Sass._createPath(parts);
    }
  },

  writeFile: function(filename, text) {
    var _absolute = filename.slice(0, 1) === '/';
    var path = Sass._absolutePath(filename);
    try {
      Sass._ensurePath(path);
      FS.writeFile(path, text);
      Sass._files[path] = filename;
      // create symlink for absolute path resolution
      if (_absolute) {
        Sass._ensurePath(filename);
        FS.symlink(path, filename);
      }
      return true;
    } catch(e) {
      return false;
    }
  },

  readFile: function(filename) {
    var path = Sass._absolutePath(filename);
    try {
      return FS.readFile(path, {encoding: 'utf8'});
    } catch(e) {
      return undefined;
    }
  },

  listFiles: function() {
    return Object.keys(Sass._files).map(function(path) {
      return Sass._files[path];
    });
  },

  removeFile: function(filename) {
    var _absolute = filename.slice(0, 1) === '/';
    var path = Sass._absolutePath(filename);
    try {
      FS.unlink(path);
      delete Sass._files[path];

      // undo symlink for absolute path resolution
      if (_absolute && FS.lstat(filename)) {
        FS.unlink(filename);
      }

      return true;
    } catch(e) {
      return false;
    }
  },

  _handleFiles: function(base, directory, files, callback) {
    var _root = Sass._absolutePath(directory || '');
    _root = addTrailingSlash(_root);
    base = addTrailingSlash(base);

    return files.map(function(file) {
      file = stripLeadingSlash(file);

      var parts = file.split('/');
      var _file = parts.pop();
      var _path = _root + parts.join('/');
      _path = addTrailingSlash(_path);

      return callback(_path, _file, base + file);
    }, Sass);
  },

  _handleLazyFile: function(path, file, url) {
    Sass._ensurePath(path + file);
    FS.createLazyFile(path, file, url, true, false);
  },

  _preloadingFiles: 0,
  _preloadingFilesCallback: null,
  _handlePreloadFile: function(path, file, url) {
    Sass._ensurePath(path + file);

    Sass._preloadingFiles++;
    var request = new XMLHttpRequest();
    request.onload = function(response) {
      Sass.writeFile(path.slice(Sass._path.length) + file, this.responseText);

      Sass._preloadingFiles--;
      if (!Sass._preloadingFiles) {
        Sass._preloadingFilesCallback();
        Sass._preloadingFilesCallback = null;
      }
    };

    request.open("get", url, true);
    request.send();
  },

  lazyFiles: function(base, directory, files) {
    Sass._handleFiles(base, directory, files, Sass._handleLazyFile);
  },

  preloadFiles: function(base, directory, files, callback) {
    Sass._preloadingFilesCallback = callback || noop;
    Sass._handleFiles(base, directory, files, Sass._handlePreloadFile);
  },

  compile: function(text) {
    try {
      // in C we would use char *ptr; foo(&ptr) - in EMScripten this is not possible,
      // so we allocate a pointer to a pointer on the stack by hand
      var errorPointerPointer = Module.allocate([0], 'i8', ALLOC_STACK);
      var result = Module.ccall(
        // C/++ function to call
        'sass_compile_emscripten',
        // return type
        'string',
        // parameter types
        ['string', 'number', 'number', 'string', 'i8'],
        // arguments for invocation
        [text, Sass._options.style, Sass._options.comments, Sass._path, errorPointerPointer]
      );
      // this is equivalent to *ptr
      var errorPointer = Module.getValue(errorPointerPointer, '*');
      // error string set? if not, it would be NULL and therefore 0
      if (errorPointer) {
        // pull string from pointer

        /*jshint camelcase:false*/
        errorPointer = Module.Pointer_stringify(errorPointer);
        /*jshint camelcase:true*/

        // Sass.compile("$foo:123px; .m { width:$foo; }") yields
        // errorPointer === "stdin:1: unbound variable $foobar"
        var error = errorPointer.match(/^stdin:(\d+):/);
        var message = errorPointer.slice(error[0].length).replace(/(^\s+)|(\s+$)/g, '');
        // throw new Error(message, 'string', error[1]);
        return {
          line: Number(error[1]),
          message: message
        };
      }

      return result;
    } catch(e) {
      // in case libsass.js was compiled without exception support (or something failed in parsing the error message)
      return {
        line: null,
        message: e.message,
        error: e
      };
    }
  }
};
