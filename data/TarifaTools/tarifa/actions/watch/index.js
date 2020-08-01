var Q = require('q'),
    path = require('path'),
    os = require('os'),
    fs = require('q-io/fs'),
    restler = require('restler'),
    connect = require("connect"),
    serveStatic = require('serve-static'),
    tinylr = require('tiny-lr-fork'),
    findPort = require('find-port'),
    rimraf = require('rimraf'),
    lr = require('connect-livereload'),
    chalk = require('chalk'),
    format = require('util').format,
    chalk = require('chalk'),
    cool = require('cool-ascii-faces'),
    argsHelper = require('../../lib/helper/args'),
    pathHelper = require('../../lib/helper/path'),
    builder = require('../../lib/builder'),
    feature = require('../../lib/feature'),
    print = require('../../lib/helper/print'),
    isAvailableOnHost = require('../../lib/cordova/platforms').isAvailableOnHost,
    runAction = require('../run'),
    buildAction = require('../build'),
    prepareAction = require('../prepare'),
    tarifaFile = require('../../lib/tarifa-file'),
    settings = require('../../lib/settings'),
    ask = require('../../lib/questions/ask');

function askHostIp() {
    var interfaces = os.networkInterfaces(),
        ipv4Filter = function (addr) { return addr.family === 'IPv4'; },
        addrFilter = function (i) { return i.address; },
        concat = function (acc, i) { return acc.concat(i); },
        ips = Object.keys(interfaces).map(function (i) {
            return interfaces[i].filter(ipv4Filter).map(addrFilter);
        }).reduce(concat, []);

    return ask.question('Which ip should be used to serve the configuration?', 'list', ips);
}

function findLiveReloadPort() {
    var defer = Q.defer(),
        start = settings.livereload_port,
        max = start + settings.livereload_range;

    findPort(start, max, function (ports) {
        if(ports.length > 0) defer.resolve(ports[0]);
        else defer.reject(format('not port found in range [%s, %s]', start, max));
    });

    return defer.promise;
}

function setupLiveReload(msg) {
    var conf = msg.localSettings.configurations[msg.platform][msg.configuration],
        index = pathHelper.wwwFinalLocation(pathHelper.root(), msg.platform),
        app = connect(),
        lrServer = tinylr(),
        defer = Q.defer(),
        serve = serveStatic(index, {index: false});

    lrServer.listen(msg.port, function(err) {
        if(err) print.error('error while starting the live reload server %s', err);
        if(msg.verbose) print.success('started live reload server on %s:%s', msg.ip, msg.port);
    });

    app.use(lr({ port: msg.port }));
    app.use(serve);

    var server = app.listen(msg.http_port,function () {
        print.success('started web server on %s', format("%s:%s", msg.ip, msg.http_port));
        defer.resolve(msg);
    });

    server.on('error',function (err) {
        if(msg.verbose) print(err);
        defer.reject(format('Can not serve %s on %s:%s', index, msg.ip, msg.http_port));
    });

    return defer.promise;;
}

function run(platform, config, port, norun, verbose) {
    return function (localSettings) {
        return builder.checkWatcher(pathHelper.root()).then(function () {
            return Q.all([findLiveReloadPort(), askHostIp()]).spread(function (livereload_port, ip) {
                return {
                    watch : format('http://%s:%s/index.html', ip, port),
                    localSettings: localSettings,
                    platform : platform,
                    configuration: config,
                    verbose : verbose,
                    port : livereload_port,
                    ip : ip,
                    http_port : port
                };
            });
        })
        .then(setupLiveReload)
        .then(function (msg) {
            return norun ? buildAction.buildƒ(msg) : runAction.runƒ(msg);
        })
        .then(function (msg) {
            if (msg.verbose) print.success('run app for watch: %s', chalk.green.underline(msg.watch));
            return msg;
        });
    };
}

function wait(msg) {

    function rewritePath(filePath) {
        var srcPath = pathHelper.resolve(msg.localSettings.project_output);
        return filePath.replace(srcPath, msg.watch.replace('/index.html', ''));
    }

    var closeBuilderWatch = builder.watch(pathHelper.root(), function (file) {
        var t0 = (new Date()).getTime();
        if(msg.verbose) print.success('www project triggering tarifa');

        function onchange() {

            restler.post(format('http://%s:%s/changed', msg.ip, msg.port), {
                data: JSON.stringify({ files: [rewritePath(file)] })
            }).on('complete', function(data, response) {
                if (response.statusCode >= 200 && response.statusCode  < 300) {
                    if(msg.verbose) print.success('live reload updated: %s', rewritePath(file));
                } else {
                    print.error('can not update live reload %s', response.statusCode);
                }
                if(msg.verbose) {
                    var t = (new Date()).getTime();
                    print('\n\t%s', chalk.green(cool()))
                    print(chalk.magenta('\ndone in ~ %ds\n'), Math.floor((t-t0)/1000));
                }
            });
        }

        function copyOutput(cordova_www, project_output){
            var defer = Q.defer();

            rimraf(cordova_www, function (err) {
                if(err) return defer.reject(err);
                if(msg.verbose) print.success('rm cordova www folder');
                defer.resolve();
            }, function (err) { defer.reject(err); });

            return defer.promise.then(function () {
                return prepareAction.copy_method(cordova_www, project_output);
            });
        }

        var www = pathHelper.cordova_www(),
            out = msg.localSettings.project_output,
            copy_method = settings.www_link_method[os.platform()],
            copyPromise = (copy_method === 'copy') ? copyOutput(www, out) : Q.resolve();

        return copyPromise.then(function () {
            return buildAction.prepare(msg);
        }).then(onchange);

    }, msg.localSettings, msg.platform, msg.configuration);

    var defer = Q.defer();

    process.openStdin().on("keypress", function(chunk, key) {
        if(key && key.name === "c" && key.ctrl) {
            Q.delay(2000).then(function () {
                print();
                if(msg.verbose) print.success('closing www builder');
                closeBuilderWatch();
                defer.resolve();
            });
        }
    });

    process.stdin.setRawMode();

    process.on('SIGINT', function() {
        Q.delay(200).then(function () {
            print();
            if(msg.verbose) print.success('closing www builder');
            closeBuilderWatch();
            defer.resolve();
        });
    });

    return defer.promise;
}

function httpPortAvailable(port) {
    var d = Q.defer();
    findPort([port], function (ports) {
        if(ports.length > 0) d.resolve(ports[0]);
        else d.reject(format('port %s already used!', port));
    });
    return d.promise;
}

function watch(platform, config, port, norun, verbose) {
    if(!feature.isAvailable('watch', platform)) {
        return Q.reject(format('feature not available on %s!', platform));
    }
    return Q.all([
        tarifaFile.parse(pathHelper.root(), platform, config),
        isAvailableOnHost(platform),
        httpPortAvailable(port)
    ]).spread(run(platform, config, port, norun, verbose)).then(wait);
}

var action = function (argv) {
    var verbose = false,
        norun = false,
        port = settings.default_http_port,
        helpPath = path.join(__dirname, 'usage.txt');

    if(argsHelper.matchArgumentsCount(argv, [1,2])
            && argsHelper.checkValidOptions(argv, ['V', 'verbose', 'p', 'port', 'norun'])) {
        if(argsHelper.matchOption(argv, 'V', 'verbose')) {
            verbose = true;
        }

        if(argsHelper.matchOptionWithValue(argv, 'p', 'port')) {
            port = parseInt(argv.p || argv.port, 10);
            if(isNaN(port)) {
                print.error('port `%s` is not valid', argv.port === true ? '' : argv.port);
                return fs.read(helpPath).then(print);
            }
        }

        norun = argsHelper.matchOptionWithValue(argv, 'norun');
        return watch(argv._[0], argv._[1] || 'default', port, norun, verbose);
    }

    return fs.read(helpPath).then(print);
};

module.exports = action;
