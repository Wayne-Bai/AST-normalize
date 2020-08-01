require.config({
    baseUrl: '/scripts',
    paths: {
		'angular': '/bower_components/angular/angular',
		'angular-route': '/bower_components/angular-route/angular-route',
		'bootstrap': '../lib/bootstrap/js/bootstrap.min',
		'jquery': '/bower_components/jquery/dist/jquery'
    },
	shim: {
		'app': {
			deps: ['angular', 'angular-route', 'bootstrap']
		},
		'angular-route': {
			deps: ['angular']
		},
		'bootstrap': {
			deps: ['jquery']
		}
	}
});

require
(
    [
        'app'
    ],
    function(app)
    {
        angular.bootstrap(document, ['app']);
    }
);