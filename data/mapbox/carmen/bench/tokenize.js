var Benchmark = require('benchmark');
var suite = new Benchmark.Suite();
var assert = require('assert');
var termops = require('../lib/util/termops');

suite.add('tokenize', function() {
    assert.deepEqual(termops.tokenize('Chamonix-Mont-Blanc'), ['chamonix','mont','blanc']);
})
.on('cycle', function(event) {
    console.log(String(event.target));
})
.run();
