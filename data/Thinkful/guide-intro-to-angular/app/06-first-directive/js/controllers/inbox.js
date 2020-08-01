/**
 * Controller: InboxCtrl
 */
angular.module('EmailApp')
  .controller('InboxCtrl',
    function InboxCtrl ( $scope ) {
      'use strict';
      $scope.meta = {
        title: "My Inbox"
      };
    });