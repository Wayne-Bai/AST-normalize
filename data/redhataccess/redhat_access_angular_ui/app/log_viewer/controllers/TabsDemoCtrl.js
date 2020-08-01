'use strict';
angular.module('RedhatAccess.logViewer').controller('TabsDemoCtrl', [
    '$rootScope',
    '$scope',
    '$http',
    '$location',
    'files',
    'accordian',
    'SearchResultsService',
    'securityService',
    'AlertService',
    'LOGVIEWER_EVENTS',
    function ($rootScope, $scope, $http, $location, files, accordian, SearchResultsService, securityService, AlertService, LOGVIEWER_EVENTS) {
        $scope.tabs = [];
        $scope.isLoading = false;
        $scope.$watch(function () {
            return files.getFileClicked().check;
        }, function () {
            if (files.getFileClicked().check && files.selectedFile !== undefined) {
                var tab = {};
                if (files.selectedHost !== undefined) {
                    tab.longTitle = files.selectedHost + ':';
                } else {
                    tab.longTitle = '';
                }
                tab.longTitle = tab.longTitle.concat(files.selectedFile);
                var splitFileName = files.selectedFile.split('/');
                var fileName = splitFileName[splitFileName.length - 1];
                if (files.selectedHost !== undefined) {
                    tab.shortTitle = files.selectedHost + ':';
                } else {
                    tab.shortTitle = '';
                }
                tab.shortTitle = tab.shortTitle.concat(fileName);
                tab.active = true;
                $scope.tabs.push(tab);
                $scope.isLoading = true;
                files.setActiveTab(tab);
                files.setFileClicked(false);
            }
        });
        $scope.$watch(function () {
            return files.file;
        }, function () {
            if (files.file && files.activeTab) {
                files.activeTab.content = files.file;
                $scope.isLoading = false;
                files.file = undefined;
            }
        });
        $scope.$watch(function () {
            return SearchResultsService.searchInProgress.value;
        }, function () {
            if (SearchResultsService.searchInProgress.value === true) {
                $scope.$parent.isDisabled = true;
            } else if (SearchResultsService.searchInProgress.value === false && $scope.$parent.textSelected === true) {
                $scope.$parent.isDisabled = false;
            }
        });
        $scope.removeTab = function (index) {
            $scope.tabs.splice(index, 1);
            if ($scope.tabs.length < 1) {
                $rootScope.$broadcast(LOGVIEWER_EVENTS.allTabsClosed);
            }
        };
        $scope.checked = false;
        // This will be
        // binded using the
        // ps-open attribute
        $scope.diagnoseText = function () {
            //$scope.isDisabled = true;
            var text = strata.utils.getSelectedText();
            securityService.validateLogin(true).then(function () {
                //Removed in refactor, no loger exists.  Think it hides tool tip??
                //this.tt_isOpen = false;
                if (!$scope.$parent.showSolutions) {
                    $scope.$parent.showSolutions = !$scope.$parent.showSolutions;
                }
                if (text !== '') {
                    $scope.checked = !$scope.checked;
                    SearchResultsService.diagnose(text, 5);
                }
            });    // this.tt_isOpen = false;
                   // if (!$scope.$parent.solutionsToggle) {
                   // 	$scope.$parent.solutionsToggle = !$scope.$parent.solutionsToggle;
                   // }
                   // var text = strata.utils.getSelectedText();
                   // if (text != "") {
                   // 	$scope.checked = !$scope.checked;
                   // 	SearchResultsService.diagnose(text, 5);
                   // }
                   //$scope.sleep(5000, $scope.checkTextSelection);
        };
        $scope.refreshTab = function (index) {
            var sessionId = $location.search().sessionId;
            var userId = $location.search().userId;
            var fileNameForRefresh = this.$parent.tab.longTitle;
            var hostForRefresh = null;
            var splitNameForRefresh = fileNameForRefresh.split(':');
            if (splitNameForRefresh[0] && splitNameForRefresh[1]) {
                $scope.isLoading = true;
                hostForRefresh = splitNameForRefresh[0];
                fileNameForRefresh = splitNameForRefresh[1];
                $http({
                    method: 'GET',
                    url: 'logs?sessionId=' + encodeURIComponent(sessionId) + '&userId=' + encodeURIComponent(userId) + '&path=' + fileNameForRefresh + '&machine=' + hostForRefresh
                }).success(function (data, status, headers, config) {
                    $scope.isLoading = false;
                    $scope.tabs[index].content = data;
                }).error(function (data, status, headers, config) {
                    $scope.isLoading = false;
                    AlertService.addDangerMessage(data);
                });
            }
        };
    }
]);