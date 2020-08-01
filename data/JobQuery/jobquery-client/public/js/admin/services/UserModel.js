app.factory('UserResource', ['$resource', 'SERVER_URL', function($resource, SERVER_URL) {
  return $resource(SERVER_URL + '/api/users/:_id', null, {update: {method: 'PUT'}});
}]);

app.factory('User', ['UserResource', 'SERVER_URL', '$http' ,function (UserResource, SERVER_URL, $http) {
  var userMethods = {};

  userMethods.getAll = function () {
    return UserResource.query().$promise;
  };

  userMethods.get = function (id) {
    return UserResource.get({_id: id}).$promise;
  };

  userMethods.create = function (newUser) {
    var user = new UserResource(newUser);
    return user.$save();
  };

  userMethods.update = function (user) {
    return UserResource.update({_id: user._id}, user).$promise;
  };

  userMethods.invite = function (emails, category) {
    var data = {};
    data.emails = emails;
    if(category) data.category = category._id;
    return $http.post(SERVER_URL + '/api/invite', data);
  };

  userMethods.login = function (profile) {
    return $http.post(SERVER_URL + '/login', profile);
  };

  return userMethods;
}]);
