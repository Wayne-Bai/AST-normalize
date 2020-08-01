var should = require("should"),
    requirejs = require('requirejs');

requirejs.config({
    baseUrl: 'pulsr',
    nodeRequire: require,
    paths: {
        conf: '../conf/conf'
    }
});

describe('Pulsr', function (){
    describe('fileHandler', function (){
        it('should return 403 statusCode for direct directory access requests within 20s', function (done){
            // set timeout to 20s
            this.timeout(20000);

            requirejs(['async', 'http', 'conf'], function (async, http, conf) {
                var restrictedDirs = ['img', 'js', 'less', 'pulsr', 'controller', 'nonExistingDir', 'js/bootstrap', 'less/foundation', 'assets'];

                function requestDir(dirName, done) {
                    http.get('http://' + conf.get('app.domains.static') + '/' + dirName, function (response) {
                        response.should.have.status(403);
                        done();
                    });
                }

                async.forEach(restrictedDirs, requestDir, function (err) {
                    done();
                });
            });
        });

        it('should return 403 statusCode for restricted directory access requests within 20s', function (done){
            // set timeout to 20s
            this.timeout(20000);

            requirejs(['async', 'http', 'conf'], function (async, http, conf) {
                var restrictedDirs = ['pulsr/conf.js', 'pagelets/ga/ga.js', 'contents/404.md', 'controllers/api.js', 'node_modules/bin/docco', 'nonExistingDir', 'tests/baseController.js', 'views/layout.hb', '../aboveRootNonExistDir', 'app.js', '.travis.yml', '.gitignore', 'Makefile', 'package.json', 'assets'];

                function requestDir(dirName, done) {
                    http.get('http://' + conf.get('app.domains.static') + '/' + dirName, function (response) {
                        response.should.have.status(403);
                        done();
                    });
                }

                async.forEach(restrictedDirs, requestDir, function (err) {
                    done();
                });
            });
        });

        it('should return 200 statusCode for plain text requests located in the root directory.', function (done){
            // set timeout to 20s
            this.timeout(20000);

            requirejs(['async', 'http', 'conf'], function (async, http, conf) {
                var rootDirFiles = ['robots.txt', 'humans.txt', 'README.md', 'CHANGELOG.md'];

                function sendRequest(filePath, done) {
                    http.get('http://' + conf.get('app.domains.static') + '/' + filePath, function (response) {
                        response.should.have.status(200);
                        done();
                    });
                }

                async.forEach(rootDirFiles, sendRequest, function (err) {
                    done();
                });
            });
        });
    });
});