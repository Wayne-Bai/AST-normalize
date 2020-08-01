var fs = require('fs');
var through = require('through2');
var parseOSM = require('../');

var osm = parseOSM();
fs.createReadStream(process.argv[2])
    .pipe(osm)
    .pipe(through.obj(function (items, enc, next) {
        items.forEach(function (item) {
            console.log('item=', item);
        });
        next();
    }))
;
