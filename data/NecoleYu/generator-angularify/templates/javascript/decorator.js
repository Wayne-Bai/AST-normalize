'use strict';

/**
 * @ngdoc function
 * @name <%= scriptAppName %>.decorator:<%= classedName %>
 * @description
 * # <%= classedName %>
 * Decorator of the <%= scriptAppName %>
 */
define(['app', 'angular'], function (app, angular) {
    app.config(function ($provide) {
        $provide.decorator('<%= cameledName %>', function ($delegate) {
            // decorate the $delegate
            return $delegate;
        });
    });
    // or use angular.module to create a new module
});
