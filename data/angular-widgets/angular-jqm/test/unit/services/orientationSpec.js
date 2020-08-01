"use strict";
describe('orientation', function() {
    var $window, eventListeners;
    beforeEach(function() {
        eventListeners = {};
        $window = angular.mock.createMockWindow();
        $window.addEventListener = function(eventName, callback) {
            var listeners = eventListeners[eventName] = eventListeners[eventName] || [];
            listeners.push(callback);
        };
        module(function($provide) {
            $provide.value('$window', $window);
        });
    });
    function triggerWindowEvent(eventName) {
        angular.forEach(eventListeners[eventName], function(listener) {
            listener();
        });
    }

    it('should return "horizontal" if width is bigger than height', inject(function($orientation) {
        $window.innerHeight = 400;
        $window.innerWidth = 500;
        expect($orientation()).toBe('horizontal');
    }));
    it('should return "vertical" if width is bigger than height', inject(function($orientation) {
        $window.innerHeight = 500;
        $window.innerWidth = 400;
        expect($orientation()).toBe('vertical');
    }));
    it('should return "vertical" if height is very small to compensate angular window size bug', inject(function($orientation) {
        // In case of the Android screen size bug we assume
        // vertical, as the keyboard takes the whole screen
        // when horizontal.
        // See http://stackoverflow.com/questions/7958527/jquery-mobile-footer-or-viewport-size-wrong-after-android-keyboard-show
        // and http://android-developers.blogspot.mx/2009/04/updating-applications-for-on-screen.html
        $window.innerHeight = 190;
        $window.innerWidth = 400;
        expect($orientation()).toBe('vertical');
    }));
    it('listens for resize events and triggers $orientationChanged and $digest if the orientation changed', inject(function($orientation, $rootScope) {
        var $orientationChanged = jasmine.createSpy('$orientationChanged'),
            digestCounter = 0;
        $rootScope.$on('$orientationChanged', $orientationChanged);
        $rootScope.$watch(function() {
            digestCounter++;
        });
        $window.innerHeight = 500;
        $window.innerWidth = 400;
        expect($orientationChanged.callCount).toBe(0);
        expect(digestCounter).toBe(0);
        triggerWindowEvent("resize");
        expect($orientationChanged.callCount).toBe(1);
        expect(digestCounter).toBe(2);
        triggerWindowEvent("resize");
        expect($orientationChanged.callCount).toBe(1);
        expect(digestCounter).toBe(2);
        $window.innerHeight = 400;
        $window.innerWidth = 500;
        triggerWindowEvent("resize");
        expect($orientationChanged.callCount).toBe(2);
        expect(digestCounter).toBe(3);
    }));
    it('triggers $anchorScroll if the orientation changed', function() {
        var $anchorScroll = jasmine.createSpy('$anchorScroll');
        module(function($provide) {
            $provide.value('$anchorScroll', $anchorScroll);
        });
        inject(function($orientation) {
            expect($anchorScroll).not.toHaveBeenCalled();
            triggerWindowEvent("resize");
            expect($anchorScroll).toHaveBeenCalled();
        });
    });
});