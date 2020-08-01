/**
 * Tests for Time.js model
 *
 * @copyright  Nothing Interactive 2014
 * @author     Patrick Fiaux <nodz@nothing.ch>
 */
/* globals describe, it, afterEach, beforeEach, after, before */
'use strict';

// Imports
var chai = require('chai');
var mongoose = require('mongoose');
var assert = chai.assert;

// Load the main config so we can figure out the test db
var config = require('../../../../../config/config.js');

// Class / Object we want to test
require('../../../backend/models/Time.js');
var Time = mongoose.model('Time');

describe('Flok Component Time', function() {

    before(function () {
        // Connect to mongoose
        mongoose.connect(config.test.db);
    });

    it('Time objects can be created', function() {
        assert.isFunction(Time,'Time should be a function');
        var testTime = new Time();
        assert.isObject(testTime,'Expected new Time() to create object');
    });

    after(function (done) {
        // Close connection after all tests
        mongoose.connection.close(function () {
            done();
        });
    });
});

