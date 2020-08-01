/*global angular*/
'use strict';
angular.module('RedhatAccess.cases').directive('rhaEmailnotifyselect', function () {
    return {
        templateUrl: 'cases/views/emailNotifySelect.html',
        restrict: 'A',
        transclude: true,
        controller: 'EmailNotifySelect',
        link: function postLink(scope, element, attrs) {
            scope.$on('$destroy', function () {
                element.remove();
            });
        }
    };
});
