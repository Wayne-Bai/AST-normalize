var Q = require('q'),
    fs = require('q-io/fs'),
    path = require('path'),
    format = require('util').format,
    argsHelper = require('../../lib/helper/args'),
    tarifaFile = require('../../lib/tarifa-file'),
    pathHelper = require('../../lib/helper/path'),
    print = require('../../lib/helper/print'),
    isObject = require('../../lib/helper/collections').isObject,
    settings = require('../../lib/settings'),
    pluginXML = require('../../lib/xml/plugin.xml'),
    plugins = require('../../lib/cordova/plugins');

function printPlugins(items) {
    if(items.length === 0) {
        print("no plugin installed!");
        return Q.resolve();
    }

    return items.reduce(function (msg, p) {
        return Q.when(msg, function () {
            var pluginPath = path.join(pathHelper.app(), 'plugins', p, 'plugin.xml');
            return pluginXML.getVersion(pluginPath).then(function (v) {
                print('%s@%s', p, v);
            });
        });
    }, {});
}

function log(action, verbose) {
    return function (val) {
        if(verbose) {
            if(val) print("%s plugin: %s", action, val);
            else print("no plugin added!");
        }
        return val;
    };
}

var actions = {
    'add': {
        updateTarifaFile: function (root) {
            return function (def) {
                return tarifaFile.addPlugin(root, def.val, def.uri, def.variables);
            };
        }
    },
    'remove': {
        updateTarifaFile: function (root) {
            return function (def) {
                return tarifaFile.removePlugin(root, def.val);
            };
        }
    },
    'reload': {
        updateTarifaFile: function (root) {
            return function (def) { return true; };
        }
    }
};

function list() {
    return plugins.list(pathHelper.root());
}

function plugin(action, arg, variables, verbose) {
    return raw_plugin(pathHelper.root(), action, arg, variables, verbose);
}

function raw_plugin (root, action, arg, variables, verbose) {
    return tarifaFile.parse(root)
        .then(function (settings) {
            if(action == 'remove' && (!settings.plugins || Object.keys(settings.plugins).indexOf(arg) < 0))
                return Q.reject(format("Can't remove uninstalled plugin %s", arg));
            if(action == 'add' && (settings.plugins && Object.keys(settings.plugins).indexOf(arg) > -1))
                return Q.reject(format("Can't install already installed plugin %s", arg));
            if(action == 'reload' && (settings.plugins && Object.keys(settings.plugins).indexOf(arg) < 0))
                return Q.reject(format("Can't reload not installed plugin %s", arg));
            if(action == 'reload') {
                var p = settings.plugins[arg],
                    uri= isObject(p) ? p.uri: p,
                    vars = isObject(p) ? p.variables: {};
                return plugins.reload(root, arg, uri, { cli_variables: vars })
                    .then(function () { return log('reload', verbose)(arg) });
            } else {
                return plugins[action](root, arg, { cli_variables: variables })
                    .then(function (val) {
                        if (!val || !val.val || !val.uri) {
                            return Q.reject("no plugin changed!");
                        }
                        return val;
                    })
                    .then(actions[action].updateTarifaFile(root))
                    .then(log(action, verbose));
            }
        });
}

function getVariableFromCli(v, rst) {
    var kv = v.split('='),
        res = rst || {};
    if (kv.length > 1) res[kv[0]] = kv[1];
    else throw new Error('Wrong variable format');
    return res;
}

function action (argv) {
    var verbose = false,
        helpPath = path.join(__dirname, 'usage.txt'),
        variables;

    if(argsHelper.checkValidOptions(argv, ['V', 'verbose', 'variable'])) {
        if(argsHelper.matchOption(argv, 'V', 'verbose')) {
            verbose = true;
        }
        if(argsHelper.matchOptionWithValue(argv, null, 'variable')) {
            variables = argv.variable;
            if(variables instanceof Array)
                variables = variables.reduce(function(acc, val) {
                  return getVariableFromCli(val, acc);
                }, {});
            else
                variables = getVariableFromCli(variables);
        }
        if(argv._[0] === 'list' && argsHelper.matchArgumentsCount(argv, [1])){
            return list().then(printPlugins);
        }
        if(Object.keys(actions).indexOf(argv._[0]) > -1 &&
            argsHelper.matchArgumentsCount(argv, [2])) {
                return plugin(argv._[0], argv._[1], variables, verbose);
            }
    }

    return fs.read(helpPath).then(print);
}

action.plugin = plugin;
action.list = list;
module.exports = action;
