define
(
    [
        'mustard/makeModuleLazyLoadable',
        'app/app.settings',
        'app/app.config'
    ],
    function(makeModuleLazyLoadable, settings, config)
    {
        var app = angular.module('app', config.modules);

        app.value('settings', settings);

        app.config(function($locationProvider)
        {
            $locationProvider.html5Mode(true);
        });

        makeModuleLazyLoadable('app');

        app.config(function($urlRouterProvider)
        {
            if(settings.defaultRoutePath !== undefined)
            {
                $urlRouterProvider.otherwise(settings.defaultRoutePath);
            }
        });
    }
);
