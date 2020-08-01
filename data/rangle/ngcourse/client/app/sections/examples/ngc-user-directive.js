'use strict';

angular.module('ngcourse-example-directives')

.directive('ngcUser', function () {
  return {
    restrict: 'E',
    scope: {
      userDisplayName: '='
    },
    template: '<span>Hello, {{ userDisplayName }}.</span>'
  };
});