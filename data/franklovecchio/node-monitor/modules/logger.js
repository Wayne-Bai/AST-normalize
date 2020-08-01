/* logger.js */
var fs = require('fs'),
    Module = {},
    location = 'logger.js';

LoggingManagerModule = function (constants, utilities) {
    Module = this;
    Module.constants = constants;
    Module.utilities = utilities;
};

LoggingManagerModule.prototype.write = function (level, message) { /* Create message */
    var date = new Date();
    message = date + ' ' + level + ' ' + message + '\n';

    /* Log to console if specified */
    if (process.env[Module.constants.strings.CONSOLE] == Module.constants.strings.TRUE) console.log(message);

    /* Create log object to store */
    var data = {
        origin: process.env[Module.constants.strings.IP],
        message: message
    };

    var postParams = {};
    postParams[date.getTime()] = escape(data);

    date = date.getUTCFullYear() + ':' + date.getUTCMonth() + ':' + date.getUTCDate();

    /* Push all log data via 0MQ */
    // self.constants.globals[self.constants.strings.INSTANCE_ID]
};

exports.LoggingManagerModule = LoggingManagerModule;