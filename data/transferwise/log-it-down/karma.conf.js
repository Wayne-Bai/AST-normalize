module.exports = function(config) {
	'use strict';

	config.set({
		basePath: '',
		frameworks: ['jasmine'],
		files: [
			'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.3/angular.js',
			'https://ajax.googleapis.com/ajax/libs/angularjs/1.3.3/angular-mocks.js',
			'src/logItDown.js',
			'test/logItDownSpec.js'
		],
		plugins: [
			'karma-phantomjs-launcher',
			'karma-jasmine',
			'karma-junit-reporter',
			'karma-coverage'
		],
		reporters: ['progress', 'junit', 'coverage'],
		junitReporter: {
			outputFile: 'log/karma-results.xml',
			suite: 'unit'
		},
		coverageReporter: {
			type: 'lcov',
			dir: 'log/coverage/'
		},
		preprocessors: {
			'**/src/*.js': 'coverage'
		},
		port: 9876,
		autoWatch: false,
		browsers: ['PhantomJS'],
		singleRun: true,
		colors: true,
		logLevel: config.LOG_INFO
	});
};
