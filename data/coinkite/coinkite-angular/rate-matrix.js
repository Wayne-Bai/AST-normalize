// NOTE: This project doesn't need any authentication.
//
var CK_API_HOST = 'https://api.coinkite.com';

var app = angular.module('cc-example-module', ['mgcrea.ngStrap', 'ngResource' ]);

app.controller('mainController', function($scope, $resource) {

	// NOTE: This endpoint is public and does not require any API key to read.
    $scope.busy = true;
    $scope.rates = {};
    $scope.reload_rates = function() {
      // clear old values
      $scope.rates = {};
      $scope.busy = true;

      $resource(CK_API_HOST + '/public/rates').get(function(d) {

          $scope.rates = d.rates;
          $scope.info = d.currencies;
          $scope.all_codes = _.keys(d.currencies);
          $scope.crypto_codes = _.sortBy(_.keys(d.rates),
                                    function(k) { return d.currencies[k].rank;});
          $scope.fiat_codes = _.sortBy(_.difference($scope.all_codes, $scope.crypto_codes, ['XTN']),
                                    function(k) { return d.currencies[k].rank;});
                                                    
          $scope.busy = false;
      });
    }
    $scope.reload_rates();
});

app.factory('myInterceptor', ['$log', function($log) {

    // This is just for extra debugging ... not required.

    var myInterceptor = {
       'request': function(config) {
            $log.debug("HTTP Request " + config.url, config);

            return config;
        },

        'response': function(response) {
            $log.debug("HTTP Response: ", response);

            return response;
        },

        'responseError': function(response) {
            // This allows my carefully constructed JSON error
            // responses to show through!
            $log.debug("HTTP Response (Error): ", response);
			if(!response.data) {
				response.data = '{"error":"HTTP Error ' + response.status + '"}';
			}
            return response;
        }
    };

    return myInterceptor;
}]);

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('myInterceptor');
}]);


// EOF
