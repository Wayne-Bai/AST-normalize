var Q = require('q'),
    path = require('path'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    WMAppManifestBuilder = require('../../../lib/xml/WMAppManifest.xml'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var manifestPath = path.join(pathHelper.app(), 'platforms', 'wp8', 'Properties', 'WMAppManifest.xml'),
        name = msg.localSettings.configurations.wp8[msg.configuration]['product_name'],
        guid = msg.localSettings.configurations.wp8[msg.configuration]['guid'];


    return WMAppManifestBuilder.set(manifestPath, name, guid).then(function () {
        if(msg.verbose)
            print.success('changed WMAppManifest.xml');
        return msg;
    });
};
