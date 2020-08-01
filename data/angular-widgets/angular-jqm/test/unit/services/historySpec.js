"use strict";
describe('history', function () {
    beforeEach(function() {
        spyOn(window.history, 'go');
    });

    describe('go', function () {
        it('should call window.history.go asynchronously', inject(function ($history, $timeout) {
            // Why asynchronously?
            // Because some browsers (Firefox and IE10) trigger the popstate event in sync,
            // which gets us into trouble for $location.backMode().
            $history.go(10);
            expect(window.history.go).not.toHaveBeenCalled();
            $timeout.flush();
            expect(window.history.go).toHaveBeenCalledWith(10);
        }));
    });

    describe('changing the url programmatically', function () {
        it('should record the initial url if none has been set', function() {
            module(function($provide) {
                $provide.decorator('$browser', function($delegate) {
                    $delegate.$$url = 'http://server/';
                    return $delegate;
                });
            });
            inject(function ($history, $location) {
                expect($history.previousIndex).toBe(-1);
                expect($history.activeIndex).toBe(0);
                expect($history.urlStack[0].url).toEqual('/');
            });
        });

        it('should record the initial url if one has been set', function() {
            module(function($provide) {
                $provide.decorator('$browser', function($delegate) {
                    $delegate.$$url += 'somePath';
                    return $delegate;
                });
            });
            inject(function ($history, $location) {
                expect($history.previousIndex).toBe(-1);
                expect($history.activeIndex).toBe(0);
                expect($history.urlStack[0].url).toEqual('/somePath');
            });
        });

        it('should record successful url changes', inject(function ($history, $location, $rootScope) {
            expect($history.previousIndex).toBe(-1);
            expect($history.activeIndex).toBe(0);
            $location.path("path1");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(1);
            expect($history.previousIndex).toBe(0);
            $location.path("path2");
            $rootScope.$apply();
            expect($history.previousIndex).toBe(1);
            expect($history.activeIndex).toBe(2);
            expect($history.urlStack[0].url).toEqual('/');
            expect($history.urlStack[1].url).toEqual('/path1');
            expect($history.urlStack[2].url).toEqual('/path2');
            expect($history.urlStack.length).toBe(3);
        }));

        it('should remove trailing entries from the urlStack when adding new entries', inject(function ($history, $location, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();

            $history.activeIndex = -1;

            $location.path("path2");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);

            expect($history.urlStack[0].url).toEqual('/path2');
            expect($history.urlStack.length).toBe(1);
        }));

        it('should record multiple url changes to the same url only once', inject(function ($history, $location, $rootScope) {
            $location.path("url1");
            $rootScope.$apply();
            $location.path("url1");
            $rootScope.$apply();
            expect($history.urlStack).toEqual([{url: '/'},{url: '/url1'}]);
        }));

        it('should not record url changes of aborted location changes', inject(function ($history, $location, $rootScope) {
            var oldStack = [].concat($history.urlStack);
            $rootScope.$on('$locationChangeStart', function (event) {
                event.preventDefault();
            });
            $location.path("path1");
            $rootScope.$apply();
            expect($history.urlStack).toEqual(oldStack);
        }));

        it('should replace the last entry if $location.replace is used', inject(function ($history, $location, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();
            expect($history.activeIndex).toBe(1);
            $location.path("path2");
            $location.replace();
            $rootScope.$apply();
            expect($history.previousIndex).toBe(1);
            expect($history.activeIndex).toBe(1);
            expect($history.urlStack[1].url).toEqual('/path2');
            expect($history.urlStack.length).toBe(2);
        }));

        it('should remove trailing entries from the urlStack when replacing the current entry', inject(function ($history, $location, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $history.activeIndex = 0;

            $location.path("path3");
            $location.replace();
            $rootScope.$apply();
            expect($history.activeIndex).toBe(0);
            expect($history.urlStack[0].url).toEqual('/path3');
            expect($history.urlStack.length).toBe(1);
        }));
    });

    describe('hash listening', function () {
        it('should update the activeIndex based on the url', inject(function ($location, $rootScope, $browser, $history) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $browser.$$url = 'http://server/#/path1';
            $browser.poll();

            expect($history.activeIndex).toBe(1);
        }));

        it('should append the url to the stack if the url is not know', inject(function ($browser, $history, $location) {
            $browser.$$url = 'http://server/#/path1';
            $browser.poll();

            expect($history.activeIndex).toBe(0);
            expect($history.urlStack[0].url).toBe('/path1');
        }));

        it('should set previousIndex to the last index before navigation', inject(function ($location, $rootScope, $browser, $history) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $browser.$$url = 'http://server/#/path1';
            $browser.poll();

            expect($history.previousIndex).toBe(2);
        }));
        it('should set previousIndex already for a $routeChangeStart listener', function() {
            module(function($routeProvider) {
                $routeProvider.when('/path1', {
                    template: '<div></div>'
                });
                $routeProvider.when('/path2', {
                    template: '<div></div>'
                });
            });
            inject(function ($location, $rootScope, $browser, $history, $route) {
                var called = false;
                $location.path("path1");
                $rootScope.$apply();
                $location.path("path2");
                $rootScope.$apply();
                $rootScope.$on('$routeChangeStart', function() {
                    called =true;
                    expect($history.previousIndex).toBe(2);
                });
                $browser.$$url = 'http://server/#/path1';
                $browser.poll();
                expect(called).toBe(true);
            });
        });
        it('should not update the history when a browser url change was aborted', inject(function($location, $browser, $history, $rootScope) {
            $location.path("path1");
            $rootScope.$apply();
            $location.path("path2");
            $rootScope.$apply();

            $rootScope.$on("$locationChangeStart", function(event) {
                event.preventDefault();
            });
            $browser.$$url = 'http://server/#/path1';
            $browser.poll();

            expect($history.activeIndex).toBe(2);
            expect($history.previousIndex).toBe(1);

        }));
    });
});