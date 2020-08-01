app.config(['$stateProvider', function ($stateProvider) {

  $stateProvider
    .state('admin.tags', {
      abstract: true,
      url: '/tags',
      template: '<ui-view/>'
    })
      .state('admin.tags.all', {
        url: '',
        templateUrl: '/js/admin/subroutes/tags/templates/tags.tpl.html',
        controller: 'AdminTagsCtrl'
      });

}]);
