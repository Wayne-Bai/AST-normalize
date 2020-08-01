/*
 * create a release.properties file, needed on the android platform to sign apk
 */

var path = require('path'),
    Q = require('q'),
    format = require('util').format,
    fs = require('q-io/fs'),
    path = require('path');

function releasePropertiesPath (root) {
    return path.join(root, 'platforms', 'android', 'release.properties');
}

module.exports.create = function (root, keystore, alias, storepass, keypass, platformVersion) {
    var versions = require(path.resolve(__dirname, '../package.json')).versions,
        tmpl;
    if(versions.indexOf(platformVersion) > -1) {
        tmpl = require(path.resolve(__dirname, '../versions', platformVersion,'settings')).signingTemplate;
    } else {
        tmpl = "keystore=%s\nkey.alias=%s\nkeystore.password=%s\nkey.password=%s";
    }
    keystore = path.normalize(keystore);
    if (path.sep === '\\')
        keystore = path.sep === '\\' ? keystore.replace(/\\/g, '\\\\') : keystore;

    return fs.write(
        releasePropertiesPath(root),
        format(tmpl, keystore, alias, storepass, keypass)
   );
};

module.exports.remove = function (root) {
    var p = releasePropertiesPath(root);
    return fs.exists(p).then(function (exists) {
        if(exists) return fs.remove(p);
    });
};
