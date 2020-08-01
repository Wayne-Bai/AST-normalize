'use strict';

var filestore = require('../../core/filestore');
var Busboy = require('busboy');
var ObjectId = require('mongoose').Types.ObjectId;

function create(req, res) {
  var size = parseInt(req.query.size, 10);
  if (isNaN(size) || size < 1) {
    return res.json(400, {
      error: 400,
      message: 'Bad Parameter',
      details: 'size parameter should be a positive integer'
    });
  }

  var fileId = new ObjectId();
  var options = {};
  var metadata = {};
  if (req.query.name) {
    options.filename = req.query.name;
  }

  if (req.user) {
    metadata.creator = {objectType: 'user', id: req.user._id};
  }

  var saveStream = function(stream) {
    var interrupted = false;
    req.on('close', function(err) {
      interrupted = true;
    });

    return filestore.store(fileId, req.query.mimetype, metadata, stream, options, function(err, saved) {
      if (err) {
        return res.json(500, {
          error: {
            code: 500,
            message: 'Server error',
            details: err.message || err
          }
        });
      }

      if (saved.length !== size || interrupted) {
        return filestore.delete(fileId, function(err) {
          res.json(412, {
            error: {
              code: 412,
              message: 'File size mismatch',
              details: 'File size given by user agent is ' + size +
              ' and file size returned by storage system is ' +
              saved.length
            }
          });
        });
      }
      return res.json(201, {_id: fileId});
    });
  };

  if (req.headers['content-type'] && req.headers['content-type'].indexOf('multipart/form-data') === 0) {
    var nb = 0;
    var busboy = new Busboy({ headers: req.headers });
    busboy.once('file', function(fieldname, file) {
      nb++;
      return saveStream(file);
    });

    busboy.on('finish', function() {
      if (nb === 0) {
        res.json(400, {
          error: {
            code: 400,
            message: 'Bad request',
            details: 'The form data must contain an attachment'
          }
        });
      }
    });
    req.pipe(busboy);

  } else {
    return saveStream(req);
  }
}

function get(req, res) {
  if (!req.params.id) {
    return res.json(400, {
      error: 400,
      message: 'Bad Request',
      details: 'Missing id parameter'
    });
  }

  filestore.get(req.params.id, function(err, fileMeta, readStream) {
    if (err) {
      return res.json(503, {
        error: 503,
        message: 'Server error',
        details: err.message || err
      });
    }

    if (!readStream) {
     if (req.accepts('html')) {
        res.status(404);
        return res.render('commons/404', { url: req.url });
      }
      else {
        return res.json(404, {
          error: 404,
          message: 'Not Found',
          details: 'Could not find file'
        });
      }
    }

    if (fileMeta) {
      var modSince = req.get('If-Modified-Since');
      var clientMod = new Date(modSince);
      var serverMod = fileMeta.uploadDate;
      clientMod.setMilliseconds(0);
      serverMod.setMilliseconds(0);

      if (modSince && clientMod.getTime() === serverMod.getTime()) {
        return res.send(304);
      } else {
        res.set('Last-Modified', fileMeta.uploadDate);
      }

      res.type(fileMeta.contentType);

      if (fileMeta.filename) {
        res.set('Content-Disposition', 'inline; filename="' +
        fileMeta.filename.replace(/"/g, '') + '"');
      }

      if (fileMeta.length) {
        res.set('Content-Length', fileMeta.length);
      }
    }

    res.status(200);
    return readStream.pipe(res);
  });
}

function remove(req, res) {
  if (!req.params.id) {
    return res.json(400, {error: {code: 400, message: 'Bad request', details: 'Missing id parameter'}});
  }
  var meta = req.fileMeta;

  if (meta.metadata.referenced) {
    return res.json(409, {error: {code: 409, message: 'Conflict', details: 'File is used and can not be deleted'}});
  }

  filestore.delete(req.params.id, function(err) {
    if (err) {
      return res.json(500, {error: {code: 500, message: 'Server Error', details: err.message || err}});
    }
    return res.send(204);
  });
}

module.exports = {
  create: create,
  get: get,
  remove: remove
};
