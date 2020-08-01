module.exports = function(grunt) {

	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		assemble: {
			options: {
				layout: 'page.hbs',
				layoutdir: './source/assemble/templates/layouts/',
				partials: './source/assemble/templates/partials/**/*.hbs',
				helpers: './source/assemble/templates/helpers/**/*.js'
			},
			dev: {
				files: [
					{
						cwd: 'source/assemble/content/_pages/',
						dest: 'build/',
						expand: true,
						flatten: true,
						src: ['**/*.hbs']
					}
				]
			},
			dist: {
				files: [
					{
						cwd: 'source/assemble/content/_pages/',
						dest: 'dist/',
						expand: true,
						flatten: true,
						src: ['**/*.hbs']
					}
				]
			}
		},

		copy: {
			dev: {
				cwd: 'source/img/',
				dest: 'build/img/',
				expand: true,
				src: ['**/*']
			},
			dist: {
				cwd: 'source/img/',
				dest: 'dist/img/',
				expand: true,
				src: ['**/*']
			}
		},

		includes: {
			options: {
				duplicates: false,
				flatten: true,
				includeRegexp: /^\/\/\s*import\s+['"]?([^'"]+)['"]?\s*$/
			},
			dev: {
				files: [
					{
						cwd: 'source/js',
						dest: 'build/js',
						expand: true,
						ext: '.js',
						src: ['**/*.js']
					}
				]
			},
			dist: {
				files: [
					{
						cwd: 'source/js',
						dest: 'dist/js',
						expand: true,
						ext: '.js',
						src: ['**/*.js']
					}
				]
			}
		},

		compass: {
			options: {
				debugInfo: false,
				force: true,
				noLineComments: true,
				outputStyle: 'expanded',
				require: ['sass-globbing', 'compass/import-once', 'susy'],
				sassDir: 'source/sass/'
			},
			dev: {
				options: {
					cssDir: 'build/css/',
					sourcemap: true
				}
			},
			dist: {
				options: {
					cssDir: 'dist/css/',
					sourcemap: false
				}
			}
		},

		cssmin: {
			dist: {
				cwd: 'dist/css/',
				dest: 'dist/css/',
				expand: true,
				src: ['*.css']
			}
		},

		uglify: {
			my_target: {
				files: {
					'dist/js/main.js': ['dist/js/main.js'],
				}
			}
  		},

  		sync: {
			js: {
				files: [
					{
						cwd: 'source/js/',
						dest: 'build/js/',
						src: '**/*'
					}
				]
			}
		},

		watch: {
			options: {
				livereload: true
			},
			scss: {
				files: ['source/sass/**/*.scss'],
				tasks: ['compass']
			},
			js: {
				files: ['source/js/**/*.js'],
				tasks: ['includes:dev', 'sync']
			},
			templates: {
				files: ['source/assemble/**/*.{json,hbs}'],
				tasks: ['assemble:dev']
			}
		},

		connect: {
			server: {
				options: {
					port: 8000,
					base: './build/'
				}
			}
		}

	});

	grunt.loadNpmTasks('assemble');

	grunt.loadNpmTasks('grunt-sync');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-includes');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['build']);

	grunt.registerTask('build', [
		'newer:assemble:dev',
		'compass:dev',
		'includes:dev',
		'copy:dev',
		'connect',
		'sync',
		'watch'
	]);

	grunt.registerTask('dist', [
		'newer:assemble:dist',
		'compass:dist',
		'cssmin:dist',
		'includes:dist',
		'copy:dist',
		'uglify'
	]);

};