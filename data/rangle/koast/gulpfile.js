'use strict';

var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var rg = require('rangle-gulp');
var exec = require('child_process').exec;

rg.setLogLevel('info');

gulp.task('mocha', rg.mocha({
  files: 'lib/**/*.test.js',
  reporter: 'nyan'
}));

gulp.task('mocha-ci', rg.mocha({
  files: 'lib/**/*.test.js',
  reporter: 'spec'
}));


gulp.task('mocha-watch-run', rg.mocha({
  files: 'lib/**/*.test.js',
  reporter: 'nyan',
  errorHandler: function (err) {
    gulpUtil.log(err);
  }
}));

gulp.task('mocha-watch', function () {
  gulp.watch(['lib/**/*.js'], ['mocha-watch-run']);
});


gulp.task('lint', rg.jshint({
  files: [
    'lib/**/*.js',
    'index.js',
    'examples/basic-express/client/app/app.js',
    'examples/basic-express/client/app/**/*.js',
    'examples/basic-express/server/app.js',
    'examples/basic-express/server/**/*.js'
  ]
}));

gulp.task('beautify', rg.beautify({
  files: []
}));


var docGlobs = ['index.js',
  'lib/*.js', 'lib/**/*.js', 'lib/config-inspector/lib/**/*.js'
];

gulp.task('jsdoc', function () {
  var cmdHead = './node_modules/.bin/jsdoc -d docs/html';
  var cmd = docGlobs.reduceRight(function (x, y) {
    return x + ' ' + y;
  }, cmdHead);

  console.log(cmd);

  exec(cmd, function (err, stdout, stderr) {
    if (err !== null) {
      console.log(stderr);
    } else {
      console.log('Compiled JSDoc', stdout);
    }
  });
});

gulp.task('jsdoc-watch', function () {
  gulp.watch(docGlobs, ['jsdoc']);
});



gulp.task('dev', rg.nodemon({
  // workingDirectory: 'examples/basic-express/',
  script: 'examples/basic-express/server/app.js',
  onChange: ['lint'] // or ['lint', 'karma']
}));

gulp.task('test', ['mocha']);

gulp.task('test-dev', rg.mocha({
  files: 'lib/push-notifier/*.test.js',
  reporter: 'nyan'
}));

gulp.task('default', ['lint', 'mocha']);
