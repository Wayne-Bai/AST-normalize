var Q = require('q'),
    rimraf = require('rimraf'),
    spinner = require("char-spinner"),
    path = require('path'),
    fs = require('q-io/fs'),
    intersection = require('interset/intersection'),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    platformHelper = require('../../lib/helper/platform'),
    tasksHelper = require('../../lib/helper/tasks'),
    print = require('../../lib/helper/print'),
    tarifaFile = require('../../lib/tarifa-file'),
    listAvailableOnHost = require('../../lib/cordova/platforms').listAvailableOnHost,
    cordovaClean = require('../../lib/cordova/clean'),
    settings = require('../../lib/settings'),
    platformTasks = tasksHelper.load(settings.platforms, 'clean', 'tasks');

var tryRemoveWWW = function (verbose) {
    var defer = Q.defer(),
        www = path.join(pathHelper.app(), "www");

    rimraf(www, function (err) {
        if(err) {
            print.warning(err);
            print.warning("not able to remove www folder in cordova app!");
        }
        fs.makeDirectory(www).then(function() { defer.resolve(); });
    });
    return defer.promise;
};

var runTasks = function (platforms, localSettings, verbose) {
    return function () {
        return platforms.reduce(function (msg, platform) {
            return Q.when(msg, tasksHelper.execSequence(platformTasks[platform].map(require)));
        }, {
            settings: localSettings,
            verbose : verbose
        });
    };
};

var clean = function (platform, verbose) {
    var cwd = process.cwd(),
        conf = [tarifaFile.parse(pathHelper.root()), listAvailableOnHost()];

    spinner();

    return Q.all(conf).spread(function (localSettings, platforms) {
        var usablePlatforms = intersection(
            platforms,
            platform ? [platform] : localSettings.platforms.map(platformHelper.getName)
        );

        process.chdir(pathHelper.root());

        if(platform && usablePlatforms.indexOf(platform) < 0)
            return Q.reject('platform not available on host!');
        if(platform && localSettings.platforms.map(platformHelper.getName).indexOf(platform) < 0)
            return Q.reject('platform not defined in project!');

        return tryRemoveWWW().then(function () {
            return cordovaClean(pathHelper.root(), usablePlatforms, verbose);
        }).then(runTasks(usablePlatforms, localSettings, verbose));

    }).then(function (msg) {
        process.chdir(cwd);
        return msg;
    }, function (err) {
        process.chdir(cwd);
        throw err;
    });
};

var action = function (argv) {
    var verbose = false,
        helpPath = path.join(__dirname, 'usage.txt');

    if(argsHelper.matchArgumentsCount(argv, [0, 1])
            && argsHelper.checkValidOptions(argv, ['V', 'verbose'])) {
        if(argsHelper.matchOption(argv, 'V', 'verbose')) {
            verbose = true;
        }
        return clean(argv._[0], verbose);
    }
    return fs.read(helpPath).then(print);
};

action.clean = clean;
module.exports = action;
