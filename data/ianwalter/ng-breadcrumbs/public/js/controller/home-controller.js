define(
  [
    'angular',
    'ng-breadcrumbs',
    'public/js/service/stock-service'
  ],
  function(angular) {
    'use strict';

    angular
      .module('ng-breadcrumbs-demo.home-controller', [
        'ng-breadcrumbs-demo',
        'ng-breadcrumbs-demo.stock-service',
        'ng-breadcrumbs'
      ])
      .controller('HomeController', [
        '$scope',
        'breadcrumbs',
        'StockService',
        function($scope, breadcrumbs, StockService) {
          $scope.breadcrumbs = breadcrumbs;

          $scope.summary = "This is the Home page.";
          $scope.stockService = StockService;
        }
      ]);
  }
);