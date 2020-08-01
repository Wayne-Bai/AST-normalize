define([
    'app/states/home/home.state.config',
    'mustard/versionedUrlFor',
    'mustard/stateDependencyResolverFor'
],
function(stateConfig, versionedUrlFor, stateDependencyResolverFor)
{
    var module = angular.module('app');

    module.config(function($stateProvider)
    {
        $stateProvider.state('home', {
            url: '/',
            templateUrl: versionedUrlFor('/app/states/home/home.html'),
            resolve: stateDependencyResolverFor(stateConfig)
        });
    });
});