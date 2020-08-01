(function () {
  'use strict';

  describe('AuthCtrl spec', function () {
    var $rootScope,
        $scope,
        authService,
        createController,
        deferred;

    beforeEach(function () {
      module('mdwiki');
      module('mdwiki.controllers');
    });

    beforeEach(inject(function ($injector, $controller, $q) {
      $rootScope = $injector.get('$rootScope');
      spyOn($rootScope, '$broadcast');

      authService = $injector.get('AuthService');

      deferred = $q.defer();
      spyOn(authService, 'getAuthenticatedUser').and.returnValue(deferred.promise);

      $scope = $rootScope.$new();

      createController = function () {
        return $controller('AuthCtrl', {
          $rootScope: $rootScope,
          $scope: $scope,
          authService: authService
        });
      };
    }));

    describe('When user is authenticated', function () {
      it('Should set the user and that user isAuthenticated and broadcast a message', function () {
        createController();

        $scope.$apply(function () {
          deferred.resolve('janbaer');
        });

        expect($scope.isAuthenticated).toEqual(true);
        expect($scope.user).toEqual('janbaer');
        expect($rootScope.$broadcast).toHaveBeenCalledWith('isAuthenticated', { isAuthenticated: true });
      });
    });
    describe('When user is not authenticated', function () {
      it('Should set the user to null and that user is not authenticated and broadcast a message', function () {
        createController();

        $scope.$apply(function () {
          deferred.resolve();
        });

        expect($scope.isAuthenticated).toEqual(false);
        expect($scope.user).toEqual(null);
        expect($rootScope.$broadcast).toHaveBeenCalledWith('isAuthenticated', { isAuthenticated: false });
      });
    });
  });
})();

