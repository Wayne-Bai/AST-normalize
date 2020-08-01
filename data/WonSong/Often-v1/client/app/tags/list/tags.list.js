/**
 * =========================================================================
 * Update Log
 * =========================================================================
 * On 08/04/2014 by Won Song (http://wys.io)
 * - Created the initial file
 * =========================================================================
 */

'use strict';

angular.module('oftenApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('TagsListView', {
        url: '/tags',
        templateUrl: 'app/tags/list/tags.list.html',
        controller: 'TagsListCtrl'
      });
  });