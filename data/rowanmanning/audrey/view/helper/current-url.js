'use strict';

var hbs = require('express-hbs');

module.exports = initHelper;

function initHelper (app, register) {

    // Check whether a URL matches the current page
    register('is-current', function (context, opts) {
        if (!opts || !opts.data || !opts.data.root) {
            return;
        }
        var url = hbs.handlebars.compile(context)(opts.data.root);
        if (url === opts.data.root.urlPath) {
            return opts.fn();
        }
    });

}