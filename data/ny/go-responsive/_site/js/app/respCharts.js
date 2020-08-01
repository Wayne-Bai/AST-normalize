/*global chartObj: false, Chart: false */
(function ($) {
  $.respCharts = function(chartObj) {
    try {
      // Function for building the default charts
      function chartBuilder(canvasElm, chartType, chartData, chartOptions) {
        var $graph, graphWidth, graphHeight, ctx, myNewChart;
  
        if (!chartOptions || typeof chartOptions !== 'object') { chartOptions = {}; }
  
        // Select the canvas element in that is being used
        $graph = $(canvasElm);
        graphWidth = $graph.parent().width();
        graphHeight = Math.floor(graphWidth / 1.6667);
  
        $graph.attr('height', graphHeight);
        $graph.attr('width', graphWidth);
  
        //Get context with jQuery - using jQuery's .get() method.
        ctx = $graph.get(0).getContext('2d');
  
        //This will get the first returned node in the jQuery collection.
        myNewChart = new Chart(ctx);
  
        // Draw the Chart based on the chartType variable passed
        switch (chartType) {
          case 'line':
            myNewChart.Line(chartData,chartOptions);
            break;
          case 'bar':
            myNewChart.Bar(chartData,chartOptions);
            break;
          case 'radar':
            myNewChart.Radar(chartData,chartOptions);
            break;
          case 'polarArea':
            myNewChart.PolarArea(chartData,chartOptions);
            break;
          case 'pie':
            myNewChart.Pie(chartData,chartOptions);
            break;
          case 'doughnut':
            myNewChart.Doughnut(chartData,chartOptions);
            break;
        }
      } // end chartBuilder()
  
      // Loop through all of the applied chart objects
      function drawCharts() {
        $.each(chartObj, function(){
          // For each chart object found call the build function
          chartBuilder(this.cId, this.cType, this.cData, this.cOptions);
        });
      }
  
      // Preform first run
      drawCharts();
  
      // Setup the window resize event
      $(window).on('resize', drawCharts);
    }
    catch (e) { }
  };

})( jQuery );
