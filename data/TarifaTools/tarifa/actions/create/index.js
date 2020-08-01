var fs = require('q-io/fs'),
    path = require('path'),
    argsHelper = require('../../lib/helper/args'),
    print = require('../../lib/helper/print');

module.exports = function (argv) {
    if (argsHelper.checkValidOptions(argv, ['V', 'verbose'])) {
        var verbose = argsHelper.matchOption(argv, 'V', 'verbose');
        if (argsHelper.matchArgumentsCount(argv, [0]) || argsHelper.matchCmd(argv._, ['project'])) {
            return require('./project')(verbose);
        }
        if (argsHelper.matchCmd(argv._, ['plugin'])) {
            return require('./plugin')(verbose);
        }
    }
    return fs.read(path.join(__dirname, 'usage.txt')).then(print);
};
