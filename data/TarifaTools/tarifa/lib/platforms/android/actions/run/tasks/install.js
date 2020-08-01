var Q = require('q'),
    format = require('util').format,
    exec = require('child_process').exec,
    print = require('../../../../../helper/print'),
    pathHelper = require('../../../../../helper/path'),
    settings = require('../../../../../settings');

var install = function (conf, device) {
    var defer = Q.defer(),
        product_file_name = conf.localSettings.configurations['android'][conf.configuration].product_file_name,
        apk_filename_path = pathHelper.productFile('android', product_file_name),
        cmd = format(
            "%s -s %s install -rl \"%s\"",
            settings.external.adb.name,
            device,
            apk_filename_path
        ),
        options = {
            timeout : 100000,
            maxBuffer: 1024 * 400
        };

    if(conf.verbose)
        print.success('trying to install android app: %s on %s', product_file_name, device);

    exec(cmd, options, function (err, stdout, stderr) {
        print('adb:\n %s %s', stdout, stderr);
        if(err) {
            if(conf.verbose) {
                print.error('command: %s', cmd);
                print.error('adb stderr %s', stderr);
            }
            defer.reject('adb command failed; try to plug again the device if the error persist.');
        }
        else {
            defer.resolve(conf);
        }
    });

    return defer.promise;
}

module.exports = function (conf) {
    if(conf.device) {
        return install(conf, conf.device.value);
    } else {
        return conf.devices.reduce(function (promise, device) {
            return promise.then(function (c) { return install(c, device); });
        }, Q.resolve(conf));
    }
};
