/**
 * Controller that logs the user out when loaded
 * @author     Tobias Leugger <vibes@nothing.ch>
 * @module LoginCtrl
 */
angular.module('flokModule').controller('LogoutCtrl', ['sessionService',
    function(sessionService) {
        'use strict';

        // Send logout immediately. Everything else is handled by the session service
        sessionService.logout();
    }
]);
