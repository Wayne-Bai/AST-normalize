module.exports = function (config) {
    'use strict';

    config.set({
        frameworks: ['mocha'],

        files: [
            // Assertion Libraries
            'lib/chai/chai.js',
            'lib/sinon/sinon.js',
            'lib/sinon/sinon.chai.js',

            // Libraries
            'lib/jquery/jquery.js',
            'lib/underscore/underscore.js',
            'lib/backbone/backbone.js',
            'lib/globalize/globalize.js',

            // Sources
            'src/backbone/schema.js',

            // Tests
            'test/backbone/schema.test.js'
        ],

        preprocessors: {
            'src/**/*.js': ['coverage']
        },

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'coverage_reports'
        },

        reportSlowerThan: 75,

        browsers: ['Firefox', 'PhantomJS'],

        autoWatch: true
    });
};
