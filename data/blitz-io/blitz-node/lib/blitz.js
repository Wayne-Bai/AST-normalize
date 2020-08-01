/*jslint
    onevar: false, undef: true, newcap: true, nomen: false, es5: true,
    regexp: true, plusplus: true, bitwise: true, browser: true, indent: 4 */
/*global require, module, console, process */
(function () {
    var api = require('./blitz/api'),
        Sprint = require('./blitz/sprint'),
        Rush = require('./blitz/rush'),
        Runner = require('./blitz/runner');

    function Blitz(username, apiKey, host, port, apiAuthenticated) {
        var self = this;
        self.authenticated = apiAuthenticated || false;
        self.credentials = {
            username: username,
            apiKey: apiKey,
            host: host,
            port: port
        };

        function run(options, module) {
            self.authenticate(
                function () { module.create(self.credentials, options).execute(); }, 
                function (message) { module.emit('error', message); }
            );
        }

        self.authenticate = function(success, error) {
            //verifies authentication
            if (self.authenticated) {
                success();
            }
            else {
                var client = new api.Client(username, apiKey, host, port);
                client.login().on('login', function (result) {
                    if (result.ok) {
                        self.authenticated = true;
                        self.credentials.apiKey = result.api_key;
                        success();
                    }
                    else {
                        error(result);
                    }
                }).on('error', function (response) {
                    //propagates the api error thorugh the module
                    error(response);
                });
            }
        }

        self.rush = function (options) {
            var rush = new Rush();
            run(options, rush);
            return rush;
        };

        self.sprint = function (options) {
            var sprint = new Sprint();
            run(options, sprint);
            return sprint;
        };

        self.execute = function (text) {
            var runner = new Runner(self.credentials);
            self.authenticate(
                function () { runner.execute(text); }, 
                function (message) { runner.emit('error', message); }
            );
            return runner;
        };
        
        self.about = function (callback) {
            var client = new api.Client(username, apiKey, host, port);
            self.authenticate(
                function () { client.about(callback); }, 
                function (message) { throw message.reason; }
            );
        };
    }

    module.exports = Blitz;
}());
