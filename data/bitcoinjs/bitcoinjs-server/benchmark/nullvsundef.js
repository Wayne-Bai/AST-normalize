require('buffertools');

var suite = require('./common');

// add tests
var subjectNull = null;
suite.add('null', function() {
  if (null === subjectNull) {
    return 1;
  }
});

var subjectUndef;
suite.add('undef', function() {
  if ("undefined" === typeof subjectUndef) {
    return 1;
  }
});

// run async
suite.run({ 'async': true });
