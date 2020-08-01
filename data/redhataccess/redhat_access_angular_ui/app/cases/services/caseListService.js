'use strict';
angular.module('RedhatAccess.cases').service('CaseListService', [function () {
        this.cases = [];
        this.defineCases = function (cases) {
            this.cases = cases;
        };
    }]);