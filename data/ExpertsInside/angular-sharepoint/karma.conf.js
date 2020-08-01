// Karma configuration
// Generated on Mon Feb 17 2014 15:49:12 GMT+0100 (CET)

module.exports = function(config) {
  'use strict';

  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '',


    // frameworks to use
    frameworks: ['mocha', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'test/components/angular/angular.js',
      'test/components/angular-mocks/angular-mocks.js',
      'test/components/ShareCoffee/dist/ShareCoffee.js',
      'test/components/ShareCoffee.Search/dist/ShareCoffee.Search.js',
      'test/components/ShareCoffee.UserProfiles/dist/ShareCoffee.UserProfiles.js',
      'src/sharepoint.js',
      'src/**/*.js',
      'test/mocks/**/*_mock.js',
      'test/spec/**/*_spec.js'
    ],

    // list of files to exclude
    exclude: [
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


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
