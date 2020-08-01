var pacbot = require('../../lib/pacbot');
var fss = require('../../lib/fss');
var fs = require('fs');

var contains = function (test, supstr, substr) {
    test.ok(supstr.indexOf(substr) === 0);
};

exports.canCompileLessCSS = function (test) {
    pacbot.config({
        config: 'spec/cases/less/pacbot.js',
        appdir: 'spec/cases/less',
        pubdir: 'spec/out/less'
    });
    pacbot.build(function () {
        var html = 'spec/out/less/index.html';
        var less = 'spec/out/less/assets/packed/common.css';
        var link = '<link rel="stylesheet" href="/assets/packed/common.css?v=';
        var css  = '*{color:red}*{color:blue}';

        test.ok(fss.exists(html));
        contains(test, fss.readFile(html), link);

        fs.watchFile(less, {
            interval: 10
        }, function() {
            fs.unwatchFile(less);
            test.ok(fss.exists(less));
            test.equal(fss.readFile(less), css);
            test.done();
        });
    });
};
