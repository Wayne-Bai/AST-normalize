(function () {
  'use strict';

  describe('GitConnectCtrl spec', function () {

    beforeEach(function () {
      module('mdwiki');
      module('mdwiki.controllers');
    });

    describe('When the user enters a valid git url', function () {
      var $scope, $location, createController,
          pageService, settingsService,
          pagesDeferred, serverConfigDeferred;

      beforeEach(inject(function ($injector, $controller, $rootScope, $q) {
        $scope = $rootScope.$new();

        $location = $injector.get('$location');
        spyOn($location, 'path');

        var $http = $injector.get('$httpBackend');
        $http.expectGET('./views/content.html').respond(200, '<h1/>');

        pageService = $injector.get('PageService');
        pagesDeferred = $q.defer();
        pagesDeferred.resolve([{ name: 'index' }]);
        spyOn(pageService, 'getPages').and.returnValue(pagesDeferred.promise);

        settingsService = $injector.get('SettingsService');
        spyOn(settingsService, 'put');

        var serverConfigService = $injector.get('ServerConfigService');
        serverConfigDeferred = $q.defer();
        spyOn(serverConfigService, 'getConfig').and.returnValue(serverConfigDeferred.promise);

        createController = function () {
          return $controller('GitConnectCtrl', {
            $scope: $scope,
            $location: $location,
            settingsService: settingsService,
            serverConfigService: serverConfigService
          });
        };
      }));

      it('should call just getpages and saves the settings when successful', function () {
        var gitCtrl = createController();

        $scope.provider = 'github';
        $scope.githubUser = 'janbaer';
        $scope.repositoryName = 'wiki';
        $scope.connect();

        $scope.$apply(function () {
          pagesDeferred.resolve([]);
        });

        expect($location.path).toHaveBeenCalledWith('/');
        expect(pageService.getPages).toHaveBeenCalled();
        expect(settingsService.put).toHaveBeenCalledWith({ provider: 'github', url: 'janbaer/wiki', githubUser: 'janbaer', githubRepository: 'wiki', startPage: 'index' });
      });
    });
  });
})();


