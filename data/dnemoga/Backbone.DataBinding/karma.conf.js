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

            // Sources
            'src/backbone/model_binder.js',
            'src/backbone/collection_binder.js',

            // Fixtures
            'test/index.html',
            'test/window.js',

            // Tests
            'test/backbone/model_binder.test.js',
            'test/backbone/collection_binder.test.js'
        ],

        preprocessors: {
            'src/**/*.js': ['coverage'],
            'test/**/*.html': ['html2js']
        },

        reporters: ['progress', 'coverage'],

        coverageReporter: {
            type: 'html',
            dir: 'coverage'
        },

        reportSlowerThan: 75,

        browsers: ['Firefox', 'PhantomJS'],

        autoWatch: true
    });
};
