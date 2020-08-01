var pacbot = require('../../lib/pacbot');
var fss = require('../../lib/fss');
var sync = require('../../lib/sync');

exports.setUp = function (callback) {
    pacbot.config({
        sync:   true,
        appdir: 'spec/cases/deploy/content',
        pubdir: 'spec/out/deploy/public',
        remote: 'spec/out/deploy/remote',
        layout: false
    });
    callback();
};

exports.canDeployOneFile = function (test) {
    pacbot.build();
    sync.perform(function () {
        test.equal('1', fss.readFile('spec/out/deploy/remote/1.html'));
        test.done();
    });
};
