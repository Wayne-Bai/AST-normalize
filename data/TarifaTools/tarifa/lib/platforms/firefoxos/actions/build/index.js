var Q = require('q');

/* tasks definition */
module.exports.tasks = {
    'clean-resources': [ ],
    'pre-cordova-prepare' : [
        'lib/platforms/shared/actions/build/tasks/clean',
        'lib/platforms/shared/actions/build/tasks/populate_config_xml'
    ],
    'pre-cordova-compile' : [
        'lib/platforms/firefoxos/actions/build/tasks/manifest',
        'lib/platforms/shared/actions/build/tasks/copy_icons'
    ],
    'post-cordova-compile' : [
        'lib/platforms/firefoxos/actions/build/tasks/copy'
    ],
    'undo':[
        'lib/platforms/shared/actions/build/tasks/reset_config_xml'
    ]
};
