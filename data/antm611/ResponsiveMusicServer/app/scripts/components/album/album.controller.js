(function() {
    'use strict';

    angular.module('app.components.album')
        .controller('AlbumController', AlbumController);

    /* @ngInject */
    function AlbumController($scope, playerService) {
        var ctrl = this;

        function play() {
            playerService.playlist.clear();
            playerService.playlist.addTracksByAlbum(ctrl.album.ID).then(function() {
                playerService.controlHooks.nextTrack();
            });
        }

        function add() {
            playerService.playlist.addTracksByAlbum(ctrl.album.ID);
        }

        function select() {
            $scope.$emit('selectAlbum', ctrl.album);
        }

        angular.extend(this, {
            play: play,
            add: add,
            select: select
        });
    }
})();
