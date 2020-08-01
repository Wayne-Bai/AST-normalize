angular.module('cookbookApp', [])
  .controller('MainController', function($scope) {
    $scope.people = [
      { name: 'John', gender: 'male' },
      { name: 'Bill', gender: 'male' },
      { name: 'Anne', gender: 'female' }
    ];
  });