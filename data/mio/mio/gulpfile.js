var buffer = require('vinyl-buffer')
  , Browserify = require('browserify')
  , clean = require('gulp-clean')
  , coveralls = require('gulp-coveralls')
  , fs = require('fs')
  , gulp = require('gulp')
  , instrument = require('gulp-instrument')
  , jsdoc2md = require('jsdoc-to-markdown')
  , jshint = require('gulp-jshint')
  , mochaPhantomJS = require('gulp-mocha-phantomjs')
  , source = require('vinyl-source-stream')
  , stylish = require('jshint-stylish')
  , spawn = require('child_process').spawn;

gulp.task('coveralls', ['instrument'], function(done) {
  if (!process.env.COVERALLS_REPO_TOKEN) {
    return done(new Error("No COVERALLS_REPO_TOKEN set."));
  }

  process.env.JSCOV=1;

  var err = '';

  var mocha = spawn('node_modules/gulp-mocha-phantomjs/node_modules/mocha-phantomjs/node_modules/mocha/bin/mocha', [
    'test', '--reporter', 'mocha-lcov-reporter'
  ]);

  mocha.stderr.on('data', function(chunk) {
    err += chunk;
  });

  mocha.stdout
    .pipe(source('lcov.json'))
    .pipe(buffer())
    .pipe(coveralls());

  mocha.on('close', function(code) {
    if (code) {
      if (err) return done(new Error(err));

      return done(new Error(
        "Failed to send lcov data to coveralls."
      ));
    }

    done();
  });
});

gulp.task('coverage', ['instrument'], function() {
  process.env.JSCOV=1;

  return spawn('node_modules/gulp-mocha-phantomjs/node_modules/mocha-phantomjs/node_modules/mocha/bin/mocha', [
    'test', '--reporter', 'html-cov'
  ]).stdout
    .pipe(source('coverage.html'))
    .pipe(gulp.dest('./'));
});

gulp.task('instrument', function() {
  return gulp.src('lib/**.js')
    .pipe(instrument())
    .pipe(gulp.dest('lib-cov'));
});

gulp.task('wrap-umd', function() {
  var bundler = new Browserify({
    standalone: 'mio'
  });
  bundler.add('./lib/mio.js');
  bundler.exclude('./lib-cov/mio');
  return bundler.bundle()
    .pipe(source('mio.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist', ['wrap-umd', 'docs']);

gulp.task('docs', function(done) {
  jsdoc2md.render([
    'lib/mio.js',
    'lib/resource.js',
    'lib/query.js',
    'lib/collection.js'
  ], {
    template: './lib/API.md.hbs'
  })
  .on('error', done)
  .on('end', done)
  .pipe(fs.createWriteStream('docs/API.md'))
});

gulp.task('browserify-tests', function() {
  var bundler = new Browserify();
  bundler.add('./test/mio.js');
  bundler.exclude('../lib-cov/mio');
  return bundler.bundle()
    .pipe(source('tests.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', ['browserify-tests'], function () {
  return gulp.src('test/mio.html')
    .pipe(mochaPhantomJS({
      mocha: {
        timeout: 6000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      }
    }));
});

gulp.task('jshint', function () {
  return gulp.src(['lib/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('clean', function() {
  return gulp.src([
    'coverage.html',
    'lib-cov',
    'npm-debug.log',
    'dist/tests.js'
  ], {
    read: false
  })
  .pipe(clean());
});

gulp.task('watch', function () {
  gulp.watch(['lib/**/*.js', 'test/**/*.js'], ['jshint']);
});

gulp.task('default', ['jshint', 'test', 'watch']);
