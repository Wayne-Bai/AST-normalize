
/* Static Server » Response extensions */

var app = protos.app,
    http = require('http'),
    util = require('util'),
    OutgoingMessage = http.OutgoingMessage;

/**
  Serves a file, forcing download, using the `Content-Disposition` HTTP Header
  
  @param {string} path
  @param {string} filename
  @public
 */

OutgoingMessage.prototype.download = function(path, filename) {
  var header = 'attachment';
  if (filename) header += util.format('; filename="%s"', filename);
  this.setHeaders({'Content-Disposition': header});
  app._serveStaticFile(path, this.request, this);
}

/**
  Serves a static file (relative to public directory)

  @param {string} path The path relative to the public directory
  @param {boolean} unsafe If set to true, allows using '../' in the path
  @public
 */

OutgoingMessage.prototype.serveStaticFile = function(path, unsafe) {
  if (path) {
    if (!unsafe) {
      path = path.replace(/\.\.\//g, ''); // Do not allow '../'
    }
    app._serveStaticFile(app.fullPath(app.paths.public + path), this.request, this);
  } else {
    app.notFound(this);
  }
}