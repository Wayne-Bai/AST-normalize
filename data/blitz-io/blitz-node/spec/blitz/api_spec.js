var testServerPort = 9295,
    helper = require('../helper'),
    api = require('../../lib/blitz/api'),
    credentials = {username: 'user', apiKey: 'key'};

// set environment variable needed for the tests
process.env['BLITZ_API_USER'] = 'user';

describe("API Client", function () {
    var client; 
    
    beforeEach(function () {
        // Test server. Will be handling the requests sent by the tests.
        helper.mockServer.listen(testServerPort);

        client = new api.Client(credentials['username'], credentials['apiKey'],
            'localhost', testServerPort);
    });

    afterEach(function () {
        helper.mockServer.close();
    });

    describe("execute", function () {
        it("should receive ok on queue event", function () {
            var finished = false;
            runs (function() {
                client.execute({key:"value", steps:[{}]}).on('queue', function (result) {
                    expect(result).toBeDefined();
                    expect(result.ok).toBeTruthy(); 
                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });
        });
        
        it("should receive error on server failure", function () {
            var finished = false;
            runs (function() {
                client.execute({key:"value", steps:[{timeout: 1000}]})
                    .on('error', function (result) {
                        expect(result).toBeDefined();
                        expect(result.ok).toBeUndefined(); 
                        expect(result.error).toBeDefined(); 
                        expect(result.error).toEqual('server');
                        finished = true;
                    });
            });
            waitsFor(function () {
                return finished;
            });
        });
    });
    
    describe("login", function () {
        afterEach (function () {
            // after our tests we set the env.var. to the expected values
            process.env['BLITZ_API_USER'] = 'user';
        });
        
        it("should return ok", function () {
            var finished = false;
            runs (function() {
                client.login().on('login', function (result) {
                    expect(result).toBeDefined();
                    expect(result.ok).toBeTruthy(); 
                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });
        });

        it("should return a API key", function () {
            var finished = false;
            runs (function() {
                client.login().on('login', function (result) {
                    expect(result).toBeDefined();
                    expect(result.api_key).toEqual('123');
                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });
        });
        
        it("should fail if user doesn't exists", function () {
            var finished = false;
            process.env['BLITZ_API_USER'] = 'user1';
            runs (function() {
                client.login().on('error', function (result) {
                    expect(result).toBeDefined();
                    expect(result.ok).toBeUndefined(); 
                    expect(result.error).toBeDefined(); 
                    expect(result.error).toEqual('login');
                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });
        });
    });

    describe("about", function () {
        it("should return _id", function () {
            var finished = false;
            runs (function() {
                client.about(function (result) {
                    expect(result).toBeDefined();
                    expect(result['_id']).toBeDefined();
                    expect(result['_id']).toEqual('abc123');
                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });
        });

        it("should return a API key", function () {
            var finished = false;
            runs (function() {
                client.about(function (result) {
                    expect(result).toBeDefined();
                    expect(result.api_key).toEqual('12345678-12345678-12345678-12345678');
                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });
        });
        
        it("should return UUID", function () {
            var finished = false;
            runs (function() {
                client.about(function (result) {
                    expect(result).toBeDefined();
                    expect(result.uuid).toEqual('mu-12345678');
                    finished = true;
                });
            });
            waitsFor(function () {
                return finished;
            });
        });
    });
});
