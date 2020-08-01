define(
  ['angular'],
  function(angular) {
    'use strict';

    angular
      .module('ng-breadcrumbs-demo.stock-service', [])
      .factory('StockService', function() {
        return {
          stocks: {
            'AAPL': {
              symbol: 'AAPL', price: '493.03', revenue: '3,303,403,203'
            },
            'TSLA': {
              symbol: 'TSLA', price: '182.45', revenue: '121,203,542'
            },
            'JNJ': {
              symbol: 'JNJ', price: '93.81', revenue: '308,099,712'
            }
          }
        };
      });
  }
);