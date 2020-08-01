var path = require('path');

/* jshint node:true */
module.exports = function (config) {
    config.set({
        // frameworks to use
        frameworks: ['mocha', 'chai', 'sinon-chai', 'chai-as-promised'],

        // list of files to exclude
        exclude: [
            'src/*/*.page.js',
            'src/*/*.exercise.js',
        ],

        preprocessors: {
            'src/**/*.html': 'ng-html2js',
            'src/*/!(*.spec).js': ['coverage']
        },

        ngHtml2JsPreprocessor: {
            // or define a custom transform function
            cacheIdFromPath: function (filepath) {
                // convert src to array
                var templatePath = filepath.split(path.sep);

                // remove the first two directories ('src/*/')
                templatePath.shift();
                templatePath.shift();

                return templatePath.join(path.sep);
            },
        },

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['progress', 'coverage'],

        coverageReporter: {
            reporters: [
                {
                    type: 'html',
                    dir: 'coverage/'
                }, {
                    type: 'lcov',
                    dir: 'coverage/'
                }
            ]
        },

        // web server port
        port: 9877,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values:
        //  config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
