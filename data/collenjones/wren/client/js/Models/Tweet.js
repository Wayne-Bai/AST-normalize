var App = App || {};
App.Models = App.Models || {};

(function() {
  'use strict';

  App.Models.Tweet = Backbone.Model.extend({
    initialize: function(options) {
      _.extend(this, options);

      this.set('timestamp', this.get('timestamp') * 1000); // convert to ms for HighStocks
    },

    defaults: {
      id: null,
      username: null,
      text: null,
      sentiment: null,
      /*jshint camelcase: false */
      tweet_id: null
    }
  });
})();
