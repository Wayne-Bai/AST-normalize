module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		less: {
			compile: {
				files: {
					"css/style.css": "less/index.less"
				}
			}
		},
		cssmin: {
		  minify: {
		    expand: true,
		    cwd: 'css/',
		    src: ['*.css', '!*.min.css'],
		    dest: 'css/',
		    ext: '.min.css'
		  }
		},
		 watch: {
			scripts: {
			  files: ['less/**/*.less'],
			  tasks: ["less","cssmin"],
			  options: {
			    spawn: false,
			  },
			},
		},
	});

	grunt.loadNpmTasks("grunt-contrib-less");
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask("default",["less","cssmin","watch"]);
}