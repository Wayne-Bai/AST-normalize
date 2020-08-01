'use strict';

var app = angular.module('app', ['ui.router', 'ui.bootstrap', 'appControllers', 'appServices', 'appDirectives', 'appFilters']);
var appControllers = angular.module('appControllers', []);
var appServices = angular.module('appServices', []);
var appDirectives = angular.module('appDirectives', []);
var appFilters = angular.module('appFilters', []);

app.constant('Options', {baseUrl: 'http://localhost:3009'});

app.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider
		.otherwise('/home');

	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: 'partials/home.html',
			controller: 'HomeCtrl'
		})
		.state('sheets', {
			abstract: true,
			url: '/sheets/:id',
			templateUrl: 'partials/sheets.html',
			controller: 'SheetsCtrl'
		})
			.state('sheets.overview', {
				url: '/',
				templateUrl: 'partials/sheets.overview.html'
			})
			.state('sheets.edit', {
				url: '/edit',
				templateUrl: 'partials/sheets.edit.html'
			})
			.state('sheets.friends', {
				url: '/friends',
				templateUrl: 'partials/sheets.friends.html'
			})
			.state('sheets.expenses', {
				url: '/expenses',
				templateUrl: 'partials/sheets.expenses.html'
			})
			.state('sheets.expenses.create', {
				url: '/create',
				templateUrl: 'partials/sheets.expenses.create.html'
			})
});