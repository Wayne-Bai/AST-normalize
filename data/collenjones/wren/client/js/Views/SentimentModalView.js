var App = App || {};
App.Views = App.Views || {};

(function() {
  'use strict';

  App.Views.SentimentModalView = Backbone.View.extend({

    template: window.JST.sentimentFeed,

    initialize: function(options) {
      _(this).extend(options);
      this.sentimentCollection = this.sentimentCollection || {};

      this.sentimentModalListView = new App.Views.SentimentModalListView({sentimentCollection: this.sentimentCollection});
    },

    render: function(options) {
      var pointClicked = options.point || {};

      this.$el.html(this.template());
      this.$el.find('.modal').append(this.sentimentModalListView.render({point: pointClicked}).el);
      this.$el.show();

      return this;
    }
  });
})();