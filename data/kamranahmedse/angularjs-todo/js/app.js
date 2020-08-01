'use strict';
var app = angular.module('toodloo', []);

app.config(function ($routeProvider) {
	$routeProvider
		.when('/', {
			redirectTo : '/project/inbox'
		})
		.when('/archive', {
			templateUrl: 'partials/agenda-part.php',
			controller: 'ArchiveCtrl'
		})
		.when('/project/:slug', {
			templateUrl: 'partials/plaintasks-part.php',
			controller: 'ProjectCtrl',
			resolve : {
				projectDetail : ProjectCtrl.loadProject
			}
		})
		.when('/agenda/:slug', {
			templateUrl: 'partials/agenda-part.php',
			controller: 'AgendaCtrl'
		})
		.otherwise({ 
			redirectTo: '/' 
		});
});