/*jshint camelcase: false */
'use strict';
/*jshint unused:vars */
/**
 * @ngdoc module
 * @name
 *
 * @description
 *
 */
angular.module('RedhatAccess.search').directive('rhaStandardsearch', function () {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'search/views/standard_search.html'
    };
});
