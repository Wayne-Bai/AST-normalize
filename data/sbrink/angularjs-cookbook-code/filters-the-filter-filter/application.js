angular.module('cookbookApp', [])
  .controller('MainController', function($scope, $http) {
    $http.get('users.json').then(function(usersResponse) {
      $scope.users = usersResponse.data;
    });

    $scope.underForty = function (user) {
      return user.age < 40;
    };
  });