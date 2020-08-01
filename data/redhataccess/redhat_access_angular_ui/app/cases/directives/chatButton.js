'use strict';
/*jshint unused:vars */
angular.module('RedhatAccess.cases').directive('rhaChatbutton', function () {
    return {
        scope: {},
        templateUrl: 'cases/views/chatButton.html',
        restrict: 'A',
        controller: 'ChatButton',
        link: function postLink(scope, element, attrs) {
            scope.$on('$destroy', function () {
                element.remove();
            });
        }
    };
});
