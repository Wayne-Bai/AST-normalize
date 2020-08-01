/**
 * Copyright 2013, Radius Intelligence, Inc.
 * All Rights Reserved
 */

define([
    'require',
    'angular',

    'format-input.filter',
    'sample.controller',
    'status-chart.directive',
    'sample.service'

], function (angular, require) {

    angular.module('rad.test-application', [])
        .filter('formatInput', require('format-input.filter'))
        .controller('SampleController', require('sample.controller'))
        .directive('radStatusChart', require('status-chart.directive'))
        .service('Sample', require('sample.service'))
    ;

});
