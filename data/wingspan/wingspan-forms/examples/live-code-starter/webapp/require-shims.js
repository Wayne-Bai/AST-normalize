/* global require */
(function () {
    'use strict';

    require.config({
        baseUrl: 'js',
        paths: {
            'underscore': '../lib/underscore',
            'underscore.string': '../lib/underscore.string',
            'jquery': '../lib/jquery',
            'kendo': '../lib/kendo-ui/js/kendo.web',
            'react': '../lib/react-with-addons',
            'jsx': '../lib/jsx',
            'JSXTransformer': '../lib/JSXTransformer',
            'wingspan-forms': '../lib/wingspan-forms/wingspan-forms'
        },
        shim: {
            'underscore': { deps: [], exports: '_' },
            'underscore.string': { exports: '_s' },
            'jquery': { deps: [], exports: '$' },
            'kendo': { deps: [], exports: 'kendo' },
            'react': { deps: [], exports: 'React' },
            'wingspan-forms': { deps: ['underscore', 'react', 'jquery', 'kendo'], exports: 'WingspanForms' }
        }
    });
})();
