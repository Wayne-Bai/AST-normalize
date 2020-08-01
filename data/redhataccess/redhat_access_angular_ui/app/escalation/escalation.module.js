'use strict';
angular.module('RedhatAccess.escalation', [
    'RedhatAccess.template',
    'RedhatAccess.security',
    'RedhatAccess.ui-utils',
    'RedhatAccess.common',
    'RedhatAccess.header'
]).config([
    '$stateProvider',
    function($stateProvider) {
        $stateProvider.state('partnerEscalation', {
            url: '/partnerEscalationRequest',
            controller: 'EscalationRequest',
            templateUrl: 'escalation/views/partnerEscalation.html'
        });
        $stateProvider.state('iceEscalation', {
            url: '/iceEscalationRequest',
            controller: 'EscalationRequest',
            templateUrl: 'escalation/views/iceEscalation.html'
        });
    }
]).constant('ESCALATION_TYPE', {
    partner: 'Partner Escalation',
    ice: 'ICE',
    sales: 'Sales Escalation'
});