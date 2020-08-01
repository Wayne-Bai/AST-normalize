angular.module('app').filter('interpolate', function interpolate($version) {
	return function(text) {
		return String(text).replace(/\%VERSION\%/mg, $version);
	};
});
