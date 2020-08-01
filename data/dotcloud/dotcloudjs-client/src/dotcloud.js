/**
 * dotcloud.js, a Javascript gateway library to powerful cloud services.
 * Copyright 2012 DotCloud Inc (Joffrey Fuhrer <joffrey@dotcloud.com>))
 *
 * This project is free software released under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */



/**
    dotcloud.js is provided as a <em>requirejs</em> module. For more information, you can visit
    <a href="http://requirejs.org">the requireJS website</a>

    @name dotcloud
    @namespace
    @exports self as dotcloud
*/
define(function(require) {
    var isReady = false;
    var readyCb = [];
    var self = {};

    var config = require('config');
    require('stack.io').io({ host: config.host, timeout: 15 }, function(err, io) {
        // The dotcloud object is a namespace to several submodules loaded dynamically.
        // Each submodule is documented on its own page.
        config.ready(function(config) {

            // * [dotcloud.auth](auth.html) &mdash; Authentication API
            self.auth = require('auth')(config, io);

            if (config.modules.DB_ENABLED) {
                // * [dotcloud.db](db.html) &mdash; Simple storage API
                self.db = require('db')(config, io);
            }

            if (config.modules.SYNC_ENABLED) {
                // * [dotcloud.sync](sync.html) &mdash; Synchronized storage API
                self.sync = require('sync')(config, io);
            }

            if (config.modules.TWITTER_ENABLED) {
                // * [dotcloud.twitter](twitter.html) &mdash; Twitter APIs
                self.twitter = require('twitter')(config, io);
            }

            if (config.modules.TWILIO_ENABLED) {
                // * [dotcloud.twilio](twilio.html) &mdash; Twilio APIs
                self.twilio = require('twilio')(config, io);
            }

            ready();
            isReady = true;
        });
    });


    function ready() {
        var i = readyCb.length;
        while (--i >= 0) {
            readyCb[i](self);
        }
        isReady = true;
    }


    /**
        When provided with a function parameter, `ready` will use it
        as a callback when the `dotcloud` module is ready to be used.
        The module is provided as first (and only) argument of the callback.

        @public
        @name dotcloud.ready
        @function
        @param {function} fn The callback to execute whenever dotcloud JS is loaded.
    */
    self.ready = function(fn) {
        if (fn instanceof Array) {
            readyCb = readyCb.concat(fn);
        } else {
            readyCb.push(fn);
        }
        if (isReady) {
            if (fn instanceof Array) {
                for (var i = 0, l = fn.length; i < l; i++) {
                    fn[i](self);
                }
            } else {
                fn(self);
            }
        }

    };

    return self;
});
