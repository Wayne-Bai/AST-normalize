var fs = require('fs');
var through = require('through2');
var parseOSM = require('../');

var osm = parseOSM();
var stats = { node: 0, way: 0, relation: 0 };
process.stdin
    .pipe(osm)
    .pipe(through.obj(function (values, enc, next) {
        // for(var i = 0; i < values.length; i++) {
        //     stats[values[i].type]++;
        // }
        values.forEach(function(value) {
            stats[value.type]++;
        });
        next();
    }, function (next) {
        console.log("stats", stats);
        next();
    }));
