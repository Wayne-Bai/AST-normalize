var app = angular.module('jobQuery', ['ui.router', 'ngResource', 'LocalStorageModule']);


app.constant('SERVER_URL', 'http://hrhqjquery.azurewebsites.net');

app.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.useXDomain = true; //Enable cross domain calls
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  // Remove the header used to identify ajax call that would prevent CORS from working
  // http://thibaultdenizet.com/tutorial/cors-with-angular-js-and-sinatra/
}]);
