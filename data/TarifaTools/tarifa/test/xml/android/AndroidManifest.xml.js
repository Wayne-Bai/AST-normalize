var should = require('should'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    tmp = require('tmp'),
    AndroidManifestXml = require('../../../lib/platforms/android/lib/xml/AndroidManifest.xml');

describe('[android] replacing stuff in AndroidManifest.xml', function(){

    it('find activity name and id', function () {
        var file = path.join(__dirname, '../../fixtures/AndroidManifest.xml');
        return AndroidManifestXml.getActivityInfo(file).then(function (result) {
            result.name.should.equal('Ohhhhhh');
            result.id.should.equal('com.fortytwoloops.tarifa');
        });
    });

    it('change activity name and id', function () {
        var xml = fs.readFileSync(path.join(__dirname, '../../fixtures/AndroidManifest.xml'), 'utf-8'),
            defer = Q.defer();

        tmp.file(function (err, p, fd) {
            if (err) throw err;
            fs.writeFileSync(p, xml);
            return AndroidManifestXml.setActivityInfo(p, 'Wrooooooommmm', 'com.tarifa.test').then(function () {
                return AndroidManifestXml.getActivityInfo(p).then(function (result) {
                    result.name.should.equal('Wrooooooommmm');
                    result.id.should.equal('com.tarifa.test');
                    tmp.setGracefulCleanup();
                    defer.resolve();
                }).done();
            });
        });

        return defer.promise;
    });
});
