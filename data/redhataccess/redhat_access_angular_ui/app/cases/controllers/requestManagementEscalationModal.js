'use strict';
/*global $ */
/*jshint camelcase: false*/
angular.module('RedhatAccess.cases').controller('RequestManagementEscalationModal', [
    '$scope',
    '$modalInstance',
    'AlertService',
    'CaseService',
    'strataService',
    'securityService',
    '$q',
    '$stateParams',
    'RHAUtils',
    function ($scope, $modalInstance, AlertService, CaseService, strataService,securityService, $q, $stateParams, RHAUtils) {
        $scope.CaseService = CaseService;
        $scope.submittingRequest = false;
        if(RHAUtils.isNotEmpty(CaseService.commentText)){
            $scope.disableSubmitRequest = false;
            CaseService.escalationCommentText = CaseService.commentText;
        }else{
            $scope.disableSubmitRequest = true;
        }
        $scope.submitRequestClick = angular.bind($scope, function (commentText) {
            $scope.submittingRequest = true;
            var fullComment = 'Request Management Escalation: ' + commentText;
            var onSuccess  = function (response) {
                var caseJSON = { "escalated": true };
                var updateCase = strataService.cases.put(CaseService.kase.case_number, caseJSON);
                updateCase.then(function (response) {
                }, function (error) {
                    AlertService.addStrataErrorMessage(error);
                });

                CaseService.populateComments($stateParams.id).then(function (comments) {
                    $scope.closeModal();
                    if(CaseService.localStorageCache)
                    {
                        CaseService.localStorageCache.remove(CaseService.kase.case_number+securityService.loginStatus.authedUser.sso_username);
                    }
                    $scope.submittingRequest = false;
                    CaseService.draftSaved = false;
                    CaseService.draftComment = undefined;
                    CaseService.commentText = undefined;
                });
            };
            var onError = function (error) {
                AlertService.addStrataErrorMessage(error);
            };

            if(CaseService.localStorageCache) {
                if(CaseService.draftCommentOnServerExists)
                {
                    strataService.cases.comments.put(CaseService.kase.case_number,  fullComment, false, true, CaseService.draftComment.id).then(onSuccess, onError);
                }
                else {
                    strataService.cases.comments.post(CaseService.kase.case_number,  fullComment, true, false).then(onSuccess, onError);
                }
            }
            else {
                if (RHAUtils.isNotEmpty(CaseService.draftComment)) {
                    strataService.cases.comments.put(CaseService.kase.case_number,  fullComment, false, true, CaseService.draftComment.id).then(onSuccess, onError);
                } else {
                    strataService.cases.comments.post(CaseService.kase.case_number,  fullComment, true, false).then(onSuccess, onError);
                }
            }


        });
        $scope.closeModal = function () {
            CaseService.escalationCommentText = undefined;
            $modalInstance.close();
        };
        $scope.onNewEscalationComment = function () {
            if (RHAUtils.isNotEmpty(CaseService.escalationCommentText) && !$scope.submittingRequest) {
                $scope.disableSubmitRequest = false;
            } else if (RHAUtils.isEmpty(CaseService.escalationCommentText)) {
                $scope.disableSubmitRequest = true;
            }
        };
    }
]);

