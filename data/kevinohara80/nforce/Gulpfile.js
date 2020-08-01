var gulp    = require('gulp');
var seq     = require('run-sequence');
var jshint  = require('gulp-jshint');
var stylish = require('jshint-stylish');
var spawn   = require('child_process').spawn;

var files = {
  js: [
    './*.js',
    './lib/*.js',
    './test/*.js',
    './examples/*.js'
  ]
};

// run jshint tasks across all js files
gulp.task('lint', function() {
  return gulp.src(files.js)
  .pipe(jshint())
  .pipe(jshint.reporter(stylish));
});

// run mocha tests
gulp.task('test', function(cb) {

  var test = spawn('npm', [ 'test' ], { stdio: 'inherit' });

  test.on('close', function(code) {
    if(code !== 0) {
      return cb(new Error('mocha test failures'));
    }
    cb();
  });
});

// set up a file watcher and run jshint
gulp.task('watch', function() {
  gulp.watch(files.js, ['lint']);
});

// default task
gulp.task('default', function(cb) {
  seq('lint', 'test', cb);
});
