var marked = require('marked'),
    config = require('../lib/config'),
    fss = require('../lib/fss'),
    filter = require('../lib/filter');

/*
 * Mime type.
 */
filter.set('mime', 'md', function () {
    return 'text/html';
});

/*
 * Compile.
 */
filter.set('compile', 'md', function (file, data, locals, callback) {
    if (config.marked) marked.setOptions(config.marked);
    return marked(fss.readFile(file));
});

/*
 * Target file name.
 */
filter.set('target', 'md', function (file) {
    return file.replace(/\.md$/, '.html');
});
