(function() {
    'use strict';

    angular.module('app.components.navbar')
        .directive('amNavbar', navbar);

    /* @ngInject */
    function navbar() {
        return {
            scope: {},
            restrict: 'A',
            replace: true,
            templateUrl: 'scripts/components/navbar/navbar.html',
            controller: 'NavbarController',
            controllerAs: 'vm'
        };
    }
})();
