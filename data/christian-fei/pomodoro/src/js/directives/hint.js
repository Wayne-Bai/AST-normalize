angular.module('app')
.directive('hint', function(Tour){
  return {
    scope: {
      'text': '@'
    },
    restrict: 'E',
    templateUrl: 'hint.html'
  }
})
