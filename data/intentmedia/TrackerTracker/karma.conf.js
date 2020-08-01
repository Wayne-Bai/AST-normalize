// Karma configuration
// Generated on Mon Dec 24 2012 11:42:55 GMT-0500 (EST)


// base path, that will be used to resolve files and exclude
basePath = './';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'app/public/js/bundle/lib.js',
  'app/public/js/bundle/hoganTemplates.js',
  'app/public/js/tt.*.js',
  'test/beforeEach.js',
  'test/**/*.spec.coffee'
];


// list of files to exclude
exclude = [
];


preprocessors = {
  '**/*.coffee': 'coffee'
};


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];


// web server port
port = 8080;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = false;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 5000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;

