var testServerPort = 9295,
    helper = require('../helper'),
    Sprint = require('../../lib/blitz/sprint'),
    credentials = {username: 'user', apiKey: 'key', host: 'localhost', port: 9295};

describe("Sprint", function () {
    var sprint;
    
    beforeEach(function() {
        // Test server. Will be handling the requests sent by the tests.
        helper.mockServer.listen(testServerPort);

        sprint = new Sprint();
    });
    
    afterEach(function () {
        helper.mockServer.close();
    });

    it("should have a Result object", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1'}]
            }).execute().on('complete', function (data) {
                expect(data.region).toBeDefined();
                expect(data.duration).toBeDefined();
                expect(data.steps).toBeDefined();
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });

    it("should have a Steps inside Result", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1'}]
            }).execute().on('complete', function (data) {
                var step = data.steps[0];
                expect(step.duration).toBeDefined();
                expect(step.connect).toBeDefined();
                expect(step.request).toBeDefined();
                expect(step.response).toBeDefined();
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });

    it("should have a Request object inside Step", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1'}]
            }).execute().on('complete', function (data) {
                var request = data.steps[0].request;
                expect(request.line).toBeDefined();
                expect(request.method).toBeDefined();
                expect(request.url).toBeDefined();
                expect(request.headers).toBeDefined();
                expect(request.content).toBeDefined();
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });

    it("should have a Response object inside Step", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1'}]
            }).execute().on('complete', function (data) {
                var response = data.steps[0].response;
                expect(response.line).toBeDefined();
                expect(response.message).toBeDefined();
                expect(response.status).toBeDefined();
                expect(response.headers).toBeDefined();
                expect(response.content).toBeDefined();
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });

    it("should match the expected Result data", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1'}]
            }).execute().on('complete', function (data) {
                expect(data.region).toEqual('california');
                expect(data.duration).toEqual(10);
                expect(data.steps.length).toEqual(2);
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });
    
    it("should match the expected Step data", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1'}]
            }).execute().on('complete', function (data) {
                var step = data.steps[0];
                expect(step.connect).toEqual(1);
                expect(step.duration).toEqual(5);
                expect(step.request).toBeDefined();
                expect(step.response).toBeDefined();
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });

    it("should match the expected Request data", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1'}]
            }).execute().on('complete', function (data) {
                var request = data.steps[0].request;
                expect(request.method).toEqual('GET');
                expect(request.url).toEqual('http://localhost:9295');
                expect(request.content).toEqual('content');
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });

    it("should match the expected Response data", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1'}]
            }).execute().on('complete', function (data) {
                var response = data.steps[0].response;
                expect(response.message).toEqual('message');
                expect(response.status).toEqual(200);
                expect(response.content).toEqual('content');
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });
    
    it("should receive the result while running", function () {
        var finished = false;
        runs (function() {
            sprint.create(credentials, {
                steps: [{url: 'http://127.0.0.1', user: 'b123'}]
            }).execute().on('status', function (data) {
                var response = data.steps[0].response;
                expect(response.status).toEqual(200);
                finished = true;
            });
        });
        waitsFor(function () {
            return finished;
        });
    });
});
