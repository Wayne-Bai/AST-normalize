
// min is inclusive, max is exclusive.
function randomInt(min, max) {
  if (min === undefined) {
    min = -2147483648;
  }
  if (max === undefined) {
    max = 2147483647;
  }
  return Math.round(Math.random() * (max - min) + min);
}

function randomBuffer(sz, type) {
  sz = sz || randomInt(10, 100);
  var buf = new Buffer(sz, type || 'binary');
  for (var i = 0; i < sz; i++) {
    buf[i] = randomInt(0, 255);
  }
  return buf;
}

function makeRangeArray(len) {
  var i, result = [];

  for (i = 0; i < len; i++) {
    result.push(i);
  }

  return result;
}

exports.randomInt = randomInt;
exports.randomBuffer = randomBuffer;
exports.makeRangeArray = makeRangeArray;
