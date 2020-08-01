EmberDC.ScatterPlotComponent = Ember.Component.extend( EmberDC.CoordinateGridMixin, {
  classNames: ['scatter-plot'],

  createChart: function() {

    if(this.get('group') == null){
        return false;
    }

    this.chart = dc.scatterPlot('#'+this.$().context.id);

    this.renderChart();

  }.on('didInsertElement').observes('group')

});