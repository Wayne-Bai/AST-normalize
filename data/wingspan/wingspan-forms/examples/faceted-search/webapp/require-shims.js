/* global require */
(function () {
    'use strict';

    require.config({
        baseUrl: 'js-built',
        paths: {
            'underscore': '../lib/underscore',
            'underscore.string': '../lib/underscore.string',
            'jquery': '../lib/jquery',
            'kendo': '../lib/kendo-ui/js/kendo.web',
            'react': '../lib/react-with-addons',
            'text': '../lib/text',
            'q': '../lib/q',
            'wingspan-forms': '../lib/wingspan-forms/wingspan-forms',
            'textassets': '../textassets/'
        },
        shim: {
            'underscore': { deps: [], exports: '_' },
            'underscore.string': { exports: '_s' },
            'jquery': { deps: [], exports: '$' },
            'kendo': { deps: [], exports: 'kendo' },
            'react': { deps: [], exports: 'React'},
            'wingspan-forms': { deps: ['underscore', 'react', 'jquery', 'kendo'], exports: 'WingspanForms' }
        }
    });
})();
