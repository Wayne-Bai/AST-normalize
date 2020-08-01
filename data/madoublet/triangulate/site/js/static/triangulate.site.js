// triangulate app
// triangulate.controllers 	-> js/triangulate.controllers.js
// triangulate.factories 	-> js/triangulate.factories.js
// triangulate.directives	-> js/triangulate.directives.js
angular.module('triangulate.site', ['triangulate.site.controllers', 'triangulate.site.factories', 'triangulate.site.directives', 'jm.i18next'])

// disable header during development
.config(['$httpProvider', function($httpProvider) {
    //initialize get if not there
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};    
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';
}])

.config(function($i18nextProvider, $httpProvider) {

	// config $il8nextProvider
	$i18nextProvider.options = {
        lng: '{{language}}',
        useCookie: false,
        useLocalStorage: false,
        fallbackLng: 'en',
        resGetPath: 'locales/__lng__/__ns__.json'
    };

	// set authInterceptor
	$httpProvider.interceptors.push('authInterceptor');
  	
})

.run(function($rootScope, $i18next, $window, Site) {
	
	// get cart from sessionStorage
	if(sessionStorage['triangulate-cart'] != null){
		var str = sessionStorage['triangulate-cart'];

		$rootScope.cart = eval(str);
	}
	else{
		$rootScope.cart = [];
	}
	
	// init user
	$rootScope.user = null;
	
	// set user from session storage
	if($window.sessionStorage.user != null){
	
		var str = $window.sessionStorage.user;
		$rootScope.user = JSON.parse(str);
		
	}

	
});

