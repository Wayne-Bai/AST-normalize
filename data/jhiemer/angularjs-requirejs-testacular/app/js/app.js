define(['angular', 'states', 'services/services', 'directives/directives', 'providers/providers',
	'filters/filters', 'controllers/controllers'], function (angular) {
	'use strict';
	
	return angular.module('myApp', [
		'ui.compat',
		'services',
		'directives',
		'providers',
		'filters',
		'controllers'
	]).config(function($httpProvider) {  				
  		$httpProvider.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8';
  		$httpProvider.defaults.headers.common['Accept'] = 'application/json;charset=UTF-8';  		
	}).constant('REST_HOST', 'http://localhost:8080\:8080/web');
});
