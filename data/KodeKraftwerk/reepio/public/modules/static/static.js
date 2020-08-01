/**
 * Copyright (C) 2014 reep.io 
 * KodeKraftwerk (https://github.com/KodeKraftwerk/)
 *
 * reep.io source - In-browser peer-to-peer file transfer and streaming 
 * made easy
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
(function() {
    'use strict';

    angular.module('static')

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/about', {
                    templateUrl: 'modules/static/page-about.html',
                    controller: 'StaticCtrl'
                })
                .when('/imprint', {
                    templateUrl: 'modules/static/page-imprint.html',
                    controller: 'StaticCtrl'
                })
                .when('/privacy', {
                    templateUrl: 'modules/static/page-privacy.html',
                    controller: 'StaticCtrl'
                })
                .when('/incompatible', {
                    templateUrl: 'modules/static/page-incompatible.html',
                    controller: 'StaticCtrl'
                });

        }])

        .controller('StaticCtrl', ['$analytics', '$location', function($analytics, $location) {
            $analytics.pageTrack($location.path());
        }]);
})();