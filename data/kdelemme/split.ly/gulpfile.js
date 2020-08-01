var gulp = require('gulp');
var concat = require('gulp-concat');
var less = require('gulp-less');

var paths = {
    scripts: ['app/js/app.js', 
		    'app/js/controllers/*.js', 
		    'app/js/directives/*.js', 
		    'app/js/filters/*.js', 
		    'app/js/services/*.js'],
	styles: ['app/css/less/*.less']
};

gulp.task('scripts', function() {
    return gulp.src(paths.scripts)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('app/dist/js'));
});

gulp.task('styles', function() {
	return gulp.src(paths.styles)
		.pipe(less())
		.pipe(gulp.dest('app/dist/css'));
})

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['scripts', 'styles']); 
