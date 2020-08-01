var Q = require('q'),
    path = require('path'),
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path'),
    AndroidManifestBuilder = require('../../../lib/xml/AndroidManifest.xml');

module.exports = function (msg) {
    var version_code = msg.localSettings.configurations.android[msg.configuration].version_code;
    if(version_code) {
        var androidManifestXmlPath = path.join(pathHelper.app(), 'platforms/android/AndroidManifest.xml');
        AndroidManifestBuilder.setVersionCode(androidManifestXmlPath, version_code);

        if(msg.verbose)
            print.success('change android versionCode to %s', version_code);
    }

    return Q.resolve(msg);
};
