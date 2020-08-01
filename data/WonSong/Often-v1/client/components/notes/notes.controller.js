/**
 * =========================================================================
 * Update Log
 * =========================================================================
 * On 07/28/2014 by Won Song (http://wys.io)
 * - Created the initial file
 * =========================================================================
 */

'use strict';

angular.module('oftenApp')
  .controller('NotesCtrl', function ($scope, $http, $stateParams) {

    $scope.allNotes = {};
    var noteEndPoint = '/api/notes/';
    if ($stateParams.user !== undefined) {
      noteEndPoint += $stateParams.user;
    }

    function shortenContent(content, read_more_link) {

      var codeRegex = new RegExp(/```/);
      var contentToDisplay = '';
      var match = codeRegex.exec(content);
      contentToDisplay += content.substr(0, match.index + 3);
      var leftOver = content.substr(match.index + 3, content.length);
      contentToDisplay += leftOver.substr(0, leftOver.indexOf('```') + 3);
      contentToDisplay += '\n[Read more...](' + read_more_link + ')';
      return contentToDisplay;

    }

    $http.get(noteEndPoint).success(function (all_notes) {

      $scope.allNotes = all_notes;
      for (var i = 0; i < $scope.allNotes.length; i++) {
        var content = $scope.allNotes[i].content;
        if (content.length > 300) {
          var readMoreLink = '/' + $scope.allNotes[i].author.toLowerCase() + '/' + $scope.allNotes[i].slug;
          content = shortenContent(content, readMoreLink);
        }
        $scope.allNotes[i].convertedContent = marked(content);
      }
      $scope.$emit('iso-option', {masonry: {isFitWidth: true}});
      debounce(function() {
        $('pre code').each(function (i, e) {
          hljs.highlightBlock(e);
        });
      }, 0);

    });

    var filter = function (item, token) {

      var isFound = false;
      Object.keys(item).forEach(function (data) {
        if (item[data].toString().toLowerCase().indexOf(token.toLowerCase()) !== -1) {
          isFound = true;
          return false;
        }
      });
      return isFound;

    };

    function debounce(fn, threshold) {

      var timeout;
      if (timeout) {
        clearTimeout(timeout);
      }
      function delayed() {
        fn();
        timeout = null;
      }

      timeout = setTimeout(delayed, threshold || 100);

    }

    $scope.$on('search-start', function (scope, search_text) {

      $('.match').not('.always-match').removeClass('match');
      debounce(function () {
        for (var i = 0; i < $scope.allNotes.length; i++) {
          var current = $scope.allNotes[i];
          if (filter(current, search_text)) {
            $('*[data-slug="' + current.slug + '"]').addClass('match');
          }
        }

        $scope.$broadcast('iso-option', {filter: '.match'});
      }, 200);

    });

  });