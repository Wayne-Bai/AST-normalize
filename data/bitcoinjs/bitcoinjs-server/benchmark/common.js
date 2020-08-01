var Benchmark = require('benchmark');

var suite = new Benchmark.Suite;

suite
  .on('cycle', function(event, bench) {
    console.log(String(bench));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  });

module.exports = suite;
