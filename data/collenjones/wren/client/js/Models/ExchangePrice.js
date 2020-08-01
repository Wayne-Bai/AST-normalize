var App = App || {};
App.Models = App.Models || {};

(function() {
  'use strict';

  App.Models.ExchangePrice = Backbone.Model.extend({
    initialize: function(options) {
      _.extend(this, options);

      this.convertCurrency();
      this.convertTimestamp();

      this.on('change', this.convertCurrency, this);
      this.on('change', this.convertTimestamp, this);
    },

    defaults: {
      value: null,
      timestamp: null,
      site: null,
      currency: null
    },

    convertCurrency: function() {
      if(this.get('currency') !== 1) {
        // Convert currency into USD (Currently only BTC China is not USD)
        this.set('value', this.get('value') / 6.2, {silent: true});
      }
    },

    convertTimestamp: function() {
      if(this.get('timestamp')) {
        this.set('timestamp', this.get('timestamp') * 1000, {silent: true}); // convert to ms for HighStocks
      }
    }
  });
})();
