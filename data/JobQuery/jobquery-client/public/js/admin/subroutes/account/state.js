app.config(['$stateProvider', function ($stateProvider) {

  $stateProvider
    .state('admin.account', {
      url: '/account',
      templateUrl: '/js/admin/subroutes/account/templates/account.tpl.html',
      controller: 'AdminAccountCtrl'
    });

}]);
