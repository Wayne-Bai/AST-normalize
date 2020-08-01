'use strict';
// *****************************************************
// Graph Directive
// *****************************************************

module.directive('onboard', ['$rootScope', '$stateParams', '$RPC', '$timeout', 'socket',
    function($rootScope, $stateParams, $RPC, $timeout, socket) {
        return {
            restrict: 'E',
            templateUrl: '/directives/templates/onboard.html',
            link: function(scope, elem, attrs) {
                scope.actions = [
                    {key: 'user:addRepo', text: 'Add repo'},
                    {key: 'pullRequests:get', text: 'View pull request', elementclass: 'ob-pull', transition: 'wobble-vertical'},
                    {key: 'issues:add', text: 'Open issue', elementclass: 'ob-create', transition: 'wobble-vertical'},
                    {key: 'issues:closed', text: 'Close issue', elementclass: 'ob-close', transition: 'wobble-vertical'},
                    {key: 'star:add', text: 'Add ninja star', elementclass: 'ob-star', transition: 'rotate'},
                    {key: 'pullRequests:merge', text: 'Merge pull request', elementclass: 'ob-merge', transition: 'wobble-vertical'}
                ];

                var getActions = function() {
                    $RPC.call('onboard', 'getactions', {
                        user: $stateParams.user,
                        repo: $stateParams.repo
                    }, function(err, actions) {
                        if(!err) {
                            var completed = 0;
                            scope.actions.forEach(function(action) {
                                action.val = actions.value[action.key];
                                if(action.val) {
                                    completed = completed + 1;
                                }
                            });
                            scope.complete = (scope.actions.length === completed);
                        }
                    });
                };

                scope.addClass = function(name, transition) {
                    $('.' + name).first().addClass(transition);
                };

                scope.removeClass = function(name, transition) {
                    $('.' + name).first().removeClass(transition);
                };

                getActions();

                $rootScope.promise.then(function(user) {
                    socket.on('action:' + user.value.id, function() {
                        getActions();
                    });
                });
            }
        };
    }
]);
