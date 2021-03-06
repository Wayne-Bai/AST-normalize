// Karma configuration
// Generated on Fri Sep 19 2014 15:01:24 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon'],


    // list of files / patterns to load in the browser
    files: [
      // angular source
      'client/lib/angular/angular.js',
      'client/lib/angular-route/angular-route.js',
      'client/lib/angular-mocks/angular-mocks.js',
      'client/lib/angular-ui-router/release/angular-ui-router.js',
      'client/lib/ngFx/dist/ngFx.min.js',
      'client/lib/d3/d3.min.js',
      'client/lib/nvd3/nv.d3.min.js',
      'client/lib/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.min.js',

      // our app code
      'client/receive/*.js',
      'client/send/*.js',
      'client/btclib/*.js',
      'client/header/*.js',
      'client/history/*.js',
      'client/market/*.js',
      'client/viewTabs/*.js',
      'client/app.js',
      'client/utils/*.js',

      // our spec files
      'node_modules/expect.js/index.js',
      'spec/**/*.js'
    ],


    // list of files to exclude
    exclude: ['karma.conf.js'],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['nyan', 'unicorn'],


    // web server port
    port: 8080,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
