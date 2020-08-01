'use strict';

var es = require('event-stream');

function makeReporter(output) {

    return es.through(function write(data) {
        delete data.fts;
        output.write(JSON.stringify(data, null, 0) + '\n');
    }, function end() {
        output.end();
    });
}

module.exports = makeReporter;
