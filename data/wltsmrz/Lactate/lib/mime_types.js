// Extend node-mime

var mime = require('mime');

module.exports = function MimeTypes() {
  var TYPES = {
    'text/javascript':[ 'js' ]
  };

  mime.define(TYPES);

  this.mime = mime;
};
