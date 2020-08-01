'use strict';

var mongoose = require('mongoose'),
    schema = new mongoose.Schema({
        email: { type: String, require: true },
        password: { type: String, require: true }
    }, { id: false });

module.exports = function (conn) {
  return conn.model('userUnverified', schema);
};
