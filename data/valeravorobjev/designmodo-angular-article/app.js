var app = angular.module('angular-article', ['ngRoute', 'route-segment', 'view-segment']);
app.config(function ($routeSegmentProvider) {
    $routeSegmentProvider.options.autoLoadTemplates = true;

    $routeSegmentProvider
        .when('/', 'products')
        .when('/products', 'products')
        .when('/futures', 'futures')
        .when('/futures/alert', 'futures.alert')
        .when('/futures/file', 'futures.file')
        .when('/futures/checkbox', 'futures.checkbox')
        .when('/futures/modal', 'futures.modal')
        .when('/futures/taginput', 'futures.taginput')
        .when('/futures/spinner', 'futures.spinner')
        .when('/futures/slider', 'futures.slider')

        .segment('products', {
            default: true,
            templateUrl: 'templates/products.html',
            controller: 'ProductsController'
        })

        .segment('futures', {
            templateUrl: 'templates/futures.html',
            controller: 'FuturesController'
        })
        .within()
        .segment('alert', {
            default: true,
            templateUrl: 'templates/alert.html',
            controller: 'DirectivesController'
        })
        .segment('file', {
            templateUrl: 'templates/file.html',
            controller: 'DirectivesController'
        })
        .segment('checkbox', {
            templateUrl: 'templates/checkbox.html'
        })
        .segment('modal', {
            templateUrl: 'templates/modal.html',
            controller: 'DirectivesController'
        })
        .segment('taginput', {
            templateUrl: 'templates/taginput.html',
            controller: 'DirectivesController'
        })
        .segment('spinner', {
            templateUrl: 'templates/spinner.html',
            controller: 'DirectivesController'
        })
        .segment('slider', {
            templateUrl: 'templates/slider.html',
            controller: 'DirectivesController'
        })
});