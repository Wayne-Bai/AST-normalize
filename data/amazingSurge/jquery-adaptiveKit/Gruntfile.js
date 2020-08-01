'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %>\n' + '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' + ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		clean: {
			files: ['dist']
		},
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: ['src/<%= pkg.name %>.js'],
				dest: 'dist/<%= pkg.name %>.js'
			},
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: 'dist/<%= pkg.name %>.min.js'
			},
		},
		jshint: {
			gruntfile: {
				options: {
					jshintrc: '.jshintrc'
				},
				src: 'Gruntfile.js'
			},
			src: {
				options: {
					jshintrc: 'src/.jshintrc'
				},
				src: ['src/**/*.js']
			}
		},
		watch: {
			gruntfile: {
				files: '<%= jshint.gruntfile.src %>',
				tasks: ['jshint:gruntfile']
			},
			src: {
				files: '<%= jshint.src.src %>',
				tasks: ['jshint:src']
			}
		},
		replace: {
			bower: {
				src: ['bower.json'],
				overwrite: true, // overwrite matched source files
				replacements: [{
					from: /("version": ")([0-9\.]+)(")/g,
					to: "$1<%= pkg.version %>$3"
				}]
			},
			jquery: {
				src: ['adaptiveKit.jquery.json'],
				overwrite: true, // overwrite matched source files
				replacements: [{
					from: /("version": ")([0-9\.]+)(")/g,
					to: "$1<%= pkg.version %>$3"
				}]
			},
		},
		jsbeautifier: {
			files: ["src/**/*.js", 'Gruntfile.js'],
			options: {
				indent_size: 1,
				indent_char: "	",
				indent_level: 0,
				indent_with_tabs: true,
				preserve_newlines: true,
				max_preserve_newlines: 10,
				jslint_happy: false,
				brace_style: "collapse",
				keep_array_indentation: false,
				keep_function_indentation: false,
				space_before_conditional: true,
				eval_code: false,
				indent_case: false,
				wrap_line_length: 150,
				unescape_strings: false
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-jsbeautifier');

	// Default task.
	grunt.registerTask('default', ['jshint', 'jsbeautifier', 'clean', 'concat', 'uglify']);

	grunt.registerTask('js', ['jsbeautifier']);

	grunt.registerTask('version', [
		'replace:bower',
		'replace:jquery'
	]);

};
