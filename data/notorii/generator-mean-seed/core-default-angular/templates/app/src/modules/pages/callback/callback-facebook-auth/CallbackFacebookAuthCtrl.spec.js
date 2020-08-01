'use strict';

describe('CallbackFacebookAuthCtrl', function() {
	var $ctrl, $scope ={}, $httpBackend, $controller, $location;
	
	beforeEach(module('myApp'));
	
	beforeEach(inject(function(_$rootScope_, _$controller_, _$httpBackend_, _$location_) {
		$httpBackend =_$httpBackend_;
		$location =_$location_;
		$scope = _$rootScope_.$new();
		
		// $ctrl = _$controller_('CallbackFacebookAuthCtrl', {$scope: $scope});		//can't call here since need to set $routeParams FIRST in some tests
		$controller =_$controller_;
	}));
	
	it('should not work without proper hash params', function() {
		$ctrl = $controller('CallbackFacebookAuthCtrl', {$scope: $scope});
	});
	
	it('should make backend api facebook call if hash params are set properly', function() {
		$location.hash('access_token=token1&state=state1');
		
		var user ={
			_id: 'userId',
			sess_id: 'sessId'
		};
		$httpBackend.expectPOST('/api/facebook/me').respond({result: {user: user } });
		
		$ctrl = $controller('CallbackFacebookAuthCtrl', {$scope: $scope});
		
		$httpBackend.flush();
		
		$httpBackend.verifyNoOutstandingExpectation();
		$httpBackend.verifyNoOutstandingRequest();
	});
});