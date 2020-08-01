var Q = require('q'),
    chalk = require('chalk'),
    pathHelper = require('../../../../../helper/path'),
    print = require('../../../../../helper/print'),
    spawn = require('child_process').spawn,
    format = require('util').format,
    path = require('path');

var install = function (conf, device) {
    var defer = Q.defer(),
        configs = conf.localSettings.configurations,
        product_name = configs['ios'][conf.configuration].product_name,
        app_path = path.join(pathHelper.app(), 'platforms/ios', product_name + '.app'),
        bin = path.join(__dirname, '../../../../../../', 'node_modules', 'ios-deploy', 'ios-deploy'),
        argFormat = conf.debug ? '--uninstall -i %s -b %s -d -I --verbose' : '--uninstall -I -i %s -b %s --verbose',
        args = format(argFormat, device, app_path).split(' ');

    if(conf.verbose)
        print.success('start ios app install %s to device %s', product_name, device);
    if (conf.debug) clearInterval(conf.spinner);

    var child = spawn(bin, args);

    function output(c) {
        return function (d) {
            if(conf.debug || conf.verbose) {
                var data = d ? d.toString().split('\n') : [];
                print(chalk[c](data.filter(function (el) {
                    return el.length > 0;
                }).join('\n')));
            }
        }
    }

    child.stdout.on('data', output('green'));
    child.stderr.on('data', output('yellow'));

    child.on('close', function(code) {
        print();
        if(conf.verbose) print.success('killed `ios-deploy`');
        if (code > 0) defer.reject(format('ios-deploy %s failed with code %s', args.join(' '), code));
        else defer.resolve(conf);
    });

    function killIosDeploy() {
        child.kill();
        Q.delay(2000).then(child.kill);
    }

    process.openStdin().on("keypress", function(chunk, key) {
        if(key && key.name === "c" && key.ctrl) { killIosDeploy(); }
    });

    process.stdin.setRawMode();
    process.on('SIGINT', killIosDeploy);

    return defer.promise;
};

module.exports = function (conf) {
    if(conf.device) {
        return install(conf, conf.device.value);
    } else {
        return conf.devices.reduce(function (promise, device) {
            return promise.then(function (c) { return install(c, device); });
        }, Q.resolve(conf));
    }
};
