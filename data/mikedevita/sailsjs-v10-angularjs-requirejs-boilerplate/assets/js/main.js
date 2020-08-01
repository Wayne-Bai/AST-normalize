/**
 * configure RequireJS
 * prefer named modules to long paths, especially for version mgt
 * or 3rd party libraries
 */
require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    paths: {
        'angular': '../lib/angular/angular',
        'angular.route': '../lib/angular-route/angular-route',
        'angular.resource': '../lib/angular-resource/angular-resource',
        'angular.ui.bootstrap': '../lib/angular-bootstrap/ui-bootstrap-tpls',
        'jquery': '../lib/jquery/jquery',
        'bootstrapJs': '../lib/bootstrap/dist/js/bootstrap',
        'holderJs': '../lib/holderjs/holder'
    },

    /**
     * for libs that either do not support AMD out of the box, or
     * require some fine tuning to dependency mgt'
     */
    shim: {
        'bootstrapJs': ['jquery'],
        'holderJs': ['jquery'],
        'angular': {'exports': 'angular'},
        'angular.route': ['angular'],
        'angular.resource': ['angular'],
        'angular.ui.bootstrap': ['angular']
    }
});

window.name = "NG_DEFER_BOOTSTRAP!";

require([
  'angular',
  'app',
  'routes',
  'jquery',
  'bootstrapJs',
  'holderJs'
  ], function(angular, app) {
    'use strict';
    var $html = angular.element(document.getElementsByTagName('html')[0]);

    angular.element().ready(function() {
      angular.resumeBootstrap([app['name']]);
    });
  }
);