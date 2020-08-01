'use strict';

var angularInjections = angularInjections || [];

angular.module('welcomeApp', [
    'esn.login',
    'esn.invitation',
    'esn.company',
    'restangular',
    'ngRoute'
  ].concat(angularInjections))
  .config(function($routeProvider, RestangularProvider) {

    $routeProvider.when('/signup/:id', {
      templateUrl: '/views/modules/invitation/finalize',
      controller: 'finalize',
      resolve: {
        invitation: function(invitationAPI, $route) {
          return invitationAPI.get($route.current.params.id).then(
            function(data) {
              return data;
            },
            function(err) {
              return {
                status: 'error',
                error: err
              };
            }
          );
        }
      }
    });

    $routeProvider.when('/login', {
      templateUrl: '/views/modules/login/home'
    });

    $routeProvider.when('/', {
      templateUrl: '/views/welcome/partials/home'
    });

    $routeProvider.when('/confirm', {
      templateUrl: '/views/welcome/partials/confirm'
    });

    $routeProvider.otherwise({redirectTo: '/'});

    RestangularProvider.setBaseUrl('/api');
  });
