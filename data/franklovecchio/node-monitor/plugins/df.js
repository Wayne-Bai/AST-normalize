/* df.js */
/**
 * A plugin for monitoring disk size in %.
 */
var fs = require('fs');

var Plugin = {
    name: 'df',
    command: '',
    type: 'poll'
};

this.name = Plugin.name;
this.type = Plugin.type;

Plugin.format = function (diskToCheck, data) {
    data = data.replace(/(\r\n|\n|\r)/gm, '');
    data = data.replace('%', '');
    data = {
        disk: diskToCheck,
        size: data
    };
    return JSON.stringify(data);
};

this.poll = function (constants, utilities, logger, callback) {
    var self = this;
    self.constants = constants;
    self.utilities = utilities;
    self.logger = logger;

    var disks = [];
    fs.readFile(self.name + '_config', function (error, fd) {
        if (error) self.utilities.exit('Error reading ' + self.name + ' plugin config file');

        var splitBuffer = [];
        splitBuffer = fd.toString().split('\n');
        for (var i = 0; i < splitBuffer.length; i++) {
            var disk = splitBuffer[i];
            if (!utilities.isEmpty(disk)) {
            	self.logger.write(self.constants.levels.INFO, 'Disk to check: ' + disk);
            	disks.push(disk);
            }
        }

        disks.forEach(function (diskToCheck) {
            Plugin.command = 'df -h | grep -v grep | grep \'' + diskToCheck + '\' | awk \'{print $5}\'';
            var exec = require('child_process').exec,
                child;
            child = exec(Plugin.command, function (error, stdout, stderr) {
            	/* Misconfigured disk */
            	if (!utilities.isEmpty(stdout.toString().replace('%', '')))
            		callback(Plugin.name, 'DiskSpace', 'Percent', stdout.toString().replace('%', ''), Plugin.format(diskToCheck, stdout.toString()));
            	
            });
        });
    });
};