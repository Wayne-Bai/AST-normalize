var ndarray = require('ndarray');
var fft = require('ndarray-fft');
var mag = require('ndarray-complex').mag;

var data = new Float32Array(8000);

function fn (t) {
    return sin(440) + sin(2000);
    function sin (x) { return Math.sin(2 * Math.PI * t * x) }
}

for (var i = 0; i < 8000; i++) {
    t = i / 44000;
    data[i % data.length] = fn(t);
}

var reals = ndarray(data, [ data.length, 1 ]);
var imags = ndarray(new Float32Array(data.length), [ data.length, 1 ]);
