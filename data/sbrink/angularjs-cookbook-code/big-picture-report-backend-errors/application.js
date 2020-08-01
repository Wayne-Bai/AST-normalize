angular.module('cookbookApp', [])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('httpErrorInterceptor');
  })
  .factory('httpErrorInterceptor', function ($q, $rootScope) {
    return {
      'responseError': function(responseError) {
        $rootScope.$broadcast('responseError', responseError);
        return responseError;
      }
    };
  })
  .directive('errorOutput', function() {
    return {
      restrict: 'E',
      link: function(scope, element, attrs) {
        scope.$on('responseError', function(event, response) {
          var status  = response.status;
          var url     = response.config.url;
          var headers = JSON.stringify(response.headers());
          element.append(status + ' ' + url + ' ' + headers + '<br>');
        });
      }
    };
  })
  .controller('MainController', function($scope, $http) {
    $http.get('fail1.json');
    $http.get('fail2.json');
  });






