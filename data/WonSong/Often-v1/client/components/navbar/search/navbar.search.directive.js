'use strict';

angular.module('oftenApp')
  .directive('search', function ($rootScope) {
    return {
      restrict: 'E',
      templateUrl: 'components/navbar/search/navbar.search.directive.html',
      link: function (scope, element, attrs) {

        scope.search = function ($event) {
          var $element = $($event.target);
          var searchText = $element.val();
          $rootScope.$broadcast('search-start', searchText);
        }

      }
    };
  });