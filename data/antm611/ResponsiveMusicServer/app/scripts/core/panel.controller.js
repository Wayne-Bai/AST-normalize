(function() {
    'use strict';

    angular.module('app.core')
        .controller('PanelController', PanelController);

    /* @ngInject */
    function PanelController($scope, $rootScope, SelectableTracksFactory) {
        var ctrl = this;

        $scope.trackArea = new SelectableTracksFactory();
        $scope.trackArea.allTracks = $scope.tracks;

        $rootScope.$on('selectArtist', function($event, artist) {
            ctrl.selectedArtist = artist;
            ctrl.selectedAlbum = null;
        });

        $rootScope.$on('selectAlbum', function($event, album) {
            ctrl.selectedAlbum = album;
        });

        function deselectArtist() {
            ctrl.selectedAlbum = null;
            ctrl.selectedArtist = null;
        }

        function deselectAlbum() {
            ctrl.selectedAlbum = null;
        }

        function deselectTracks($event) {
            $event.stopPropagation();
            $scope.trackArea.clearSelection();
        }

        function isArtistsShown() {
            if ($scope.isDesktop) {
                return true;
            }
            if (!$scope.isPhone) {
                return !(ctrl.selectedAlbum && ctrl.selectedArtist);
            }

            return !ctrl.selectedArtist;
        }

        function isAlbumsShown() {
            if ($scope.isDesktop) {
                return true;
            }
            if (!$scope.isPhone) {
                return true;
            }
            return !!ctrl.selectedArtist && !ctrl.selectedAlbum;
        }

        function isTracksShown() {
            if ($scope.isDesktop) {
                return true;
            }
            if (ctrl.selectedArtist && ctrl.selectedAlbum) {
                return true;
            }

            return false;
        }

        angular.extend(this, {
            selectedArtist: null,
            selectedAlbum: null,
            deselectArtist: deselectArtist,
            deselectAlbum: deselectAlbum,
            deselectTracks: deselectTracks,
            isArtistsShown: isArtistsShown,
            isAlbumsShown: isAlbumsShown,
            isTracksShown: isTracksShown
        });
    }
})();
