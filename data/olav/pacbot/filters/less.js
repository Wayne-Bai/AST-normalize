var _ = require('underscore'),
    less = require('less'),
    fss = require('../lib/fss'),
    log = require('../lib/log'),
    filter = require('../lib/filter');

/*
 * Mime type.
 */
filter.set('mime', 'less', function () {
    return 'text/css';
});

/*
 * HTML tag.
 */
filter.set('tag', 'less', function (path) {
    return '<link rel="stylesheet" href="' + path + '">';
});

/*
 * Compile.
 */
filter.set('compile', 'less', function (file, data, locals, callback) {
    less.render(fss.readFile(file), {
        paths: [fss.directory(file)]
    }, function (err, output) {
        if (err) log('error', file, err.message);
        if (err) throw(err);
        callback(output.css);
    });
});

/*
 * Minify.
 */
filter.set('pack', 'less', function (files, callback) {
    less.render(fss.readAllFiles(files), {
        paths: _.map(files, fss.directory),
        compress: true
    }, function (err, output) {
        if (err) log('error', err.message);
        if (err) throw(err);
        callback(output.css);
    });
});

/*
 * Target file name.
 */
filter.set('target', 'less', function (file) {
    return file.replace(/\.less$/, '.css');
});
