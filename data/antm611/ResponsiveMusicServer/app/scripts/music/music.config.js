(function() {
    'use strict';

    angular.module('app.music')
        .config(config);

    /* @ngInject */
    function config($routeProvider) {
        $routeProvider.
            when('/music', {
                controller: 'MusicController',
                controllerAs: 'vm',
                templateUrl: 'scripts/music/music.html',
                title: 'Music'
            }).
            when('/music/search/:type/:search', {
                controller: 'MusicController',
                controllerAs: 'vm',
                templateUrl: 'scripts/music/music.html',
                title: 'Music'
            });
    }
})();
