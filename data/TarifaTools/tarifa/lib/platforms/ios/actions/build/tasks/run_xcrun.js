var Q = require('q'),
    exec = require('child_process').exec,
    path = require('path'),
    format = require('util').format,
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    settings = require('../../../../../settings');

module.exports = function (msg) {
    var conf = msg.localSettings.configurations.ios[msg.configuration],
        label = conf.sign;

    if(!label || !conf['product_file_name'] || !conf['product_name']){
        return Q.resolve(msg);
    }

    var signing = msg.localSettings.signing.ios[label],
        identity = signing.identity,
        provisioning_path = signing.provisioning_path,
        output = path.join(pathHelper.app(), 'platforms/ios', conf['product_file_name'] + '.ipa'),
        defer = Q.defer(),
        app_input = path.join(pathHelper.app(), 'platforms/ios', conf['product_name'] + '.app'),
        cmd = format(
            'xcrun -log -sdk iphoneos PackageApplication -v "%s" -o "%s" -sign "%s" -embed "%s"',
            app_input,
            output,
            identity,
            provisioning_path
        ),
        options = {
            timeout : 0,
            maxBuffer: 1024 * 400
        },
        child = exec(cmd, options, function (err, stdout, stderr) {
            if(err) {
                defer.reject(format('%s %s', cmd, err));
                return;
            }
            if(msg.verbose)
                print(stdout.toString());
                print.success('run xcrun and produced the ipa: %s', output.toString());
            defer.resolve(msg);
        });

    return defer.promise;
};
