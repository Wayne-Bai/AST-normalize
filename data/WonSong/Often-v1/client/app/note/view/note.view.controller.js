/**
 * =========================================================================
 * Update Log
 * =========================================================================
 * On 07/28/2014 by Won Song (http://wys.io)
 * - Created the initial file
 * =========================================================================
 */

'use strict';

/**
 * @class NoteCreateCtrl
 *
 * Handles the creation of notes
 */
angular.module('oftenApp')
  .controller('NoteViewCtrl', function ($scope, $http, $stateParams, Auth) {

    marked.setOptions({
      renderer: new marked.Renderer(),
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false
    });

    $scope.note = {};

    $http.get('/api/notes/' + $stateParams.user.toLowerCase() + '/' + $stateParams.slug)
      .success(function (note) {
        $scope.note = note;
        $scope.convertedContent = marked(note.content);
        setTimeout(function () {
          $('pre code').each(function (i, e) {
            hljs.highlightBlock(e)
          });
        }, 0);
      }).error(function () {

      });

  });