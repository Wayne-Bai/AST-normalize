var Q = require('q'),
    path = require('path'),
    exec = require('child_process').exec,
    platforms = require('cordova-lib/src/cordova/platforms'),
    platformHelper = require('../helper/platform')

function getPlatformVersion(root) {
    return function (platform) {
        platform =  platformHelper.getName(platform);
        var cmd = path.resolve(root, 'platforms', platform, 'cordova', 'version'),
            defer = Q.defer(),
            options = {
                timeout : 0,
                maxBuffer: 1024 * 500
            },
            child = exec("\"" + cmd + "\"", options, function (err, stdout, stderr) {
                if(err) {
                    defer.reject(cmd + ' ' + err);
                    return;
                }
                var rslt = {
                    version : stdout.toString().replace(/\n/g, '').trim(),
                    name: platform
                };
                defer.resolve(rslt);
            });
        return defer.promise;
    };
}

function getCordovaPlatformsVersion(root, platforms) {
    return Q.all(platforms.map(getPlatformVersion(root)));
}

function getAvailablePlatformsVersion(ps){
    return Q.resolve(ps.map(function (platform) {
        return {
            name : platform,
            version : platforms[platform].version
        };
    }));
}

module.exports.getCordovaPlatformsVersion = getCordovaPlatformsVersion;
module.exports.getAvailablePlatformsVersion = getAvailablePlatformsVersion;
module.exports.getPlatformVersion = getPlatformVersion;
