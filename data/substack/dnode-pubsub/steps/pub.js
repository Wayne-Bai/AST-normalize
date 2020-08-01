var Hash = require('hashish');
var subs = {};

function publish () {
    var args = arguments;
    Hash(subs).forEach(function (emit) {
        emit.apply(emit, args);
    });
}

setInterval(function () {
    var n = Math.floor(Math.random() * 100);
    publish('data', n);
}, 1000);

// for testing purposes:
subs.bar = function (ev, n) { console.log('bar.' + ev + ': ' + n) };
subs.baz = function (ev, n) { console.log('baz.' + ev + ': ' + n) };
