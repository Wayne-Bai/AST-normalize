// Copyright (C) 2014 IceMobile Agency B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = function (grunt) {
	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: './.jshintrc'
			},
			files: ['lib/**/*.js']
		},

		jasmine_node: {
			specFolders: ['./spec'],
			coverage: {
				savePath: './build/reports/coverage/',
				print: 'both', //options: detail, both, none
				excludes: [
					'spec/**'
				]
			},
			options: {
				forceExit: true,
				match: '.',
				matchall: true,
				extensions: 'js',
				specNameMatcher: 'spec',
				junitreport: {
					report: true,
					savePath : "./build/reports/jasmine/",
					useDotNotation: true,
					consolidate: true
				}
			}
		},

		watch: {
			css: {
				files: ['lib/**/*.js'],
				tasks: ['jshint', 'jasmine_node' ]
			}
		},

		jsduck: {
			main: {
				src: ['lib/**/*.js'],
				dest: 'docs',
				options: {
					external: ['Promise', 'jQuery']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jasmine-node-coverage');
	grunt.loadNpmTasks('grunt-jsduck');
	grunt.loadNpmTasks('grunt-exec');

	grunt.registerTask('test', ['jasmine_node']);
	grunt.registerTask('build', ['test']);
	grunt.registerTask('check', ['jshint', 'jsduck', 'test']);
	grunt.registerTask('docs', ['jsduck']);
};
