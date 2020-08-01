'use strict';

var gulp = require('gulp'),
    $ = gulp.$,
    conf = gulp.config,
    task = conf.task;

gulp.task('html', function() {
    var assets = $.useref.assets();
    return gulp.src(task.html.index)
        .pipe($.jade({
            pretty: true
        }))
        .pipe($.useref())
        .pipe(gulp.dest(task.common.dist));
});
