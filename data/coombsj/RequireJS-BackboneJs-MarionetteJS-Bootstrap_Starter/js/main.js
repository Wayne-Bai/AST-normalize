require.config({
    paths: {
        backbone: 'lib/backbone/backbone',
        underscore: 'lib/underscore/underscore',
        jquery: 'lib/jquery/jquery-1.9.0',
        marionette: 'lib/backbone/backbone.marionette',
        bootstrap: 'lib/bootstrap/bootstrap',
        tpl: 'lib/require/tpl'
    },
    shim: {
        jquery: {
            exports: 'jQuery'
        },
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: ['jquery', 'underscore'],
            exports: 'Backbone'
        },
        marionette: {
            deps: ['jquery', 'underscore', 'backbone'],
            exports: 'Marionette'
        },
        bootstrap: ['jquery']//,
        //'lib/backbone/backbone.localStorage': ['backbone']
    }
});

require(['app/App', 'backbone', 'app/Router', 'bootstrap'],
    function (app, Backbone, Router) {
        "use strict";

        window.MyApp = app;
        MyApp.start();

        new Router();

        Backbone.history.start();
        console.log('Application has started!');
    });


