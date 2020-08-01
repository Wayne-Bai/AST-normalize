angular.module('flokActivityModule').service('Event', ['$filter', 'STREAM_DATE_FORMAT', function($filter, STREAM_DATE_FORMAT) {
    'use strict';

    /**
     * Represents a event on the activity stream
     *
     * @copyright  Nothing Interactive 2014
     * @param {object} jsonData Data to initialize the event with
     * @constructor
     * @module flokActivityModule/Event
     */
    function Event(jsonData) {
        this.link = false;
        this.title = '';
        this.message = '';
        this.duration = 0;

        // Extend with the data from the backend
        angular.extend(this, jsonData);

        // TODO date helper will be needed here again
        if (angular.isDefined(this.timestamp)) {
            this.timestamp = new Date(this.timestamp);
        }
    }

    /**
     * Returns a formatted date and time string using STREAM_DATE_FORMAT
     * @returns {string} 'on Month day @ hour:minutes'
     */
    Event.prototype.getFormattedTimestamp = function() {
        return $filter('date')(this.timestamp, STREAM_DATE_FORMAT);
    };

    /**
     * Returns a string formatted duration
     * @returns {string} 'added|removed x hours y minutes'
     */
    Event.prototype.getFormattedDuration = function() {
        return $filter('activityDuration')(this.duration);
    };

    /**
     * List of properties of Event that will be persisted
     * @type {Array}
     */
    Event.INCLUDE_IN_JSON = ['timestamp', 'provider', 'link', 'title', 'message', 'author', 'duration'];

    return Event;
}]);
