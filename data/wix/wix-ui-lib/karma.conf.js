// Karma configuration
// Generated on Sat Nov 16 2013 20:51:19 GMT+0300 (IDT)

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',


        // frameworks to use
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'components/**/*.css',
            'stylesheets/buttons.css',
            'stylesheets/common.css',
            'stylesheets/settings.css',
            'stylesheets/header.css',

            'components/Radio/radio.css',
            'components/Checkbox/checkbox.css',
            'components/Accordion/accordion.css',
            'components/Dropdown/dropdown.css',
            'components/Popup/popup.css',
            'components/Input/input.css',
            'components/Spinner/spinner.css',

            'components/ColorPicker/ColorPicker.css',
            'components/Slider/slider.css',
            'components/FixedPositionControl/FixedPositionControl.css',

            'http://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js',
            'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min.js',
            'http://sslstatic.wix.com/services/js-sdk/1.28.0/js/Wix.js',

            'tests/mocks/sdk/**.js',
            'tests/addons/**.js',

            'core/definePlugin.js',
            'core/ColorPickerCore.js',
            'core/core.js',
            'components/**/*.js',


            'tests/mocks/*.js',

            'tests/**Spec.js'
        ],


        // list of files to exclude
        exclude: [],


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
        browsers: ['Chrome'],


        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-phantomjs-launcher'
        ],


        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
