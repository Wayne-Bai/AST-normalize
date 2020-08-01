/**
 * Task Class tests
 */
/*global describe, beforeEach, it, assert */
describe('Task Class.', function() {
    'use strict';

    var Task;

    // before each
    beforeEach(function() {
        angular.mock.module('flokModule', 'flokTimeModule');

        angular.mock.inject(function(_$rootScope_, _Task_) {
            Task = _Task_;
        });
    });

    describe('Task().', function() {
        it('No params creates empty task', function() {
            var task = new Task();
            // Check that default values are correct
            assert.equal(task.completed, false, 'task is not complete by default');
            assert.equal(task.isActive(), true, 'task starts active by default');
            assert.equal(task.totalManualChange, 0, 'task has no manual change by default');
            assert.equal(task.name, '', 'ticket name is empty by default');
        });

        it('Constructor parameters work', function() {
            var name = 'Work on flok';
            var task = new Task(
                name,
                60000, // 1 minute in ms
                new Date(946684799000),
                new Date(946684801000),
                30000,
                true
            );
            // Check that default values are correct
            assert.equal(task.name, name);
            assert.equal(task.completed, true);
            assert.equal(task.isActive(), false);
            assert.equal(task.totalManualChange, 30000);
            assert.equal(task.totalDuration, 92000);
        });
    });


    describe('createFromJSON().', function() {
        it('Empty args creates default', function() {
            var task = Task.createFromJSON();
            // Check that default values are correct
            assert.equal(task.completed, false);
            assert.equal(task.isActive(), true);
            assert.equal(task.totalManualChange, 0, 'manual change should be 0');
            assert.equal(task.totalDuration, 0, 'total duration should be 0');
            assert.equal(task.name, '');
        });

        it('Non Empty parameters correctly loaded', function() {
            var name = 'Random';
            var jsonTask = {
                name: name,
                pastDuration: 123,
                totalManualChange: 123456,
                startTime: '',
                endTime: '',
                completed: true
            };
            var task = Task.createFromJSON(jsonTask);
            // Check that default values are correct
            assert.equal(task.completed, true);
            assert.equal(task.isActive(), true);
            assert.equal(task.totalManualChange, 123456);
            assert.equal(task.totalDuration, 123579);
            assert.equal(task.name, name);
        });
    });

    /**
     * TODO
     * continue
     * stop
     * updateDuration
     */
});
