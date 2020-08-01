define(function(require) {
  var moduleId = require('module').id;
  var angular = require('angular');
  var css = require('css!./ajaxloader.css');

  function link(scope, rocketContext, attrs) {
    scope.size = attrs.size || 40;
  }

  function controller($scope) {
    $scope.size = 40;
  }

  angular.module(moduleId, []).directive('ajaxloader', function() {
    return {
      replace: true,
      link: link,
      restrict: 'E',
      controller: controller,
      scope: {
      },
      template: require('jade!./ajaxloader')()
    }
  });
  return moduleId;
});