/*global define*/

define(function () {
    'use strict';

    function maEditButtonDirective($state) {
        return {
            restrict: 'E',
            scope: {
                'entity': '&',
                'entry': '&',
                'size': '@'
            },
            link: function (scope) {
                scope.gotoEdit = function () {
                    $state.go($state.get('edit'), { entity: scope.entity().name(), id: scope.entry().identifierValue });
                };
            },
            template:
'<a class="btn btn-default" ng-class="size ? \'btn-\' + size : \'\'" ng-click="gotoEdit()">' +
    '<span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>&nbsp;Edit' +
'</a>'
        };
    }

    maEditButtonDirective.$inject = ['$state'];

    return maEditButtonDirective;
});
