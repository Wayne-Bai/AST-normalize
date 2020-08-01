var App = App || {};
App.Views = App.Views || {};

(function() {
  'use strict';

  App.Views.LoadingSpinnerView = Backbone.View.extend({

    template: window.JST.loadingSpinner,

    initialize: function(options) {
    },

    render: function() {
      this.$el.html(this.template());

      return this;
    }
  });
})();