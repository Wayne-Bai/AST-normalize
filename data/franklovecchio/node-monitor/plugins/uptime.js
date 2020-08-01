/* uptime.js */
/**
 * A plugin for monitoring uptime (system reboots)
 */
var fs = require('fs');

var Plugin = {
    name: 'uptime',
    command: 'cat /proc/uptime | awk \'{print$1}\'',
    type: 'poll'
};

this.name = Plugin.name;
this.type = Plugin.type;

Plugin.format = function (data) {
	data = data.replace(/^(\s*)((\S+\s*?)*)(\s*)$/,'$2');
    data = {
        seconds: data
    };
    return JSON.stringify(data);
};

this.poll = function (constants, utilities, logger, callback) {
    self = this;
    self.constants = constants;
    self.utilities = utilities;
    self.logger = logger;

    var exec = require('child_process').exec,
        child;
    child = exec(Plugin.command, function (error, stdout, stderr) {
        callback(Plugin.name, 'Uptime', 'Seconds', stdout.toString().replace(/^(\s*)((\S+\s*?)*)(\s*)$/,'$2'), Plugin.format(stdout.toString()));
    });
};