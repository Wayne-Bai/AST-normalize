'use strict';
angular.module('RedhatAccess.cases').controller('BackEndAttachmentsCtrl', [
    '$scope',
    '$location',
    'TreeViewSelectorData',
    'AttachmentsService',
    'NEW_CASE_CONFIG',
    'EDIT_CASE_CONFIG',
    function ($scope, $location, TreeViewSelectorData, AttachmentsService, NEW_CASE_CONFIG, EDIT_CASE_CONFIG) {
        $scope.name = 'Attachments';
        $scope.attachmentTree = [];
        var newCase = false;
        var editCase = false;
        if ($location.path().indexOf('new') > -1) {
            newCase = true;
        } else {
            editCase = true;
        }
        if (!$scope.rhaDisabled && newCase && NEW_CASE_CONFIG.showServerSideAttachments || !$scope.rhaDisabled && editCase && EDIT_CASE_CONFIG.showServerSideAttachments) {
            var sessionId = $location.search().sessionId;
            TreeViewSelectorData.getTree('attachments', sessionId).then(function (tree) {
                $scope.attachmentTree = tree;
                AttachmentsService.updateBackEndAttachments(tree);
            }, function () {
            });
        }
    }
]);