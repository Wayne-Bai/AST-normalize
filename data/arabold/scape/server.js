/**
 * Module dependencies.
 */
var express = require('express'),
    fs = require('fs'),
    vm = require('vm');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'develop',
    config = require('./config/config');

var app = express();

// Express settings
require('./config/express')(app);

// Bootstrap routes
require('./config/routes')(app);

// Start the app by listening on <port>
var port = process.env.PORT || config.port;
app.listen(port);
console.log('Express app started on port ' + port);

// Expose app
exports = module.exports = app;
