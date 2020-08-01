/*global $script:true, Modernizr:true */

// alternative - http://www.pinlady.net/PluginDetect/IE/
// IE version, undefined if not IE. Used for HTML5 polyfills.
var IE = /*@cc_on!@*/!1;
if (IE) {
	IE = parseFloat((/MSIE[\s]*([\d\.]+)/).exec(navigator.appVersion)[1]);
	// Check if chromeframe, reset IE var if so
	if(IE < 10 && (/chromeframe/).test(navigator.appVersion)) { IE = 0; }
}

//(function() {
console.group('Async Load');

//-- Error Detection and Tracking --//
// http://errorception.com
var _errs=['5113b3e6bedd207c2b000400'];
$script('//d15qhc0lu1ghnk.cloudfront.net/beacon.js');

// Google Analytics
/*
var _gaq=[
  ['_setAccount','UA-XXXXXX-X'],
  //['_setDomainName', '.angulario.com'],
  ['_trackPageview'],['_trackPageLoadTime']
];
$script('//google-analytics.com/ga.js');
*/

// KISSmetrics
/*
var _kmq = _kmq || [];
var _kmk = _kmk || 'foo';
$script('//i.kissmetrics.com/i.js');
$script('//doug1izaerwt3.cloudfront.net/' + _kmk + '.1.js');
*/

// CDN
var cdnHttp = '//cdnjs.cloudflare.com/ajax/libs/', // only use one cdn to minimize DNS latency
	cdnSrc = {
		Modernizr:	cdnHttp+'modernizr/2.6.2/modernizr.min.js'//,
		// HTML5 Polyfills - https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-browser-Polyfills
		//JSON3:		cdnHttp+'json3/3.2.4/json3.min.js'//, // add for IE 6-7 (place in html)
		// localStorage IE 6-7
		// HTML5 Sectioning Elements
		//html5shiv:	cdnHttp+'html5shiv/3.6.2/html5shiv.js',	// IE 6-9 - https://github.com/aFarkas/html5shiv
		//'html5shiv-print':	cdnHttp+'html5shiv/3.6.2/html5shiv-printshiv.js' // IE 6-8
	},
	cdnDir = 'js/vendor/',
	cdnFallbackSrc = {
		Modernizr:	cdnDir+'modernizr.min.js'
	//,   JSON3:cdnDir+'json3.min.js' // loaded into fallback loop
	//,	html5shiv:cdnDir+'html5shiv.min.js'
	//,	'html5shiv-print':cdnDir+'html5shiv-print.min.js',
	},
	fallbackCount = 0,
	fallbackArray = [];

// Dependency of bootstrap()
function checkTypeOf(obj_list) {
	var i = obj_list.length,
		j,l,			// for loop
		obj_parts = [],	// used to build nested ref '$.fn.button' -> window['$']['fn']['button']
		obj = {},		// temp obj for building nested ref
		win = window;	// set local ref for speed
	while (i--) {
		obj_parts = obj_list[i].split('.');
		obj = win;
		for (j = 0, l = obj_parts.length; j !== l; j++) {
			obj = obj[obj_parts[j]];
			//console.log('Check '+obj_parts[j]);
			//console.log(obj);
			if (typeof obj === 'undefined') {
				//console.log('FAILED '+obj_parts[j]);
				return 0;
			} //else { console.log('PASSED '+obj_parts[j]); }
		}
	}
	return 1;
}

// Dependency of bootstrap()
function hasModule(moduleName) {
  try {
	return angular.module(moduleName);
  } catch (e) {
	return 0;
  }
}

function bootstrap() {
	//console.log('bootstrap');
	if (checkTypeOf([
			'JSON',				// JSON3 for IE 6-7
			//'html',			// html5shiv
			'Modernizr',
			//'$.fn.dropdown',	// Bootstrap (fn.dropdown)
			//'jQuery',			// jQuery
			'angular'			// Angular
		]) &&
		hasModule('app') &&		// Angular 'app' Ready
		!fallbackCount			// Fallback Bool
		) {
			console.log('Angular Bootstrapping Now');
			console.groupEnd();
			angular.bootstrap(document, ['app']);
	}
}

function countFallback() {
	console.log('countFallback '+fallbackCount);
	fallbackCount--;
	if (!fallbackCount) {
		bootstrap();
	
	}
}

function modernizrFallback(id) {//, parent) {
	for (var i in id) {
		if (typeof id[i] === 'object') {
			console.group(i);
			modernizrFallback(id[i]);//, i);
		} else if (typeof id[i] === 'boolean' && !id[i]) {
			console.log(''+i+'.fallback');
			//i = (parent) ? parent+'-'+i : i;
			//fallbackArray.push(i);
			fallbackCount++;
			$script('js/fallback/'+i+'.min.js', i, countFallback, countFallback);
		} else {
			console.log(''+i+'.included');
		}
	}
	console.groupEnd();
}

function cdnFallback(depsNotFound) {
	var i = depsNotFound.length;
	while (i--) {
		console.log('cdnFallback '+depsNotFound[i]);
		$script(cdnFallbackSrc[depsNotFound[i]], depsNotFound[i]);
	}
}

// js Frameworks & Libraries
$script(cdnSrc.Modernizr, 'Modernizr', function() {
	console.log('Modernizr ready');
	bootstrap();
}, cdnFallback);

/*
$script(cdnSrc.jQuery, 'jQuery', function() {
	console.log('jQuery ready');
	$script(cdnSrc.Bootstrap, 'Bootstrap', function() {
		console.log('Twitter Bootstrap ready');
		bootstrap();
	}, cdnFallback);
}, cdnFallback);
*/

$script(cdnSrc.Angular, 'Angular', function() {
	console.log('Angular ready');
	var locale = JSON.parse(localStorage.getItem('locale'));
	if (locale) {
		$script(cdnDir+'i18n/angular-locale_'+locale+'.js', function() {
			console.log('Angular.ngLocale ready');
			//angular.module('ngLocal.us', [])._invokeQueue.push(angular.module('ngLocale')._invokeQueue[0]);
			bootstrap();
		});
	}
	// App Files
	$script('js/app.min.js', 'App', function(){
		console.log('App ready');
		bootstrap();
	});
}, cdnFallback);

// Polyfills - detect with Modernizr, lazy load Angular modules
// Tests: http://modernizr.github.com/Modernizr/test/
$script.ready(['Modernizr', 'Angular', 'App'], function() {
	console.group('Modernizr Fallback');
	//$script('js/fallback/placeholder.min.js');
	console.log(Modernizr);
	modernizrFallback(Modernizr);
	// Ensure all fallback have had a chance to load before bootstrapping
	/*fallbackCount = fallbackArray.length;
	var i = fallbackCount;
	while(i--) {
		$script.ready(fallbackArray[i], function() {
			console.log('Fallback Success');
			console.log();
			fallbackCount--;
			if (!fallbackCount) {
				bootstrap();
			}
		}, function(depsNotFound) { // causes issues in IE8
			console.log('Fallback Failed');
			console.log(depsNotFound);
			fallbackCount--;
			if (!fallbackCount) {
				bootstrap();
			}
		});
	}*/
	
	
});


//}());
