var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');

var paths = {
  sass: ['./scss/**/*.scss'],
  modules: ['./www/js/**/*.js','./www/js/**/*.html'],
};

gulp.task('default', ['sass','retalapp']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.modules, ['retalapp']);
});

gulp.task('retalapp', function() {
  // place code for your default task here
  var fs = require('fs');
  var files = fs.readdirSync('./www/js');
  var contentRoutes = '';
  var contentMenu = '';
  var contentIndex = '';

  var appFile = fs.readFileSync('./www/js/app.raw.js', 'utf8');
  var menuFile = fs.readFileSync('./www/menu.raw.html', 'utf8');
  var indexFile = fs.readFileSync('./www/index.raw.html', 'utf8');

  for (i = 0; i < files.length; i++) {

    // @TODO
    // Make a file retalapp.json for config and send params
    // And can install through bower
    gutil.log('retalapp', gutil.colors.cyan(files[i]));
    var existsRoutes = fs.existsSync('./www/js/'+files[i]+'/routes.js');
    if(existsRoutes){
        var data = fs.readFileSync('./www/js/'+files[i]+'/routes.js', 'utf8');
        contentRoutes+=data;
    }
    var existsMenu = fs.existsSync('./www/js/'+files[i]+'/menu.html');
    if(existsMenu){
      var menu = fs.readFileSync('./www/js/'+files[i]+'/menu.html', 'utf8');
      contentMenu+=menu;
    }
    var existsIndex = fs.existsSync('./www/js/'+files[i]+'/index.html');
    if(existsIndex){
      var index = fs.readFileSync('./www/js/'+files[i]+'/index.html', 'utf8');
      contentIndex+=index;
    }

  }

  fs.writeFileSync('./www/js/app.js',appFile.replace('/*ROUTES*/',contentRoutes));
  fs.writeFileSync('./www/menu.html',menuFile.replace('<!--MENU-->',contentMenu));
  fs.writeFileSync('./www/index.html',indexFile.replace('<!--INDEX-->',contentIndex));
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
