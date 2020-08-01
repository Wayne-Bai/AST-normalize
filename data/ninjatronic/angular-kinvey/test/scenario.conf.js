module.exports = function(config) {
    config.set({
        singleRun: true,
        basePath: '../',
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        plugins: ['karma-jasmine', 'karma-phantomjs-launcher'],
        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-base64/angular-base64.js',
            'bower_components/ngstorage/ngStorage.js',

            'kinvey.js',

            'test/scenario/**/*.js'
        ]
    });
};
