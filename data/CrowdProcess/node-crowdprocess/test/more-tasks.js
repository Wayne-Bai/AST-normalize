var test = require('tap').test;
var credentials = require('../credentials.json');
var CrowdProcess = require('..')(credentials);
var data = require('./fixtures/data');
var program = require('./fixtures/program');
var Writable = require('stream').Writable;

// this will take some time, so you should run it with
// tap --timeout 600

var N = 50000;

test('lower level write and end', function (t) {
  var dataArray = data.generateArray(N);
  var job = CrowdProcess(program, onResults);

  dataArray.forEach(function (n) {
    job.write(dataArray[n]);
  });

  job.end();

  function onResults (results) {
    t.equal(results.length, N);
    t.deepEqual(results.sort(), dataArray.sort());
    results.forEach(function (result) {
      var index = dataArray.indexOf(result);
      if (index > -1) {
        dataArray.splice(index, 1);
      }
    });
    t.equal(dataArray.length, 0);
    t.deepEqual(dataArray, []);
    t.end();
  }
});