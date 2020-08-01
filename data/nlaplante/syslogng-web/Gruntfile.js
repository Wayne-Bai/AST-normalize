module.exports = function (grunt) {
	
	grunt.initConfig({
		jshint: {
			all: ['Gruntfile.js', 'app.js', 'routes/**/*.js', 'public/javascript/**/*.js']
		},
		git_log_json: {
			options: {
				dest: 'changelog.json',
				shortHash: true
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-git-log-json');
	
	
	grunt.registerTask('default', ['jshint']);
};
