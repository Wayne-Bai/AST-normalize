(function($){
  App = {
    
    Views: {},
    Routers: {},
    Models: {},
    Collections: {},
    Helpers: {
      Transitions: {}
    },
    
    init: function () {
      var $body = $('body'),
          currency = App.Models.Currency.extend(),
          converterData,
          currencies = new App.Collections.Currencies(),
          globalRouter = new App.Routers.GlobalRouter(),
          globalStage,
          currencyConverter,
          currencyPicker,
          currencyInfo;
          
      // Disable click events.
      $body.bind('click', function (event) {
        event.preventDefault();
      });
      
      $body.bind('orientationchange', function (event) {
        var orientation = 'portrait';
        if (Math.abs(window.orientation) === 90) orientation = 'landscape'
        
        $body.removeClass('portrait')
             .removeClass('landscape')
             .addClass(orientation)
             .trigger('turn', {orientation: orientation});
      });
       
      currencies.fetch({
        error: function () {
          throw new Error('Error loading currencies.');
        }
      });
      
      currencies.bind('reset', function () {
        
        // Model for the currency converter.  This simply acts as a state machine.
        converterData = new App.Models.ConverterData(null, { currencies: currencies });
        
        // Create the global Stage.
        globalStage = new App.Views.GlobalStage({
          name: 'global-stage',
          router: globalRouter,
          el: 'body'
        });
        
        // Currency converter Panel.
        currencyConverter = new App.Views.CurrencyConverter({
          name: 'currency-converter',
          model: converterData,
          stage: globalStage
        });
        
        // Currency picker Panel.
        currencyPicker = new App.Views.CurrencyPicker({
          collection: currencies,
          converterData: converterData,
          name: 'currency-picker',
          title: 'Currencies',
          stage: globalStage
        });
        
        // Application info Panel.
        currencyInfo =  new App.Views.CurrencyInfo({
          name: 'currency-info',
          stage: globalStage
        });

        // Setup additional transitions.
        currencyConverter.addTransition(App.Helpers.Transitions.upDown);
        currencyPicker.addTransition(App.Helpers.Transitions.upDown);
        currencyInfo.addTransition(App.Helpers.Transitions.upDown);

        // Setup the route for `currencyConverter`.
        currencyConverter.routePanel(function (trans) {
          // Hide the children initially to avoid flicker.
          $(currencyConverter.el).children().hide();
          currencyConverter.active({trans: trans || 'left'});
        });
        
        // Setup the route for `currencyPicker`.
        currencyPicker.routePanel(function (trans) {
          // Hide the children initially to avoid flicker.
          $(currencyPicker.el).children().hide();
          currencyPicker.active({trans: trans || 'right'});
        });
        
        // Setup the route for `currencyInfo`.
        currencyInfo.routePanel(function (trans) {
          currencyInfo.active({trans: trans});
        });

        Backbone.history.start();
      });
      
    }
  };
}).call(this, this.Zepto);