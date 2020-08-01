var Q = require('q'),
    spinner = require("char-spinner"),
    cordova = require('cordova-lib/src/cordova/cordova'),
    exec = require('child_process').exec,
    path = require('path'),
    fs = require('q-io/fs'),
    existsSync = require('fs').existsSync,
    argsHelper = require('../../lib/helper/args'),
    platformHelper = require('../../lib/helper/platform'),
    print = require('../../lib/helper/print'),
    settings = require('../../lib/settings'),
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path'),
    tasksHelper = require('../../lib/helper/tasks'),
    platformsLib = require('../../lib/cordova/platforms'),
    buildAction = require('../build'),
    askDevice = require('./ask_device'),
    argsHelper = require('../../lib/helper/args'),
    platformTasks = tasksHelper.load(settings.platforms, 'run', 'tasks');

var binaryExists = function (conf) {
    var exists = false, productFileName, productFolder;
    try {
        productFileName = pathHelper.productFile(
            conf.platform,
            conf.localSettings.configurations[conf.platform][conf.configuration].product_file_name
        );
    } catch(err) { }
    if (productFileName && existsSync(productFileName)) exists = true;

    try {
        productFolder = pathHelper.productFolder(
            conf.platform,
            conf.localSettings.configurations[conf.platform][conf.configuration].product_name
        );
    } catch(err) { }
    if (productFolder && existsSync(productFolder)) exists = true;
    return exists;
};

var runƒ = function (conf) {
    var tasks = platformTasks[conf.platform].map(require),
        buildPromise = (function (nobuild) {
            if (nobuild) return Q(conf);
            else return buildAction.buildƒ(conf);
        })(conf.nobuild && binaryExists(conf));

    return buildPromise.then(askDevice).then(tasksHelper.execSequence(tasks));
};

var run = function (platform, config, localSettings, options) {
    print.outline('Launch run for %s platform and configuration %s !', platform, config);
    return runƒ({
        localSettings: localSettings,
        platform: platform,
        configuration: config,
        cleanResources: options.cleanResources,
        verbose: options.verbose,
        nobuild: options.nobuild,
        debug: options.debug,
        all: options.all,
        spinner: spinner()
    });
};

var runMultipleConfs = function(platform, configs, localSettings, options) {
    configs = configs || tarifaFile.getPlatformConfigs(localSettings, platform);
    return tarifaFile.checkConfigurations(configs, platform, localSettings).then(function () {
        return configs.reduce(function(p, conf) {
            return p.then(function () {
                return run(platform, conf, localSettings, options);
            });
        }, Q());
    });
};

var runMultiplePlatforms = function (platforms, config, options) {
    return tarifaFile.parse(pathHelper.root()).then(function (localSettings) {
        platforms = (platforms || localSettings.platforms.map(platformHelper.getName)).filter(platformsLib.isAvailableOnHostSync);
        return tarifaFile.checkPlatforms(platforms, localSettings).then(function (availablePlatforms) {
            return availablePlatforms.reduce(function(promise, platform) {
                return promise.then(function () {
                    if (config === 'all') {
                        config = null;
                    } else if (argsHelper.matchWildcard(config)) {
                        config = argsHelper.getFromWildcard(config);
                    }
                    return runMultipleConfs(platform, config, localSettings, options);
                });
            }, Q());
        });
    });
};

var action = function (argv) {
    var options = {
            verbose : false,
            cleanResources: false,
            nobuild:false,
            debug:false,
            all:false
        },
        helpPath = path.join(__dirname, 'usage.txt');

    if(argsHelper.matchOption(argv, 'V', 'verbose'))
        options.verbose = true;

    if (argsHelper.matchOption(argv, null, 'nobuild'))
        options.nobuild = true;

    if (argsHelper.matchOption(argv, null, 'all'))
        options.all = true;

    if (argsHelper.matchOption(argv, null, 'clean-resources'))
        options.cleanResources = true;

    if (argsHelper.matchOption(argv, 'd', 'debug')) {
        options.debug = true;
        if(argsHelper.matchCmd(argv._, ['__multi__', '*']) || argsHelper.matchCmd(argv._, ['*', '__multi__'])) {
            print.error('Oops, not `--debug` option on multiple configurations or multiple platforms!');
            print();
            return fs.read(helpPath).then(print);
        }
    }

    if(argsHelper.matchCmd(argv._, ['__all__', '*']))
        return runMultiplePlatforms(null, argv._[1] || 'default', options);

    if (argsHelper.matchCmd(argv._, ['__some__', '*'])) {
        return runMultiplePlatforms(
            argsHelper.getFromWildcard(argv._[0]),
            argv._[1] || 'default',
            options
        );
    }

    return fs.read(helpPath).then(print);
};

action.run = run;
action.runMultiplePlatforms = runMultiplePlatforms;
action.runƒ = runƒ;
module.exports = action;
