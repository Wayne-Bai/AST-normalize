angular.module('adaptv.adaptStrapDocs')
  .controller('infiniteDropdownCtrl', ['$scope',
    function ($scope) {

      // ========== Shared AJAX config Implementation ========== //
      $scope.artistsAjaxConfig = {
        url: 'http://ws.audioscrobbler.com/2.0/',
        method: 'JSONP',
        params: {
          api_key: '9b0cdcf446cc96dea3e747787ad23575',
          artist: '50 cent',
          method: 'artist.search',
          format: 'json'
        },
        paginationConfig: {
          response: {
            totalItems: 'results.opensearch:totalResults',
            itemsLocation: 'results.artistmatches.artist'
          }
        }
      };
      $scope.artistClicked = function (artist) {
        alert(artist.name);
      };

      $scope.selectedArtists = [];
      $scope.selectedArtist = [];

      $scope.artistListTemplate = '<em>{{ item.name }}</em>';
      $scope.localSelectedArtists = [];
      $scope.localArtistsData = [
        { 'name': '50 Cent' },
        { 'name': '50 Cent Feat. Justin Timberlake' },
        { 'name': 'Jeremih feat. 50 Cent' },
        { 'name': '50 Cent, Eminem, Ca$his & Lloyd Banks' },
        { 'name': 'Mann Feat. 50 Cent' },
        { 'name': '50 Cent feat. Mobb Deep' },
        { 'name': '50 Cent F. Justin Timberlake and Timbaland' },
        { 'name': 'Mobb Deep Feat. 50 Cent & Nate Dogg' },
        { 'name': '50 Cent feat. Justin Timberlake & Timbaland' },
        { 'name': '50 Cent Feat. Young Buck' },
        { 'name': '50 Cent Feat. Akon' },
        { 'name': 'Mobb Deep feat. 50 Cent' },
        { 'name': '50 Cent feat. Fergie' },
        { 'name': '50 Cent vs. Beyonce vs. Mary J. Blige' },
        { 'name': '50 Cent feat. Ne-Yo' },
        { 'name': '50 Cent ft Justin Timberlake' }
      ];
    }]);
