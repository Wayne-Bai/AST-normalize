/*
 * Copyright (c) 2014 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * The StoryBoard project submodule handles most activity surrounding the
 * creation and management of projects.
 */
angular.module('sb.projects',
    ['ui.router', 'sb.services', 'sb.util', 'sb.auth'])
    .config(function ($stateProvider, $urlRouterProvider, SessionResolver,
                      PermissionResolver) {
        'use strict';

        // Routing Defaults.
        $urlRouterProvider.when('/project', '/project/list');

        // Set our page routes.
        $stateProvider
            .state('sb.project', {
                abstract: true,
                url: '/project',
                template: '<div ui-view></div>',
                resolve: {
                    isSuperuser: PermissionResolver
                        .resolvePermission('is_superuser', true)
                }
            })
            .state('sb.project.list', {
                url: '/list',
                templateUrl: 'app/projects/template/list.html',
                controller: 'ProjectListController'
            })
            .state('sb.project.detail', {
                url: '/{id:[0-9]+}',
                templateUrl: 'app/projects/template/detail.html',
                controller: 'ProjectDetailController'
            })
            .state('sb.project.new', {
                url: '/new',
                templateUrl: 'app/projects/template/new.html',
                controller: 'ProjectNewController',
                resolve: {
                    isLoggedIn: SessionResolver.requireLoggedIn,
                    isSuperuser: PermissionResolver
                        .requirePermission('is_superuser', true)
                }
            });
    })
;
