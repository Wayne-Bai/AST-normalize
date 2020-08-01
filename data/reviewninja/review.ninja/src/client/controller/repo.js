'use strict';
// *****************************************************
// Repo Controller
//
// tmpl: repo/repo.html
// path: /:user/:repo
// resolve: repo
// *****************************************************

module.controller('RepoCtrl', ['$scope', '$stateParams', '$modal', '$timeout', '$HUB', '$RPC', 'repo', 'socket', 'Pull',
    function($scope, $stateParams, $modal, $timeout, $HUB, $RPC, repo, socket, Pull) {

        // get the repo
        $scope.repo = repo;

        // set the default state
        $scope.type = 'open';

        //
        // Helper functions
        //

        var setStatus = function(pull) {
            pull.status = $HUB.call('statuses', 'getCombined', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                sha: pull.head.sha
            });
        };

        // get the open pull requests
        $scope.open = $HUB.wrap('pullRequests', 'getAll', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            state: 'open',
            per_page: 10
        }, function(err, res) {
            if(!err) {
                res.affix.forEach(function(pull) {
                    pull = Pull.milestone(pull) && Pull.stars(pull) && Pull.commentsCount(pull);
                    setStatus(pull);
                });
            }
        });

        // get the closed pull requests
        $scope.closed = $HUB.wrap('pullRequests', 'getAll', {
            user: $stateParams.user,
            repo: $stateParams.repo,
            state: 'closed',
            per_page: 10
        }, function(err, res) {
            if(!err) {
                res.affix.forEach(function(pull) {
                    pull = Pull.milestone(pull) && Pull.stars(pull) && Pull.commentsCount(pull);
                    setStatus(pull);
                });
            }
        });

        // get the collaborators
        $scope.collaborators = $HUB.wrap('repos', 'getCollaborators', {
            user: $stateParams.user,
            repo: $stateParams.repo
        });

        //
        // Websockets
        //

        socket.on($stateParams.user + ':' + $stateParams.repo + ':' + 'pull_request', function(args) {
            if(args.action === 'opened') {
                $HUB.wrap('pullRequests', 'get', {
                    user: $stateParams.user,
                    repo: $stateParams.repo,
                    number: args.number
                }, function(err, pull) {
                    if(!err) {
                        pull = Pull.milestone(pull.value) && Pull.stars(pull.value) && Pull.commentsCount(pull.value);
                        $scope.open.value.unshift(pull);
                    }
                });
            }
        });

        //
        // Actions
        //

        $scope.badge = function() {
            var modal = $modal.open({
                templateUrl: '/modals/templates/badge.html',
                controller: 'BadgeCtrl'
            });
        };

        $scope.invite = function(collaborator, email) {
            collaborator.invite = $RPC.call('invitation', 'invite', {
                user: $stateParams.user,
                repo: $stateParams.repo,
                invitee: collaborator.login,
                email: email
            });
        };

        //
        // UI text
        //

         var singleStatusText = function(pull) {
             return pull.status.value.statuses[0].description;
         };

         var multipleStatusText = function(pull) {
             var successCount = 0;
             pull.status.value.statuses.forEach(function(status) {
                 if(status.state === 'success') {
                     successCount++;
                 }
             });
             return successCount + ' / ' + pull.status.value.total_count + ' checks OK';
         };

         $scope.statusTooltip = function(pull) {
             if(pull.status && pull.status.value) {
                 if(pull.status.value.total_count === 1) {
                     return singleStatusText(pull);
                 }
                 if(pull.status.value.total_count > 1) {
                     return multipleStatusText(pull);
                 }
             }
         };

        $scope.getStarUsers = function(pull) {
            if(pull.stars && pull.stars.length) {
                return pull.stars.slice(0, 3).map(function(star) {
                    return star.name;
                }).join(', ') + (pull.stars.length > 3 ? ' and ' + (pull.stars.length - 3) + ' others starred' : ' starred');
            }
            return 'No stars';
        };
    }
]);
