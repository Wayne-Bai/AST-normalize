var Q = require('q'),
    path = require('path'),
    chalk = require('chalk'),
    fs = require('fs'),
    exec = require('child_process').exec,
    os = require('os'),
    print = require('../helper/print'),
    settings = require('../settings');

function clean(root, platform, verbose) {
    return function () {
        var defer = Q.defer(),
            cwd = path.resolve(root, settings.cordovaAppPath, 'platforms', platform, 'cordova'),
            cmd = 'clean',
            options = {
                cwd: cwd,
                timeout : 0,
                maxBuffer: 1024 * 4000
            };

        if(!fs.existsSync(path.resolve(cwd, cmd))) return Q.resolve();

        cmd = fs.readFileSync(path.resolve(cwd, cmd), 'utf-8').indexOf('#!/bin/bash') > -1 ? './'+cmd : 'node ' + cmd;
        cmd += ' ' + require(path.resolve(__dirname, '../platforms', platform, 'actions/clean')).options.join(' ');
        var child = exec(cmd, options, function (err, stdout, stderr) {
            if(err) {
                if(verbose) {
                    print.error('command: clean');
                    print.error('command stderr ' + stderr);
                }
                defer.reject('command stderr ' + err);
                return;
            }
            if(verbose)
                print.success('cleaning platform %s', platform);
            defer.resolve();
        });

        if (verbose) child.stdout.pipe(process.stdout);

        return defer.promise;
    };
}

module.exports = function (root, platforms, verbose) {
    return platforms.reduce(function (promise, platform) {
        return promise.then(clean(root, platform, verbose));
    }, Q.resolve());
};
