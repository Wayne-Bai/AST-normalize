var App = App || {};
App.Views = App.Views || {};

(function() {
  'use strict';

  App.Views.AppView = Backbone.View.extend({
    el: $('body'),

    initialize: function() {
      var self = this;

      // Initialize Collections
      this.exchangeCollection = new App.Collections.Exchanges();
      this.tweetCollection    = new App.Collections.Tweets();

      // Initialize SubViews
      this.navBarView  = new App.Views.HeaderView();
      this.sideBarView = new App.Views.SideBarView({exchangeCollection: this.exchangeCollection, tweetCollection: this.tweetCollection});
      this.footerView  = new App.Views.FooterView();
      this.chartView   = new App.Views.ChartView({
        exchangeCollection: this.exchangeCollection,
        tweetCollection:    this.tweetCollection
      });
      this.loadingSpinnerView = new App.Views.LoadingSpinnerView();
      this.sentimentModalView = new App.Views.SentimentModalView({sentimentCollection: this.tweetCollection});
      this.errorView          = new App.Views.ErrorView();

      // Fetch Collection Data
      this.fetchCollectionData(function() {
        // Disable loadingSpinner and show Chart upon completion
        self.toggleLoadingSpinner();
        self.chartView.render();
      });

      this.render();

      // Event Listeners
      this.chartView.on('fetchError', this.showErrorView, this);
      this.chartView.on('showSideBar', this.showSideBar, this);
      this.chartView.on('showSentimentModal', this.showSentimentModal, this);
      this.sideBarView.on('rerenderChart', this.chartView.toggleSeriesVisibility, this.chartView);
    },

    render: function() {
      this.$el.find('section.main').prepend(this.navBarView.render().el);
      this.$el.find('section.main').append(this.footerView.render().el);
      this.$el.find('section.main .container').append(this.loadingSpinnerView.render().el);
      this.$el.find('section.main .container').append(this.sideBarView.render().el);

      // Move header up (out of window)
      $('.topbar').css({top: '-1000px'});
      $('footer.pageFooter').css({bottom: '-1000px'});
      $('.topbar').animate({top: '0px'}, 1000);
      $('footer.pageFooter').animate({bottom: '0px'}, 1000);
    },

    fetchCollectionData: function(callback) {
      var self = this;

      // Fetch Collection Data
      this.exchangeCollection.fetch()
        .done(function() {
          var callbacksRemaining = self.exchangeCollection.length + 1; // +1 accounts for tweets

          // Fetch Tweets
          self.tweetCollection.fetch()
            .done(function() {
              callbacksRemaining--;
              if(callbacksRemaining === 0){
                callback && callback();
              }
            })
            .error(function(err) {
              self.showErrorView(err);
            });

          // Fetch Exchange Prices
          self.exchangeCollection.each(function(exchange, index) {
            exchange.set('prices', new App.Collections.ExchangePrices({id: exchange.get('id')}));
            var exchangePriceCollection = exchange.get('prices');

            exchangePriceCollection.fetch()
              .done(function(data) {
                callbacksRemaining--;

                if(callbacksRemaining === 0){
                  callback && callback();
                }
              })
              .error(function(err) {
                self.showErrorView(err);
              });
          });
        })
        .error(function(err) {
          self.showErrorView(err);
        });
    },

    toggleLoadingSpinner: function() {
      this.loadingSpinnerView.$el.toggleClass('hidden');
    },

    showSideBar: function() {
      this.sideBarView.$el.removeClass('hidden');
    },

    showErrorView: function(err) {
      this.sideBarView.$el.hide();
      this.chartView.$el.hide();
      this.loadingSpinnerView.$el.hide();

      this.$el.find('section.main .container').append(this.errorView.render({error: err}).el);
    },

    showSentimentModal: function(options) {
      var self = this;

      this.$el.prepend(this.sentimentModalView.render({point: options}).el);

      $('body').on('click', function(e) {
        e.stopPropagation();
        self.sentimentModalView.$el.hide();
        $('body').off('click');
      });
    }
  });
})();