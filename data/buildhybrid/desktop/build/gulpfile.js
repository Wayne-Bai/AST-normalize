var gulp  = require('gulp'),
    shell = require('gulp-shell'),
    runSequence = require('run-sequence'),
    rename = require("gulp-rename"),
    del = require('del'),
    open = require("gulp-open");

/*
 * Setup
 */
gulp.task('setup', shell.task([
  'rm -rf ../app/.meteor/local/mac-build',
  'mkdir -p ../app/.meteor/local/mac-build',
  'cp -r ../submodules/MacGap2/M* ../app/.meteor/local/mac-build',
  'cp ../app/resources/icons/mac/* ../app/.meteor/local/mac-build/MacGap/Images.xcassets/AppIcon.appiconset',
  'cp Contents.json ../app/.meteor/local/mac-build/MacGap/Images.xcassets/AppIcon.appiconset'
]));


/*
 * Build
 */
gulp.task('build', shell.task([
  'cd ../app && meteor build .meteor/local/build-mac-temp --directory --server=http://localhost:3005'
]))

/*
 * Copy
 */
gulp.task('copy', function() {
  console.log("Copying build...");

  gulp.src('../app/.meteor/local/build-mac-temp/bundle/programs/web.browser/*.css')
    .pipe(rename("meteor-client.css"))
    .pipe(gulp.dest('../app/.meteor/local/mac-build/public/'))

  gulp.src('../app/.meteor/local/build-mac-temp/bundle/programs/web.browser/*.js')
    .pipe(rename("meteor-client.js"))
    .pipe(gulp.dest('../app/.meteor/local/mac-build/public/'))

  gulp.src('../app/mac-config.json')
    .pipe(rename("config.json"))
    .pipe(gulp.dest('../app/.meteor/local/mac-build/public/'))

  gulp.src('index.html')
    .pipe(gulp.dest('../app/.meteor/local/mac-build/public/'))

  gulp.src('meteor-config.js')
    .pipe(gulp.dest('../app/.meteor/local/mac-build/public/'))
})

/*
 * Clean
 */
gulp.task('clean', shell.task([
  'rm -rf ../app/.meteor/local/build-mac-temp'
]));

/*
 * Open
 */
gulp.task('open', shell.task([
  'open ../app/.meteor/local/mac-build/*.xcodeproj'
]));

/*
 * Watch Meteor
 */
gulp.task('watch-meteor', function() {
  console.log("Watching for Meteor app changes...");
  var watcher = gulp.watch('../app/client/*', ['rerun']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
})

gulp.task('rerun', function() {
    runSequence('clean', 'build', 'copy')
})

gulp.task('default', function() {
    runSequence('setup', 'build', 'copy', 'clean', 'open')
})