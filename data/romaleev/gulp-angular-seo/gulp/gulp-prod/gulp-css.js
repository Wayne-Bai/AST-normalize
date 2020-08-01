'use strict';

var gulp = require('gulp'),
    $ = gulp.$,
    conf = gulp.config,
    task = conf.task;

gulp.task('css:vendor_init', function(cb) { // init empty vendor.css to prevent seo warning before it is generated
    var file = task.css.dist + '/' + task.css.vendor_file,
        end = function(){cb();};
    $.fs.open(file, 'r')
        .then(end)
        .catch(function(err) {
            $.mkdirp(task.css.dist)
                .then(function() {
                    return $.fs.writeFile(file, '');
                })
                .then(end);
        });
});

gulp.task('css:vendor', function() {//TODO add sourcemaps when uncss will be supported
    return gulp.src(task.css.vendor)
        .pipe($.concat(task.css.vendor_file))
        .pipe($.uncss(task.css.uncss))
        .pipe($.minifyCss())
        .pipe($.replace(/\@font-face\{.*?\}/g,'')) //font-face declaration cut
        .pipe(gulp.dest(task.css.dist));
});

gulp.task('css:user', function() {
    return gulp.src(task.css.user)
        .pipe($.sourcemaps.init())
        .pipe($.less())
        .pipe($.minifyCss())
        .pipe($.concat(task.css.user_file))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest(task.css.dist));
});

//TODO for generator
//    .pipe($.if('*.less', $.less()))
//    .pipe($.if('*.scss', $.sass()))
