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
    describe('navigation pagelet', function (){
        it('should be displayed on the front page', function (done){
            // set timeout to 20s
            this.timeout(20000);

            requirejs(['async', 'http', 'conf'], function (async, http, conf) {
                http.get('http://' + conf.get('app.domains.static'), function (response) {
                    var body = '';

                    response.on('data', function (chunk) {
                        body += chunk;
                    })

                    response.on('end', function () {
                        body.should.match(/<ul class="left">/);
                        body.should.match(/<ul class="inline-list right">/);

                        done();
                    });

                    response.should.have.status(200);
                });
            });
        });
    });
});