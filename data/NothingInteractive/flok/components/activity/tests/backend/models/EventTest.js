/**
 * Tests for Event.js model
 *
 * @copyright  Nothing Interactive 2014
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
require('../../../backend/models/Event.js');
var Event = mongoose.model('Event');

describe('Flok Component Stream: Event Model', function() {

    before(function(done) {
        // Connect to mongoose before the tests
        mongoose.connect(config.test.db, function() {
            done();
        });
    });

    beforeEach(function(done) {
        // Once we're connected drop the database to avoid interference from other tests
        mongoose.connection.db.dropDatabase(function() {
            done();
        });
    });

    it('Event objects can be created', function() {
        assert.isFunction(Event, 'Event should be a function');
        var testEvent = new Event();
        assert.isObject(testEvent, 'Expected new Event() to create object');
    });

    it('converts toJSON', function() {
        var testEvent = new Event();

        var json = testEvent.toJSON();

        assert.isObject(json, 'Expecting a JSON object');
        // TODO test the properties of the object according to schema
        // for this we could write a jsonSchema and parse it through a validator to save time.

        // for now test that it has the require properties:
        assert.property(json, 'timestamp', 'timestamp should have a default value');
        assert.property(json, 'author', 'author is a required property');
    });

    it('converts nested objects toJSON', function() {
        var testEvent = new Event({
            author: {
                name: 'test'
            }
        });

        var json = testEvent.toJSON();

        // Stringify and parse again
        // TODO: this is what happens when it's send over the API, so should probably rather be an integration test
        json = JSON.parse(JSON.stringify(json));
        assert.isObject(json, 'Expecting a JSON object');
        assert.isObject(json.author, 'author is an object');
        assert.equal(json.author.name, 'test', 'correct author name');
    });

    it('saves Events to the db', function(done) {
        var event = new Event();

        event.title = 'The Test Event';
        event.sourceId = 'TestSaveEventToDb!1';

        event.save(function(err, newEvent, numberAffected) {
            assert.isNull(err, 'save should not throw error');

            assert.equal(newEvent.title, event.title, 'The title of the created event should match');

            assert.equal(numberAffected, 1, 'only 1 object should be affected');

            done();
        });
    });

    after(function(done) {
        // Close connection after all tests
        mongoose.connection.close(function() {
            done();
        });
    });
});
