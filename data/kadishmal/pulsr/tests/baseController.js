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
    describe('baseController', function (){
        it('should return 200 statusCode for root page request within 15s', function (done){
            // set timeout to 15s
            this.timeout(15000);

            requirejs(['http', 'conf'], function (http, conf) {
                http.get('http://' + conf.get('app.domains.www'), function (response) {
                    response.should.have.status(200);
                    done();
                });
            });
        });
    });
});