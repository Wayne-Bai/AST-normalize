app.factory('AuthService', ['$http', 'SERVER_URL', function($http, SERVER_URL){

  serviceMethods = {};

  serviceMethods.sendPasswordReset = function(email){
    return $http({
      method: 'POST',
      url: SERVER_URL + '/auth/send',
      data: {email: email}
    }).then(function(response){
      return response.data;
    });
  };

  serviceMethods.resetPassword = function(resetParams){
    return $http({
      method: 'POST',
      url: SERVER_URL + '/auth/reset',
      data: {
        password: resetParams.password,
        resetHash: resetParams.resetHash
      }
    }).then(function(response){
      return response.data;
    });
  };

  return serviceMethods;

}]);