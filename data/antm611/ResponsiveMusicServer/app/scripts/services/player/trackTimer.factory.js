(function() {
    'use strict';

    angular.module('app.services.player')
        .factory('trackTimerFactory', trackTimerFactory);

    /* @ngInject */
    function trackTimerFactory() {
        return function () {
            var callback;
            var duration;
            var counter;
            var isPaused;
            var intervalTimer;

            function timerTick() {
                if (!isPaused && ++counter >= duration) {
                    clearInterval(intervalTimer);
                    callback();
                    timerCancel();
                }
            }

            function timerCancel() {
                clearInterval(intervalTimer);
                callback = false;
                duration = 0;
                counter = 0;
                isPaused = true;
            }

            return {
                reset: function(newCallback, newDuration) {
                    timerCancel();
                    isPaused = false;
                    counter = 0;
                    callback = newCallback;
                    duration = newDuration;
                    intervalTimer = setInterval(timerTick, 1000);
                },
                cancel: function() {
                    timerCancel();
                },
                pause: function() {
                    isPaused = true;
                },
                resume: function() {
                    isPaused = false;
                }
            };
        };
    }
})();
