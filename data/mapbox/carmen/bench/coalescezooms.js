var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var assert = require('assert');
var coalesceZooms = require('../lib/pure/coalescezooms'),
    args = require('./fixtures/coalesce.json'),
    result = require('./fixtures/coalesce-result.json');

suite.add('coalescezooms 1', function() {
    // @TODO worst case scenario this data
    coalesceZooms(args[0], args[1], args[2]);
}).add('coalescezooms 2', function() {
    // @TODO worst case scenario this data
    coalesceZooms(args[0], args[1], args[2]);
})
.on('cycle', function(event) {
  console.log(String(event.target));
})
.run();
