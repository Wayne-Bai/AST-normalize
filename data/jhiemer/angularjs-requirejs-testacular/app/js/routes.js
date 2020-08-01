/**
 *  route.js
 **/
define(['app'], function (app) {
	return app.config(['$stateProvider', '$routeProvider', '$urlRouterProvider', 
		function($stateProvider, $routeProvider, $urlRouterProvider) {
		console.log($stateProvider);
		console.log('route was called');
		
		$stateProvider
	        .state('home', {
	          url: '/home',
	          templateUrl: 'partials/home.html',
	          controller: 'homeController',
	          resolve: {
					'home' : ['$q',
						function ($q) {
						var customer = { 'name' : 'value'};

						return customer;
					}]
				}	
	        })
	}]);
});
