'use strict';
// *****************************************************
// Merge Directive
// *****************************************************

module.directive('mergeButton', ['$HUB', '$stateParams', '$timeout', '$filter', function($HUB, $stateParams, $timeout, $filter) {
    return {
        restrict: 'E',
        templateUrl: '/directives/templates/merge.html',
        scope: {
            permissions: '=',
            pull: '=',
            reposettings: '=',
            status: '='
        },
        link: function(scope, elem, attrs) {

            var text = {
                failure: 'failed',
                pending: 'pending',
                success: 'succeeded'
            };

            if(scope.permissions.push && scope.pull.base.repo.id === scope.pull.head.repo.id) {
                $HUB.call('gitdata', 'getReference', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    ref: 'heads/' + scope.pull.head.ref
                }, function(err, ref) {
                    if(!err) {
                        scope.branch = true;
                    }
                });
            }

            scope.$watch('status', function(status) {
                var state = status ? status.state : null;
                if(state) {
                    scope.status.count = 0;
                    scope.status.text = text[state];
                    scope.status.statuses.forEach(function(status) {
                        if(status.state === state) {
                            scope.status.count++;
                        }
                        // Count error statuses as 'failed' when combined status is 'failure'
                        if(status.state === 'failure' && status === 'errored') {
                            scope.status.count++;
                        }
                    });
                }

                // the default status
                scope.status = scope.status || {
                    state: 'pending',
                    statuses: []
                };
            });


            scope.getStarText = function() {
                if(scope.pull.stars && scope.reposettings.value) {
                    var stars = scope.pull.stars.length;
                    var threshold = scope.reposettings.value.threshold;
                    if(stars < threshold) {
                        return $filter('pluralize')(threshold - stars, 'more ninja star') + ' needed';
                    }
                    return $filter('pluralize')(stars, 'ninja star');
                }
            };

            scope.deleteBranch = function() {
                scope.showConfirmation = false;
                $HUB.call('gitdata', 'deleteReference', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    ref: 'heads/' + scope.pull.head.ref
                }, function(err, result) {
                    if(!err) {
                        scope.branch = false;
                        scope.branchRemoved = true;
                    }
                });
            };

            scope.merge = function() {
                scope.merging = $HUB.call('pullRequests', 'merge', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: $stateParams.number
                });
            };

            //
            // Helper funtion
            //

            scope.confirm = function() {
                scope.showConfirmation = true;
                $timeout(function() {
                    scope.showConfirmation = false;
                }, 10000);
            };
        }
    };
}]);
