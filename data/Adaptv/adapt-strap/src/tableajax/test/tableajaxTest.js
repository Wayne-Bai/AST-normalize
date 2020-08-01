describe('tableajax component', function () {
  var controller;

  beforeEach(function () {
    module('adaptv.adaptStrapDocs');
  });

  it('should initialize with correct configuration', inject(function ($rootScope, $controller, $compile, $http) {
    controller = $controller('tableajaxCtrl', {
      $scope: $rootScope
    });

    expect($rootScope.artistsColumnDef).toBeDefined();
    expect($rootScope.artistsAjaxConfig).toBeDefined();
    expect($rootScope.artistsColumnDefSearch).toBeDefined();
    expect($rootScope.artistsAjaxConfigSearch).toBeDefined();
    expect($rootScope.artistSearchKey).toBeDefined();
    expect($rootScope.searchArtist).toBeDefined();
  }));
});