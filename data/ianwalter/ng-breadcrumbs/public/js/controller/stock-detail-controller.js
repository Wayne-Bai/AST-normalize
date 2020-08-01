define(
  [
    'angular',
    'ng-breadcrumbs',
    'public/js/service/stock-service',
    'public/js/service/investor-service'
  ],
  function(angular) {
    'use strict';

    angular
      .module('ng-breadcrumbs-demo.stock-detail-controller', [
        'ng-breadcrumbs-demo',
        'ng-breadcrumbs-demo.stock-service',
        'ng-breadcrumbs-demo.investor-service',
        'ng-breadcrumbs'
      ])
      .controller('StockDetailController', [
        '$scope',
        '$routeParams',
        '$timeout',
        'breadcrumbs',
        'StockService',
        'InvestorService',
        function($scope, $routeParams, $timeout, breadcrumbs, StockService,
                 InvestorService) {
          $scope.breadcrumbs = breadcrumbs;
          $scope.investorService = InvestorService;
          $scope.stock = StockService.stocks[$routeParams.stock];
          $scope.summary = 'This is the Stock Detail page.';
          breadcrumbs.options = {
            'Stock Detail': $routeParams.stock + ' Details'
          };
        }
      ]);
  }
);