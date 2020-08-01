/* who.js */
/**
 * A plugin for monitoring sessions.
 */
var fs = require('fs');

var Plugin = {
    name: 'who',
    command: 'who',
    type: 'poll'
};

this.name = Plugin.name;
this.type = Plugin.type;

Plugin.format = function (data) {
    var splitBuffer = [];
    splitBuffer = data.split('\n');

    var users = {

    };

    for (var i = 0; i < splitBuffer.length; i++) {
        var line = splitBuffer[i];
        var lineArray = line.split(/\s+/);

        var count = 0;
        var userName = null;
        var sessionName = null;

        lineArray.forEach(function (segment) {
            if (count == 0) userName = segment;

            if (count == 1) {
                sessionName = segment;
                var consoleCount;
                if (users[userName]) {
                    consoleCount = parseInt(users[userName]['sessions']);
                    consoleCount++;
                } else {
                    consoleCount = 1;
                    users[userName] = {};
                    users[userName]['username'] = userName;
                    users[userName]['type'] = [];
                }
                users[userName]['sessions'] = consoleCount;
                users[userName]['type'].push(sessionName);
            }
            count++;
        });
    }
    return users;
};

this.poll = function (constants, utilities, logger, callback) {
    self = this;
    self.constants = constants;
    self.utilities = utilities;
    self.logger = logger;

    var exec = require('child_process').exec;
    child = exec(Plugin.command, function (error, stdout, stderr) {
        var data = Plugin.format(stdout.toString());
        for (var user in data) {
            callback(Plugin.name, 'Who-' + data[user]['username'], 'Count', data[user]['sessions'], JSON.stringify(data));
        }
    });
};