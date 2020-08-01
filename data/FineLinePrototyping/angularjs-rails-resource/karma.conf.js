module.exports = function(config) {
  config.set({
    basePath: '.',
    autoWatch: true,
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    reporters: ['progress', 'junit'],
    files: [
      'test/lib/angular/angular.js',
      'test/lib/angular/angular-bootstrap.js',
      'test/lib/angular/angular-loader.js',
      'test/lib/angular/angular-sanitize.js',
      'test/lib/angular/angular-mocks.js',
      'vendor/assets/javascripts/angularjs/rails/resource/index.js',
      'vendor/assets/javascripts/angularjs/rails/resource/**/*.js',
      'test/unit/**/*.js'
    ],
    junitReporter: {
        outputFile: 'test_out/unit.xml',
        suite: 'unit'
    }
  })
};