'use strict';
/*jshint unused:vars */
angular.module('RedhatAccess.cases').directive('rhaOnchange', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('change', element.scope()[attrs.rhaOnchange]);
        }
    };
});