var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var assert = require('assert');
var index = require('../lib/index');
var docs = require('../test/fixtures/docs.json');

suite.add('index', function() {
    index.generateFrequency(docs);
})
.on('cycle', function(event) {
    console.log(String(event.target));
})
.run();
