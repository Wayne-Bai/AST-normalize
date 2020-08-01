//Application Level State
app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/login');

  $stateProvider
    .state('home', {
      url: '',
      templateUrl: '/js/core/templates/home.tpl.html',
      resolve: {
        redirect: ['$location', 'localStorageService', function ($location, localStorageService) {
          var isAdmin = localStorageService.get('isAdmin');
          if(isAdmin === 'true'){
            $location.path('/admin');
          } else {
            $location.path('/users');
          }
        }]
      },
      controller: 'AppCtrl'
    })
    .state('404', {
      url: '/404',
      templateUrl: '/js/core/templates/404.tpl.html',
      controller: 'AppCtrl'
    })
    .state('login', {
      url: '/login',
      templateUrl: '/js/core/templates/login.tpl.html',
      controller: 'LoginCtrl'
    })
    .state('reset', {
      url: '/reset/:resetHash',
      templateUrl: '/js/core/templates/reset.tpl.html',
      controller: 'ResetCtrl'
    })
    .state('send', {
      url: '/send',
      templateUrl: '/js/core/templates/send.tpl.html',
      controller: 'SendCtrl'
    });

}]);
