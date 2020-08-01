(function($){
  App.Models.ConverterData = Backbone.Model.extend({
    
    initialize: function(attributes, options) {
      this.currencies = options.currencies;
      this.setDefaultCurrencies();
    },
    
    defaults: {
      output: 0,
      input: 0
    },
    
    setDefaultCurrencies: function () {
      var dflt = this.currencies.find(function (currency) {
        return currency.get('code') === 'USD';
      }).toJSON();
      
      this.set({to: dflt, from: dflt});
    },
    
    format: function (num, addPoint) {
      num += '';
      num = num.replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
      return num + (addPoint ? '.' : '');
    },
    
    rate: function () {
      return this.get('from').rate * (1 / this.get('to').rate);
    },
    
    getOutput: function (input) {
      return input ? (input * this.rate()).toFixed(2) : 0;
    }
    
  });
}).call(this, this.Zepto);