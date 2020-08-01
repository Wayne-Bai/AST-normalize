/**
 * Module dependencies.
 */
var express = require('express'),
    stylus = require('stylus');

module.exports = function(app, config) {

    app.set('showStackError', true);

    //Prettify HTML
    app.locals.pretty = true;

    //Set views path, template engine and default layout
    app.set('views', config.get("appRoot") + 'server/src/app/views');
    app.set('view engine', 'jade');

    // Middleware to compile `styl` files to `css`.
    // For example, `client/src/assets/stylesheets/stylus` will be compiled to `client/src/assets/stylesheets/css`
//    app.use(stylus.middleware({
//        // Source directory
//        src: config.get("appRoot") + 'client/src/assets/stylesheets/stylus',
//        // Destination directory
//        dest: config.get("appRoot") + 'client/src/assets/stylesheets/css',
//        // Compile function
//        compile: function(str, path) {
//            return stylus(str)
//                .set('filename', path)
//                .set('compress', true);
//        }
//    }));

    //TODO: (martin) the static directory should be '/client' but for some reason 'grunt bower-install' generate wrong directory into head.jade (figure out why this is happening)
    //app.use(express.static(config.root + '/client'));
    app.use(express.static(config.get("appRoot")));


    // all environments
    app.configure(function(){
        app.use(express.logger());
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

        //bodyParser should be above methodOverride
        app.use(express.bodyParser());
        app.use(express.methodOverride());

        //routes should be at the last
        app.use(app.router);
    });
};
