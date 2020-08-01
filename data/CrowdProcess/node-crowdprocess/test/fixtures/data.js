var Readable = require('stream').Readable;

exports.generateStream = generateStream;
function generateStream (n) {
  var data = new Readable({objectMode: true});
  data._read = function _read () {
    if (n--) {
      data.push(n);
    } else {
      data.push(null);
    }
  };
  return data;
}

exports.generateArray = generateArray;
function generateArray (n) {
  var data = [];
  while (n--) {
    data.push(n);
  }
  return data;
}