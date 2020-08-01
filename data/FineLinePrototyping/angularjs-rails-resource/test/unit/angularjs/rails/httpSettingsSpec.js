describe('http setting', function () {
    'use strict';

    beforeEach(module('rails'));

    var $httpBackend, $rootScope, factory,
        config = {
            url: '/test',
            name: 'test'
        };

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, railsResourceFactory) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        factory = railsResourceFactory;
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function headerComparison(expectedHeaders) {
        return function(headers) {
            var matches = true;

            angular.forEach(expectedHeaders, function (value, key) {
                if (headers[key] !== value) {
                    matches = false;
                }
            });

            return matches;
        };
    }

    describe('$post/$put/$patch', function() {

        it('passes resourceConfigOverrides to $http', function() {
            var methods = ['$post', '$put', '$patch'],
                Resource = factory(config),
                overrides = {baz: 'qux'};
            spyOn(Resource, '$http');
            angular.forEach(methods, function(method) {
                Resource[method](null, null, overrides);
                expect(Resource.$http.mostRecentCall.args[2]).toEqual(overrides);
            });
            expect(Resource.$http.calls.length).toBe(methods.length);
        });

    });

    describe('$http', function() {

        describe('when config includes skipRequestProcessing', function() {

            it('skips all "before" interceptors', function() {
                var phases = ['beforeRequest', 'beforeRequestWrapping', 'request'],
                    interceptors = {},
                    Resource = factory(config),
                    data = {foo: 'bar'},
                    httpConfig = {method: 'POST', url: config.url, data: data};

                angular.forEach(phases, function(phase) {
                    interceptors[phase] = jasmine.createSpy(phase);
                    Resource.intercept(phase, interceptors[phase]);
                });

                $httpBackend.expectPOST(config.url, data).respond(200);
                Resource.$http(httpConfig, null, {skipRequestProcessing: true});
                $httpBackend.flush();

                angular.forEach(phases, function(phase) {
                    expect(interceptors[phase]).not.toHaveBeenCalled();
                });
            });

            it('does not skip "after" interceptors', function() {
                var phases = ['beforeResponse', 'beforeResponseDeserialize', 'response', 'afterResponse'],
                    interceptors = {},
                    Resource = factory(config),
                    data = {foo: 'bar'},
                    httpConfig = {method: 'POST', url: config.url, data: data};

                angular.forEach(phases, function(phase) {
                    interceptors[phase] = jasmine.createSpy(phase);
                    Resource.intercept(phase, interceptors[phase]);
                });

                $httpBackend.expectPOST(config.url, data).respond(200);
                Resource.$http(httpConfig, null, {skipRequestProcessing: true});
                $httpBackend.flush();

                angular.forEach(phases, function(phase) {
                    expect(interceptors[phase]).toHaveBeenCalled();
                });
            });

            it('deserializes the response into a Resource object', function() {

                var promise,
                    result,
                    data = {foo: 'bar'},
                    httpConfig = {method: 'POST', url: config.url, data: data},
                    Resource = factory(config);

                $httpBackend.expectPOST(config.url, data).respond(200, data);
                promise = Resource.$http(httpConfig, null, {skipRequestProcessing: true});
                promise.then(function(response) {
                    result = response;
                });
                $httpBackend.flush();

                expect(result).toBeInstanceOf(Resource);
                expect(result).toEqualData(data);

            });

        });

    });

    it('query should pass default $http options', inject(function($httpBackend) {
        var promise, result, Test;

        $httpBackend.expectGET('/test', headerComparison({'Accept': 'application/json'})).respond(200, {test: {abc: 'xyz'}});

        Test = factory(config);
        expect(promise = Test.query()).toBeDefined();

        promise.then(function (response) {
            result = response;
        });

        $httpBackend.flush();
    }));

    it('query should allow custom Accept', inject(function($httpBackend) {
        var promise, result, Test;

        $httpBackend.expectGET('/test', headerComparison({'Accept': 'text/plain'})).respond(200, {test: {abc: 'xyz'}});

        Test = factory(angular.extend(angular.copy(config), {httpConfig: {headers: {'Accept': 'text/plain'}}}));
        expect(promise = Test.query()).toBeDefined();

        promise.then(function (response) {
            result = response;
        });

        $httpBackend.flush();
    }));

    it('query should allow custom header', inject(function($httpBackend) {
        var promise, result, Test;

        $httpBackend.expectGET('/test', headerComparison({'Accept': 'application/json', 'X-Test': 'test'})).respond(200, {test: {abc: 'xyz'}});

        Test = factory(angular.extend(angular.copy(config), {httpConfig: {headers: {'X-Test': 'test'}}}));
        expect(promise = Test.query()).toBeDefined();

        promise.then(function (response) {
            result = response;
        });

        $httpBackend.flush();
    }));


    it('query should keep originalData in response if we setted the resource option : fullResponse', inject(function($httpBackend) {
        var promise, result, Test;

        var originalResponse = {tests: [{id: 1, name:"test_1"}, {id:2, name: "test_2"}], page: 1}

        $httpBackend.expectGET('/test', headerComparison({'Accept': 'application/json'})).respond(200, originalResponse);

        Test = factory(angular.extend(angular.copy(config), { fullResponse: true}));
        expect(promise = Test.query()).toBeDefined();

        promise.then(function (response) {
            result = response;
            expect(response.originalData).toEqual(originalResponse);
        });

        $httpBackend.flush();
    }));


    it('get should pass default $http options', inject(function($httpBackend) {
        var promise, result, Test;

        $httpBackend.expectGET('/test/123', headerComparison({'Accept': 'application/json'})).respond(200, {test: {abc: 'xyz'}});

        Test = factory(config);
        expect(promise = Test.get(123)).toBeDefined();

        promise.then(function (response) {
            result = response;
        });

        $httpBackend.flush();
    }));

    it('get should allow custom Accept', inject(function($httpBackend) {
        var promise, result, Test;

        $httpBackend.expectGET('/test/123', headerComparison({'Accept': 'text/plain'})).respond(200, {test: {abc: 'xyz'}});

        Test = factory(angular.extend(angular.copy(config), {httpConfig: {headers: {'Accept': 'text/plain'}}}));
        expect(promise = Test.get(123)).toBeDefined();

        promise.then(function (response) {
            result = response;
        });

        $httpBackend.flush();
    }));

    it('get should allow custom header', inject(function($httpBackend) {
        var promise, result, Test;

        $httpBackend.expectGET('/test/123', headerComparison({'Accept': 'application/json', 'X-Test': 'test'})).respond(200, {test: {abc: 'xyz'}});

        Test = factory(angular.extend(angular.copy(config), {httpConfig: {headers: {'X-Test': 'test'}}}));
        expect(promise = Test.get(123)).toBeDefined();

        promise.then(function (response) {
            result = response;
        });

        $httpBackend.flush();
    }));

    it('create should pass default $http options', inject(function($httpBackend) {
        var Test;

        $httpBackend.expectPOST('/test', {test: {xyz: '123'}}, headerComparison({'Accept': 'application/json', 'Content-Type': 'application/json'})).respond(200, {test: {id: 123, xyz: '123'}});

        Test = factory(config);
        var test = new Test();
        test.xyz = '123';
        test.create();

        $httpBackend.flush();
    }));

    it('create should allow custom Accept', inject(function($httpBackend) {
        var Test;

        $httpBackend.expectPOST('/test', {test: {xyz: '123'}}, headerComparison({'Accept': 'text/plain'})).respond(200, {test: {id: 123, xyz: '123'}});

        Test = factory(angular.extend(angular.copy(config), {httpConfig: {headers: {'Accept': 'text/plain'}}}));
        var test = new Test();
        test.xyz = '123';
        test.create();

        $httpBackend.flush();
    }));

    it('create should allow custom header', inject(function($httpBackend) {
        var Test;

        $httpBackend.expectPOST('/test', {test: {xyz: '123'}}, headerComparison({'Accept': 'application/json', 'X-Test': 'test'})).respond(200, {test: {id: 123, xyz: '123'}});

        Test = factory(angular.extend(angular.copy(config), {httpConfig: {headers: {'X-Test': 'test'}}}));
        var test = new Test();
        test.xyz = '123';
        test.create();

        $httpBackend.flush();
    }));

    it('update should pass default $http options', inject(function($httpBackend) {
        var Test;

        $httpBackend.expectPUT('/test/123', {test: {id: 123, xyz: '123'}}, headerComparison({'Accept': 'application/json', 'Content-Type': 'application/json'})).respond(200, {test: {id: 123, xyz: '123'}});

        Test = factory(config);
        var test = new Test();
        test.id = 123;
        test.xyz = '123';
        test.update();

        $httpBackend.flush();
    }));

    it('update should allow custom Accept', inject(function($httpBackend) {
        var Test;

        $httpBackend.expectPUT('/test/123', {test: {id: 123, xyz: '123'}}, headerComparison({'Accept': 'text/plain'})).respond(200, {test: {id: 123, xyz: '123'}});

        Test = factory(angular.extend(angular.copy(config), {httpConfig: {headers: {'Accept': 'text/plain'}}}));
        var test = new Test();
        test.id = 123;
        test.xyz = '123';
        test.update();

        $httpBackend.flush();
    }));

    it('update should allow custom header', inject(function($httpBackend) {
        var Test;

        $httpBackend.expectPUT('/test/123', {test: {id: 123, xyz: '123'}}, headerComparison({'Accept': 'application/json', 'X-Test': 'test'})).respond(200, {test: {id: 123, xyz: '123'}});

        Test = factory(angular.extend(angular.copy(config), {httpConfig: {headers: {'X-Test': 'test'}}}));
        var test = new Test();
        test.id = 123;
        test.xyz = '123';
        test.update();

        $httpBackend.flush();
    }));

    it('$patch should pass default $http options', inject(function($httpBackend) {
        var Test;

        $httpBackend.expectPATCH('/test/123', {test: {id: 123, xyz: '123'}}, headerComparison({'Accept': 'application/json', 'Content-Type': 'application/json'})).respond(200, {test: {id: 123, xyz: '123'}});

        Test = factory(config);
        Test.$patch('/test/123', {id: 123, xyz: '123'});

        $httpBackend.flush();
    }));

});
