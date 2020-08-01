var should = require('should'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    tmp = require('tmp'),
    ConfigXml = require('../../lib/xml/config.xml');

describe('[shared] read/write cordova\'s config.xml', function() {

    it('parse config.xml', function () {
        var file = path.join(__dirname, '../fixtures/config.xml');
        return ConfigXml.get(file).then(function (result) {

            result.id.should.equal('tools.tarifa.fixture');
            result.version.should.equal('0.0.0');
            result.author_name.should.equal('paul');
            result.author_email.should.equal('paul@42loops.com');
            result.author_href.should.equal('http://42loops.com');
            result.description.should.equal('toto');
            result.access[0].should.equal('*');
            result.access[1].should.have.properties({ origin: 'tel:', external: true });

            result.preference.DisallowOverscroll.should.equal('true');
            result.preference.KeyboardDisplayRequiresUserAction.should.equal('false');
            result.preference.KeyboardDisplayRequiresUserAction.should.equal('false');
            result.preference.EnableViewportScale.should.equal('false');
        });
    });

    it('change id', function () {
        var file = path.join(__dirname, '../fixtures/config.xml'),
            xml = fs.readFileSync(file, 'utf-8'),
            defer = Q.defer();

        tmp.file(function (err, p, fd) {
            if (err) throw err;
            fs.writeFileSync(p, xml);
            return ConfigXml.set(p, 'tools.tarifa.test').then(function () {
                return ConfigXml.get(p).then(function (result) {
                    result.id.should.equal('tools.tarifa.test');
                    tmp.setGracefulCleanup();
                    defer.resolve();
                }).done();
            });
        });
        return defer.promise;
    });

    it('change id, version, author, description, preference, access', function () {
        var file = path.join(__dirname, '../fixtures/config.xml'),
            xml = fs.readFileSync(file, 'utf-8'),
            defer = Q.defer();

        tmp.file(function (err, p, fd) {
            if (err) throw err;
            fs.writeFileSync(p, xml);

            var pref = {
                DisallowOverscroll: false,
                KeyboardDisplayRequiresUserAction:false,
                'newpreference':'what you want...',
                'newpreference2':'what you want...2'
            };

            return ConfigXml.set(
                p,
                'tools.tarifa.oops',
                '1.0.0',
                'pp',
                'pp@42loops.com',
                'http://tarifa.tools',
                'this is a test',
                pref,
                ['tarifa.tools', 'zengularity.com', { origin: 'tel:', external: true }]
            ).then(function () {
                return ConfigXml.get(p).then(function (result) {
                    result.id.should.equal('tools.tarifa.oops');
                    result.version.should.equal('1.0.0');
                    result.author_name.should.equal('pp');
                    result.author_email.should.equal('pp@42loops.com');
                    result.author_href.should.equal('http://tarifa.tools');
                    result.description.should.equal('this is a test');
                    result.access.should.containEql('tarifa.tools');
                    result.access.should.containEql('zengularity.com');
                    result.access.should.containEql({ origin: 'tel:', external: true });
                    result.access.should.have.length(3);
                    result.preference.DisallowOverscroll.should.equal('false');
                    result.preference.KeyboardDisplayRequiresUserAction.should.equal('false');
                    result.preference.newpreference.should.equal('what you want...');
                    result.preference.newpreference2.should.equal('what you want...2');
                    tmp.setGracefulCleanup();
                    defer.resolve();
                }).done();
            });
        });
        return defer.promise;
    });

});
