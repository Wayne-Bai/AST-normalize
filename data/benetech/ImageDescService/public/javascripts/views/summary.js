//Question view.
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/javascripts/templates/summary.html'
], function($, _, Backbone, summaryTemplate) {
  var SummaryView = Backbone.View.extend({
    //div.
    tagName:  "div",
    
    // Render the recommendation.
    render: function() {
      var compiledTemplate = _.template( summaryTemplate, {questions: this.collection.models});
      this.$el.html(compiledTemplate);
      return this;
    }
  });
  return SummaryView;
});
