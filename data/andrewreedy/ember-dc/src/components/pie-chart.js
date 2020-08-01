EmberDC.PieChartComponent = Ember.Component.extend( EmberDC.CapMixin, EmberDC.ColorMixin, EmberDC.BaseMixin, {
  classNames: ['pie-chart'],

  height: 200,

  // radius: function() {
  //   radius = (this.height > this.width) ? this.width : this.height;
  //   return (radius / 2);
  // },

  createChart: function() {
    var self = this;

    if(this.get('group') == null){
        return false;
    }

    this.chart = dc.pieChart('#'+this.$().context.id);

    //this.chartOptions.push('radius');

    //console.log(this.radius);

    // this.chart
    //     .radius(radius / 2)
    //     .label(function (d) {
    //         if (self.chart.hasFilter() && !self.chart.hasFilter(d.key))
    //             return d.key + "(0%)";
    //         return d.key + "(" + Math.floor(d.value / self.all.value() * 100) + "%)";
    //     })

        /*
        // (optional) whether chart should render labels, :default = true
        .renderLabel(true)
        // (optional) if inner radius is used then a donut chart will be generated instead of pie chart
        .innerRadius(40)
        // (optional) define chart transition duration, :default = 350
        .transitionDuration(500)
        // (optional) define color array for slices
        .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        // (optional) define color domain to match your data domain if you want to bind data or color
        .colorDomain([-1750, 1644])
        // (optional) define color value accessor
        .colorAccessor(function(d, i){return d.value;})
        */;

    this.renderChart();

  }.on('didInsertElement').observes('group')

});