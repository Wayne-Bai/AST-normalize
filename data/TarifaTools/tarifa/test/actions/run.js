var should = require('should'),
    Q = require('q'),
    os = require('os'),
    format = require('util').format,
    tmp = require('tmp'),
    setupHelper = require('../helper/setup'),
    isAvailableOnHostSync = require('../../lib/cordova/platforms').isAvailableOnHostSync,
    runAction = require('../../actions/run');

function testRun(projectDefer) {

    describe('tarifa run', function() {

        it(format("tarifa run all dev,stage"), function () {
            this.timeout(0);
            return projectDefer.promise.then(function (rslt) {
                return runAction.runMultiplePlatforms(null, 'dev,stage', false, false);
            });
        });

    });
}

if(module.parent.id.indexOf("mocha.js") > 0) {
    var projectDefer = Q.defer();
    before('create a empty project', setupHelper.createProject(tmp, projectDefer, format('create_project_response_%s.json', os.platform())));
    testRun(projectDefer);
}

module.exports = testRun;
