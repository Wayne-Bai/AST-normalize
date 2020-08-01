var gulp      = require('gulp'),
    concat    = require('gulp-concat'),
    annotate  = require('gulp-ng-annotate'),
    uglify    = require('gulp-uglify'),
    rename    = require('gulp-rename'),
    insert    = require('gulp-insert'),
    sync      = require('run-sequence').use(gulp),
    vp        = require('vinyl-paths'),
    del       = require('del'),
    bump      = require('gulp-bump'),
    changelog = require('conventional-changelog'),
    fs        = require('fs'),
    yargs     = require('yargs');


var argv = yargs.argv,
    validBumpTypes = "major|minor|patch|prerelease".split("|"),
    Bump = (argv.bump || 'patch').toLowerCase();

if(validBumpTypes.indexOf(Bump) === -1) {
  throw new Error('Unrecognized bump "' + Bump + '".');
}

var args = { bump: Bump };

var paths = {
  source: ['src/**/*.js'],
  output: './dist'
};

gulp.task('del:change', function() {
  return gulp.src('./CHANGELOG.md')
    .pipe(vp(del));
});

gulp.task('clean', function(){
  return gulp.src(paths.output)
    .pipe(vp(del));
});

gulp.task('bump-version', function(){
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({type:args.bump })) //major|minor|patch|prerelease
    .pipe(gulp.dest('./'));
});

gulp.task('changelog', function(callback) {
  var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

  return changelog({
    repository: pkg.repository.url,
    version: pkg.version,
    file: './CHANGELOG.md',
    subtitle: argv.codename || ''
  }, function(err, log) {
    fs.writeFileSync('./CHANGELOG.md', log);
    callback();
  });
});

gulp.task('release', function(done){
  return sync(
    'build',
    'bump-version',
    'del:change',
    'changelog',
    done
  );
});

gulp.task('js', function(){
  var umd = 'if (typeof module !== \'undefined\' && typeof exports !== \'undefined\' && module.exports === exports){\n\
  module.exports = \'ngFx\';\n}\n';

  return gulp.src(paths.source)
    .pipe(concat('ngFx.js'))
    .pipe(annotate())
    .pipe(insert.prepend('(function(angular, TweenMax, TimelineMax){\n  \'use strict;\'\n'))
    .pipe(insert.append('}(angular, TweenMax, TimelineMax));\n'))
    .pipe(insert.prepend(umd))
    .pipe(gulp.dest(paths.output))
    .pipe(uglify())
    .pipe(rename('ngFx.min.js'))
    .pipe(gulp.dest(paths.output));
});

gulp.task('build', ['clean'], function(cb){
  sync('js', cb);
});

gulp.task('watch', ['build'], function(){
  gulp.watch(paths.source, ['build']);
});

gulp.task('default', ['watch']);




