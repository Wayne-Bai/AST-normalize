angular.module('cookbookApp', [])
  .directive('confirmedClick', function($parse, $q, $compile, $rootScope) {
    var box = '<div class="box"><div>Really?</div> ' +
      '<button ng-click="close($event, true)">OK</button>' +
      '<button ng-click="close($event)">Cancel</button>' +
      '</div>';
    return {
      link: function(scope, element, attrs) {
        var fn = $parse(attrs.confirmedClick);
        element.on('click', function() {
          var boxScope = $rootScope.$new();
          var boxElement = $compile(box)(boxScope);

          element.attr('disabled', 'disabled');
          element.append(boxElement);

          boxScope.close = function(event, execute) {
            event.stopPropagation();
            element.removeAttr('disabled');
            boxElement.remove();
            if (execute) {
              fn(scope, {$event: event});
            }
          };
        });
      }
    };
  })
  .controller('MainController', function($scope) {
    $scope.tasks = ['Tidy up', 'Wash the dishes'];
    $scope.removeTask = function(index){
      $scope.tasks.splice(index, 1);
    };
  });





