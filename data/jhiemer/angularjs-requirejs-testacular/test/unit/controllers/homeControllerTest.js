define(['angular', 'mocks'], function () {
	"use strict";

	describe('HomeController', function () {
		var homeService, homeProvider, serviceThenSpy, baseScope;

		beforeEach(function () {			
			module('services', function ($provide) {
				$provide.factory('homeService', function () {
					console.log('creating homeService...');

					homeService = jasmine.createSpy('homeService');

					serviceThenSpy = jasmine.createSpy("then").andCallFake(function () {
                        return {
                            then:serviceThenSpy
                        };
                    });

					homeService.get = jasmine.createSpy().andCallFake(function (url) {
						return {
							name : 'blub',
							pass : 'blob' + url,
							then: serviceThenSpy
						};
					});

					console.log('home service created', homeService);

					return homeService;
				});

				$provide.factory('homeProvider', function () {
					homeProvider = jasmine.createSpy('homeProvider');
					homeProvider.get = jasmine.createSpy().andCallFake(function () {
						return {
							'id' : 1,
							'name' : 'Sample home'
						}
					});
				});

			});

			module('controllers', function ($provide) {
				$provide.factory('location', function () {
					var location = jasmine.createSpy();

					console.log('location spy', location);

					return location;
				});
			});

			inject(['homeService', 'homeProvider', '$rootScope', '$controller',
				function(_homeService, _homeProvider, $rootScope, $controller) {
					homeService = _homeService;
					homeProvider = _homeProvider;
								
					baseScope = $rootScope.$new();
					$controller('homeController', {
						$scope : baseScope,
						homeService : homeService,
						home : homeProvider
					});
				}
			]);			
		});

		describe('Testing variables', function () {
			it('should have a variable $scope.variable which is "empty"', function () {				
				expect(baseScope.variable).toEqual('empty');
			});
		});

		describe('Testing functions', function () {
			it('should have a function called login', function () {
				expect(baseScope.login()).not.toBe(null);
			});
		});
	});
})