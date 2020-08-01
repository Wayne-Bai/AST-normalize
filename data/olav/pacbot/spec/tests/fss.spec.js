var fs = require('fs');
var fss = require('../../lib/fss');
var pacbot = require('../../lib/pacbot');

exports.canIngoreUnprocessableFiles = function (test) {
    var config = pacbot.config({
        appdir: 'spec/cases/filetypes'
    });
    fss.resetDir(config.pubdir);
    test.ok( fss.isProcessableFile('spec/cases/filetypes/_a'), '_a');
    test.ok( fss.isProcessableFile('spec/cases/filetypes/a'),  'a');
    test.ok( fss.isProcessableFile('spec/cases/filetypes/.a'), '.a');
    test.ok(!fss.isProcessableFile('spec/cases/filetypes'),    'dir');
    test.done();
};

exports.canCopyZipFiles = function (test) {
    var config = pacbot.config({
        appdir: 'spec/cases/filetypes',
        pubdir: 'spec/out/filetypes',
        config: false,
        layout: false,
        build: true,
        dev: false
    });

    fss.resetDir(config.pubdir);
    pacbot.build();

    test.ok(fs.existsSync('spec/out/filetypes/foo.html'));
    test.ok(fs.lstatSync('spec/out/filetypes/Archive.zip').isFile());
    test.ok(fs.lstatSync('spec/out/filetypes/test/test.zip').isFile());
    test.done();
};
