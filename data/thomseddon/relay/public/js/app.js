'use strict';


// Declare app level module which depends on filters, and services
var app = angular.module('relay', [
  'ngRoute',
  'relay.filters',
  'relay.services',
  'relay.directives',
  'relay.controllers'
]);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $routeProvider.when('/sms', {
    controller: 'Sms',
    templateUrl: 'partials/sms.html'
  });
  // $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({
    redirectTo: '/sms'
  });
}]);
