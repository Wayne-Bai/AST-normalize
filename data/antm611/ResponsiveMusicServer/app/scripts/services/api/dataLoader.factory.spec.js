/* jshint -W117, -W030 */
describe('app.services.api.DataLoaderFactory', function() {

    var service,
        $rootScope,
        $q;
    var mockRequest = {
        bound: function() {},
        submit: function() {}
    };
    var loadedData = [];

    beforeEach(function() {
        module('app.services.api');

        inject(function($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            var Factory = $injector.get('DataLoaderFactory', {});

            service = new Factory(mockRequest, loadedData, 3);
        });

        spyOn(mockRequest, 'bound').and.callFake(function() {
            return mockRequest;
        });
        loadedData.length = 0;
    });

    describe('fetch', function() {
        it('should log a console warning if fetch is called and the request fails', function() {
            spyOn(console, 'warn');
            spyOn(mockRequest, 'submit').and.callFake(function() {
                return $q.reject('asdufadsgf78asgf8uihjo');
            });

            service.fetch();
            $rootScope.$digest();

            expect(console.warn).toHaveBeenCalledWith('asdufadsgf78asgf8uihjo');
        });

        it('should initiate a new request when fetch is called, and add the data to the given array', function() {
            var mockData = ['test1', 'test2', 'test3'];
            spyOn(mockRequest, 'submit').and.callFake(function() {
                return $q.when(mockData);
            });

            service.fetch();
            $rootScope.$digest();

            expect(mockRequest.bound).toHaveBeenCalledWith(0, 3);
            expect(loadedData).toEqual(mockData);
        });

        it('should initiate a second request when fetch is called again, and append the data to the array', function() {
            var mockData = ['test1', 'test2', 'test3'];
            spyOn(mockRequest, 'submit').and.callFake(function() {
                return $q.when(mockData);
            });

            service.fetch();
            $rootScope.$digest();
            mockData = ['test4', 'test5', 'test6'];
            service.fetch();
            $rootScope.$digest();

            expect(mockRequest.bound).toHaveBeenCalledWith(0, 3);
            expect(loadedData).toEqual(['test1', 'test2', 'test3', 'test4', 'test5', 'test6']);
        });

        it('should not submit a new request if no data is returned in the previous call', function() {
            var mockData = [];
            spyOn(mockRequest, 'submit').and.callFake(function() {
                return $q.when(mockData);
            });

            service.fetch();
            $rootScope.$digest();
            service.fetch();
            $rootScope.$digest();

            expect(mockRequest.submit.calls.count()).toBe(1);
        });

        it('should not submit a new request if another request is still in progress', function() {
            spyOn(mockRequest, 'submit').and.callFake(function() {
                return $q.defer().promise;
            });

            service.fetch();
            $rootScope.$digest();
            service.fetch();
            $rootScope.$digest();

            expect(mockRequest.submit.calls.count()).toBe(1);
        });
    });
});
