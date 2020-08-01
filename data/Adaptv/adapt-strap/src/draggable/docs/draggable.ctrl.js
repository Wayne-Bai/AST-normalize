angular.module('adaptv.adaptStrapDocs')
  .controller('draggableCtrl', ['$scope', function($scope) {
    $scope.models = {
      basket: [],
      cars: [
        {
          id: 1,
          name: 'Audi A4',
          modelYear: 2009,
          price: 34000
        },
        {
          id: 2,
          name: 'BMW 328i',
          modelYear: 2012,
          price: 39000
        },
        {
          id: 3,
          name: 'Audi A6',
          modelYear: 2012,
          price: 44000
        },
        {
          id: 4,
          name: 'Audi S8',
          modelYear: 2014,
          price: 100000
        },
        {
          id: 5,
          name: 'Audi A4',
          modelYear: 2009,
          price: 34000
        }
      ]
    };

    $scope.remove = function(l, o) {
      var index = l.indexOf(o);
      if (index > -1) {
        l.splice(index, 1);
      }
    };

    $scope.onDragStart = function() {

    };

    $scope.onDragEnd = function() {

    };

    $scope.onDragOver = function() {

    };

    $scope.onDrop = function(data) {
      if (data) {
        $scope.models.basket.push(data);
        $scope.remove($scope.models.cars, data);
      }
    };
  }]);
