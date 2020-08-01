var logdir = require('../');
var ld = logdir('/tmp/logdir');
var a = ld.createWriteStream('a');
var b = ld.createWriteStream('b');
setInterval(function () {
    a.write(String.fromCharCode(Math.random() * 26 + 97) + '\n');
}, 1000);

setInterval(function () {
    b.write(String.fromCharCode(Math.random() * 26 + 65) + '\n');
}, 1000);

ld.open([ 'a', 'b' ]).follow(-5).pipe(process.stdout);
