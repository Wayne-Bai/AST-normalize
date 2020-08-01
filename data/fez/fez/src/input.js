var Promise = require("bluebird"),
    fs = require("fs");

function Input(input) {
  if(typeof input === "string") {
    this._filename = input;
  } else if(input instanceof Buffer) {
    this._buffer = input;
  }
}

Input.prototype.asBuffer = function() {
  if(this._filename) {
    var file = this._filename;
    return new Promise(function(resolve, reject) {
      fs.readFile(file, function(err, data) {
        if(err) reject(err);
        else resolve(data);
      });
    });
  } else if (this._buffer) {
    return this._buffer;
  } else {
    throw new Error("What?");
  }
};

Input.prototype.asStream = function() {
  if(this._filename) {
    return fs.createReadStream(this._filename);
  }
};

Input.prototype.getFilename = function() {
  return this._filename;
};

module.exports = Input;
