angular.module('cookbookApp', [])
  .controller('MainController', function($scope, $http, $q) {
    var cache;

    function userCache() {
      if (cache) {
        console.log('Loaded data from cache');
        return $q.when(cache);
      } else {
        console.log('Loaded data from webserver');
        return $http.get('users.json').then(function(response) {
          cache = response.data;
          return response.data;
        });
      }
    }

    $scope.loadUsers = function() {
      userCache().then(function(users) {
        $scope.users = users;
      });
    };

  });


