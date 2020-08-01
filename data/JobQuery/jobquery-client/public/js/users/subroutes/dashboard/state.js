app.config(['$stateProvider', function ($stateProvider) {

  $stateProvider
    .state('users.dashboard', {
      url: '/dashboard',
      templateUrl: '/js/users/subroutes/dashboard/templates/dashboard.tpl.html',
      controller: 'UsersDashboardCtrl'
    });

}]);
