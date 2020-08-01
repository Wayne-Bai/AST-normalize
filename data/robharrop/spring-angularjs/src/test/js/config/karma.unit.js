basePath = '../../../../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    './src/main/webapp/js/angular.js',
    './src/main/webapp/js/angular-resource.js',
    './src/main/webapp/js/app.js',
    './src/test/js/lib/**/*.js',
    './src/test/js/unit/**/*.js'
];

browsers = ['Chrome'];
reporters = ['progress', 'growl'];

autoWatch = true;
singleRun = false;