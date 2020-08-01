module.exports = function(config) {
    config.set({
        singleRun: true,
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        plugins: ['karma-jasmine', 'karma-phantomjs-launcher'],
        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'ngGeolocation.min.js',
            'ngGeolocation.test.js'
        ]
    });
};