require({
	paths: {
		domReady : '../lib/require/domReady',
		angular : '../lib/angular/angular',
		resource : '../lib/angular/angular-resource',
		states : '../lib/angular-ui/angular-ui-states'
    },
	shim: {
		'angular' : {'exports' : 'angular'},
		'states' : {'deps':['angular'],'exports':'states'}
	},
	priority: [
		'angular'
	],
	urlArgs: 'v=0.1'
}, ['app', 'routes', 'bootstrap', 'services/services', 'directives/directives', 'providers/providers',
	'filters/filters', 'controllers/controllers'], function (app) {
		app.run(['$rootScope', '$state', '$stateParams',
			function ($rootScope, $state, $stateParams) {
				$rootScope.$state = $state;
        		$rootScope.$stateParams = $stateParams;
				console.log('State', $state);
				console.log('StateParams', $stateParams);
		}]);
	});

