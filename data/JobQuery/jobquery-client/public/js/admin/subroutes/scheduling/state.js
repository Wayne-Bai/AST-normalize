app.config(['$stateProvider', function ($stateProvider) {

  $stateProvider
    .state('admin.scheduling', {
      url: '/scheduling',
      templateUrl: '/js/admin/subroutes/scheduling/templates/scheduling.tpl.html',
      controller: 'AdminSchedulingCtrl'
    });

}]);
