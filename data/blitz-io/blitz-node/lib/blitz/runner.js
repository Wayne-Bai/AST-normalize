/*jslint
    onevar: false, undef: true, newcap: true, nomen: false, es5: true,
    regexp: true, plusplus: true, bitwise: true, browser: true, indent: 4 */
/*global require, module, console, process, blitz */

(function () {
    var api = require('./api'),
        EventEmitter = require('events').EventEmitter,
        Sprint = require('./sprint'),
        Rush = require('./rush'),
        Util = require('util');

    function Runner(credentials) {
        var self = this,
            user = credentials.username,
            pass = credentials.apiKey,
            host = credentials.host,
            port = credentials.port,
            client = new api.Client(user, pass, host, port);

        function extend(source) {
            var target = self,
                properties = Object.getOwnPropertyNames(source);
            properties.forEach(function(name) {
                var descriptor = Object.getOwnPropertyDescriptor(source, name);
                Object.defineProperty(target, name, descriptor);
            });
        }

        self.execute = function (text) {
            client.parse(text).on('parse', function(options) {
                // extends test to propagate events 
                var command = options.command,
                    test = command.pattern ? new Rush() : new Sprint();

                extend(test);

                setTimeout(function () {
                    self.create(credentials, command).execute();
                }, 2000);
                
            }).on('error', function (message) {
                // propagate error
                self.emit('error', message);
            });

            return self;
        };

        return self;
    }
    Util.inherits(Runner, EventEmitter);
    module.exports = Runner;
}());