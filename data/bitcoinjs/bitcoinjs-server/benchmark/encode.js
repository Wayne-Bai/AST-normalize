require('buffertools');

var suite = require('./common');

var subject = new Buffer(32);

var subject_b64 = subject.toString('base64');
var subject_hex = subject.toString('hex');
var subject_bin = subject.toString('binary');

suite.add('base64 encode', function () {
  var target = subject.toString('base64');
});

suite.add('hex encode', function() {
  var target = subject.toString('hex');
});

suite.add('binary encode', function() {
  var target = subject.toString('binary');
});

suite.add('base64 decode', function () {
  var target = new Buffer(subject_b64, 'base64');
});

suite.add('hex decode', function () {
  var target = new Buffer(subject_hex, 'hex');
});

suite.add('binary decode', function () {
  var target = new Buffer(subject_bin, 'binary');
});

// run async
suite.run({ 'async': true });
