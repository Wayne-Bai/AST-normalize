(function() {
    'use strict';

    angular.module('app.components.misc')
        .directive('amAudioSource', audioSource);

    /* @ngInject */
    function audioSource($rootScope, playerService) {
        function link(scope, element) {
            var audio = element[0];

            function bindWithApply(bindFunction) {
                return function() {
                    scope.$apply(bindFunction);
                };
            }

            element.on('play', bindWithApply(function() {
                playerService.audioHooks.play();
            }));

            element.on('pause', bindWithApply(function() {
                playerService.audioHooks.pause();
            }));

            element.on('volumechange', bindWithApply(function() {
                playerService.audioHooks.volumeChange(audio.volume);
            }));

            element.on('timeupdate', bindWithApply(function() {
                if (audio.duration > 0) {
                    playerService.audioHooks.positionChange(audio.currentTime / audio.duration);
                } else {
                    playerService.audioHooks.positionChange(0);
                }
            }));

            element.on('ended', bindWithApply(function() {
                playerService.audioHooks.ended();
            }));

            $rootScope.$on('playerService.volumeUpdate', function(e, volume) {
                audio.volume = volume;
            });

            $rootScope.$on('playerService.positionUpdate', function(e, position) {
                if (audio.readyState) {
                    audio.currentTime = audio.duration * position;
                }
            });

            $rootScope.$on('playerService.play', function() {
                audio.play();
            });

            $rootScope.$on('playerService.pause', function() {
                audio.pause();
            });

            $rootScope.$on('playerService.playNew', function(e, data) {
                audio.pause();
                audio.src = data.src;
                audio.type = data.type;
                if (data.src) {
                    audio.play();
                } else {
                    playerService.audioHooks.pause();
                    playerService.audioHooks.positionChange(0);
                }
            });
        }

        return {
            restrict: 'A',
            link: link
        };
    }
})();
