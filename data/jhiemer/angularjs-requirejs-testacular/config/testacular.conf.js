basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    REQUIRE,
    REQUIRE_ADAPTER,
    {pattern:'app/lib/angular/angular.js', included:false},
    {pattern:'app/lib/angular/angular-resource.js', included:false},
    {pattern:'app/lib/angular-ui/angular-ui-states.js', included:false},
    {pattern:'test/lib/angular/angular-mocks.js', included:false},
    {pattern:'app/js/**/*.js', included:false}, //Produktionscode
    {pattern:'test/unit/**/*.js', included:false}, //Testcode
    'test/main-test.js' //requireJS-Konfiguration
];

autoWatch = true;

browsers = ['Chrome'];

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
