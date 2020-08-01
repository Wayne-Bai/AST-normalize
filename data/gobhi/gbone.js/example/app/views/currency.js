(function($){
  App.Views.Currency = Backbone.View.extend({
    
    className: 'item',
    
    events: {
      'tap': 'click'
    },
    
    initialize: function (options) {
      _.bindAll(this);
      this.render();
    },

    render: function () {
      $(this.el).html(JST.currency(this.model.toJSON()));
      return this;
    },
    
    click: function () {
      var currency = {},
          converterData = this.parent.converterData;
      
      if (this.parent.currencyChange) {
        currency[this.parent.currencyChange] = this.model.toJSON();
        converterData.set(currency, {silent: true});
        converterData.set({
          output: converterData.getOutput(converterData.get('input'))
        });
      }
      
      this.parent.stage.router.navigate('global-stage/currency-converter', true);
    },

  });
}).call(this, this.Zepto);