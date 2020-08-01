'use strict';

var mongoose = require('mongoose');

exports.connectToDatabase = connectToDatabase;

function connectToDatabase (opts, done) {
    mongoose.connect(opts.db, done);
}
