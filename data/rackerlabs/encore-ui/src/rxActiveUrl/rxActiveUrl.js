angular.module('encore.ui.rxActiveUrl', [])
/**
 *
 * @ngdoc directive
 * @name encore.ui.rxActiveUrl
 * @restrict A
 * @description
 * This is used as an attribute to directive <rx-product-resources>, in the
 * form of <li rx-active-url="/servers">. The directive checks if the attribute
 * value is a subset of the current URL. If so it returns the class name "selected"
 */
.directive('rxActiveUrl', function ($location) {
    return {
        restrict: 'E',
        templateUrl: 'templates/rxActiveUrl.html',
        transclude: true,
        replace: true,
        scope: {
            url: '@'
        },
        controller: function ($scope) {
            $scope.isNavActive = function (pattern) {
                return $location.path().indexOf(pattern) !== -1;
            };
        },
        link: function (scope, element, attribute) {
            // Is the subset of whatever is in isNavActive part of the URL string?
            scope.navActive = scope.isNavActive(attribute.url);
        }
    };
});
