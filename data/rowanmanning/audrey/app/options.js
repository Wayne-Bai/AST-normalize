'use strict';

var _ = require('underscore');
var crypto = require('crypto');

exports.sanitizeOptions = sanitizeOptions;

function sanitizeOptions (opts) {
    opts = _.defaults(opts, {
        db: 'mongodb://localhost/audrey',
        env: 'development',
        pass: false,
        port: 3000,
        secret: generateSecret()
    });
    opts.port = parseInt(opts.port, 10);
    return opts;
}

function generateSecret () {
    return crypto.createHash('md5').update(Date.now().toString()).digest('hex');
}
