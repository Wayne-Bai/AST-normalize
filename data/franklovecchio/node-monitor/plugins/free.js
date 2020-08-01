/* free.js */
/**
 * A plugin for monitoring free space in MB.
 */
var fs = require('fs');

var Plugin = {
    name: 'free',
    command: '',
    type: 'poll'
};

this.name = Plugin.name;
this.type = Plugin.type;

Plugin.format = function (data, system) {
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    data = data.replace('M', '');
    return data;
};

this.poll = function (constants, utilities, logger, callback) {
    self = this;
    self.constants = constants;
    self.utilities = utilities;
    self.logger = logger;

    /* Operating system differentiation */
    var system = process.platform.toString();

    switch (system) {
    case 'darwin':
        Plugin.command = 'top -l 1 | awk \'/PhysMem/ {print $10}\'';
        break;
    case 'linux':
        Plugin.command = 'free -t -m | awk \'NR==5{print $4}\'';
        break;
    default:
        self.logger.write(self.constants.levels.WARNING, 'Unaccounted for system: ' + system);
        return;
        break;
    }

    var exec = require('child_process').exec,
        child;
    child = exec(Plugin.command, function (error, stdout, stderr) {
        callback(Plugin.name, 'MemoryFree', 'Megabytes', Plugin.format(
        stdout.toString(), system), Plugin.format(stdout.toString(), system));
    });
};