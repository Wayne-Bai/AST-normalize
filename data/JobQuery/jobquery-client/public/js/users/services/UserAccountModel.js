app.factory('UserAccountResource', ['$resource', 'SERVER_URL', function ($resource, SERVER_URL) {
  return $resource(SERVER_URL + '/public/account', null, {update: {method: 'PUT'}});
}]);

app.factory('UsersAccount', ['UserAccountResource', function (UserAccountResource) {
  var userMethods = {};

  userMethods.get = function () {
    return UserAccountResource.get().$promise;
  };

  userMethods.update = function (userData) {
    return UserAccountResource.update(userData).$promise;
  };

  return userMethods;
}]);
