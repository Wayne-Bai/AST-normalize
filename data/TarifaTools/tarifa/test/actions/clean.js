var should = require('should'),
    Q = require('q'),
    os = require('os'),
    format = require('util').format,
    tmp = require('tmp'),
    setupHelper = require('../helper/setup'),
    isAvailableOnHostSync = require('../../lib/cordova/platforms').isAvailableOnHostSync,
    settings = require('../../lib/settings'),
    cleanAction = require('../../actions/clean');

function testClean(projectDefer) {

    describe('tarifa clean', function() {

        settings.platforms.forEach(function (p) {

            if(isAvailableOnHostSync(p)) {
                it(format('tarifa clean %s', p), function () {
                    this.timeout(0);
                    return projectDefer.promise.then(function (rslt) {
                        return cleanAction.clean(p, false);
                    });
                });
            }

        });

        it('tarifa clean', function () {
            this.timeout(0);
            return projectDefer.promise.then(function (rslt) {
                return cleanAction.clean(null, false);
            });
        });

    });
}

if(module.parent.id.indexOf("mocha.js") > 0) {
    var projectDefer = Q.defer();
    before('create a empty project', setupHelper.createProject(tmp, projectDefer, format('create_project_response_%s.json', os.platform())));
    testClean(projectDefer);
}

module.exports = testClean;
