EmberDC.GeoChoroplethChartComponent = Ember.Component.extend( EmberDC.ColorMixin, EmberDC.BaseMixin, {
  classNames: ['geo-choropleth-chart'],

  height: 500,

  // overlayGeoJson: function() {
  //   this.geoJSON.features, "state", function (d) {
  //     return d.properties.name;
  //   });
  // },

  /**
   * @method options
   * Method apply the charts options
   */
  options: function() {
    this.chart.options(this.getProperties(
      'group',
      'dimension',
      'width',
      'height',
      'margin',
      'renderTitle',
      'elasticY',
      'elasticX',
      'transitionDuration'
      //'overlayGeoJson'
    ));
  },

  createChart: function() {
    var self = this;

    if(this.get('group') == null || this.get('geoJSON') == null ){
        return false;
    }

    this.chart = dc.geoChoroplethChart('#'+this.$().context.id);

    // this.chart
    //   .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
    //   .colorDomain([0, 6000])
    //   .colorCalculator(function (d) { return d ? self.chart.colors()(d) : '#ccc'; })
    //   .overlayGeoJson(this.geoJSON.features, "state", function (d) {
    //       return d.properties.name;
    //   })
    //   .title(function (d) {
    //       return "State: " + d.key + "\nSightings: " + (d.value ? d.value : 0) + "M";
    //   });

    this.renderChart();

  }.on('didInsertElement').observes('group', 'geoJSON')

});
