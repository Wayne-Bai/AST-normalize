module.exports = function(grunt) {

	// load all grunt tasks matching the `grunt-*` pattern
	require('load-grunt-tasks')(grunt);


	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		'bower-install': {

			target: {

				// Point to the html file that should be updated
				// when you run `grunt bower-install`
				html: 'index.html',
				// html: 'app/index.html',

				// Optional:

				// If your file paths shouldn't contain a certain
				// portion of a url, it can be excluded
				// ignorePath: 'app/',

				// Customize how your stylesheets are included on
				// your page.
				//
				//   default: '<link rel="stylesheet" href="{{filePath}}" />'
				cssPattern: '<link href="{{filePath}}" rel="stylesheet">',

				// Customize how your <script>s are included into
				// your HTML file.
				//
				//   default: '<script src="{{filePath}}"></script>'
				jsPattern: '<script type="text/javascript" src="{{filePath}}"></script>'
			}
		}
	});

	// Default task(s).
	grunt.registerTask('default', ['bower-install']);

};