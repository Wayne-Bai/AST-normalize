var should = require('should'),
    Q = require('q'),
    os = require('os'),
    format = require('util').format,
    tmp = require('tmp'),
    path = require('path'),
    setupHelper = require('../helper/setup'),
    cordovaPlatforms = require('../../lib/cordova/platforms'),
    platformVersion = require('../../lib/cordova/version'),
    settings = require('../../lib/settings'),
    platformAction = require('../../actions/platform'),
    updateAction = require('../../actions/update');

function testUpdate(projectDefer) {

    describe('tarifa update', function() {

        var availablePlatforms = settings.platforms.filter(cordovaPlatforms.isAvailableOnHostSync);

        it('remove all platforms', function () {
            this.timeout(0);
            return projectDefer.promise.then(function () {
                return platformAction.list().then(function (rslt) {
                    return rslt.reduce(function (promise, p) {
                        return promise.then(function () {
                            return platformAction.platform('remove', p, false);
                        });
                    }, Q.resolve());
                });
            });
        });

        availablePlatforms.forEach(function (platform) {
            var versions = require(path.join(__dirname, '../../lib/platforms', platform, 'package.json')).versions;
            versions.forEach(function (version) {

                it(format('tarifa platform add %s@%s', platform, version), function () {
                    this.timeout(0);
                    return projectDefer.promise.then(function (rslt) {
                        return platformAction.platform('add', format('%s@%s', platform, version), true);
                    });
                });

                it('tarifa update', function () {
                    this.timeout(0);
                    return projectDefer.promise.then(function () {
                        return updateAction.update(false, true);
                    });
                });

                it(format('tarifa platform remove %s', platform), function () {
                    this.timeout(0);
                    return projectDefer.promise.then(function (rslt) {
                        return platformAction.platform('remove', platform, false);
                    });
                });
            });
        });
    });
}

if(module.parent.id.indexOf("mocha.js") > 0) {
    var projectDefer = Q.defer();
    before('create a empty project', setupHelper.createProject(tmp, projectDefer, format('create_project_response_%s.json', os.platform())));
    testUpdate(projectDefer);
}

module.exports = testUpdate;
