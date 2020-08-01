'use strict';

var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var rg = require('rangle-gulp');
var exec = require('child_process').exec;

rg.setLogLevel('info');

gulp.task('mocha', rg.mocha({
  files: 'server/**/*.test.js',
  reporter: 'nyan'
}));

gulp.task('mocha-watch-run', rg.mocha({
  files: 'server/**/*.test.js',
  reporter: 'nyan',
  errorHandler: function (err) {
    gulpUtil.log(err);
  }
}));

gulp.task('mocha-watch', function () {
  gulp.watch(['server/**/*.js'], ['mocha-watch-run']);
});

gulp.task('karma', rg.karma({
  vendor: [
    'client/bower_components/angular/angular.js',
    'client/bower_components/angular-mocks/angular-mocks.js'
  ], showStack: true
}));


gulp.task('dev', rg.nodemon({
  // workingDirectory: 'examples/basic-express/',
  script: 'server/app.js',
  onChange: [] // or ['lint', 'karma']
}));

gulp.task('test', ['mocha']);

gulp.task('default', ['lint', 'mocha']);
