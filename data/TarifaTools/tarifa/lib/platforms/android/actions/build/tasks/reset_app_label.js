var Q = require('q'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    builder = require('../../../lib/xml/string.xml'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var app_label = msg.localSettings.name,
        strings_xml_file_path = path.join(pathHelper.app(), 'platforms/android/res/values/strings.xml');

    return builder.changeAppName(strings_xml_file_path, app_label).then(function () {
        if(msg.verbose)
            print.success('reset product name to %s', app_label);
        return Q.resolve(msg);
    });
};
