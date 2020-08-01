var seaport = require('seaport');
var pier = require('../');

var server = seaport.createServer().listen(7890);
var cache = pier().tie(7890);

setInterval(function () {
    console.dir(cache.query('beep'));
}, 1000);
