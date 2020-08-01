/* jshint unused: false */
var config = require('./../../../libs/config');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var Conn = function () {
  this.base = __dirname + '/../../../' + config.service.blobs.path;
  // Ensure directory exists
  if (!fs.existsSync(this.base)) {
    // No? Well build it...
    fs.mkdirSync(this.base);
  }
};

Conn.prototype.find = function (blob, cb) {
  // Check exists
  if (!fs.existsSync(this.base + blob)) {
    cb({
      code: 404,
      message: 'Blob not found'
    });
  } else {
    var type = mime.lookup(this.base + blob);
    var size = fs.statSync(this.base + blob).size;
    cb(false, {
      file: path.resolve(this.base + blob),
      type: type,
      size: size
    });
  }
};

Conn.prototype.create = function (name, file, cb) {
  // Ensure blob DNE
  if (fs.existsSync(__dirname + this.base + name)) {
    cb({
      code: 409,
      message: 'Blob already exists'
    });
    return false;
  }

  fs.rename(file.path, this.base + name, function (err) {
    if (err) {
      cb({
        code: 500,
        message: err
      });
      return false;
    }
    // Success
    cb(false);
  });
};

Conn.prototype.update = function (blob, name, file, cb) {
  // Check that blob exists
  if (!fs.existsSync(this.base + blob)) {
    cb({
      code: 404,
      message: 'Blob does not exists'
    });
    return false;
  }

  // Vars
  var pathOld, pathNew;

  if (!file && name) {
    // Rename
    pathOld = this.base + blob;
    pathNew = this.base + name;
  } else if (file && !name) {
    // Replace
    // Remove
    fs.unlinkSync(this.base + blob);
    // Set
    pathOld = file.path;
    pathNew = this.base + blob;
  } else if (file && name) {
    // Both
    // Remove
    fs.unlinkSync(this.base + blob);
    // Set
    pathOld = file.path;
    pathNew = this.base + name;
  } else {
    // Huh?
    cb({
      code: 400,
      message: 'No condition matches request'
    });
    return false;
  }

  // Process
  fs.rename(pathOld, pathNew, function (err) {
    if (err) {
      cb({
        code: 500,
        message: err
      });
      return false;
    }
    // Success
    cb(false);
  });
};

Conn.prototype.remove = function (blob, cb) {
  // Check that blob exists
  if (!fs.existsSync(this.base + blob)) {
    cb({
      code: 404,
      message: 'Blob not found'
    });
    return false;
  }
  // Delete
  fs.unlink(this.base + blob, function (err) {
    if (err) {
      cb({
        code: 500,
        message: err
      });
      return false;
    }
    // Success
    cb(false);
  });
};

module.exports = Conn;
