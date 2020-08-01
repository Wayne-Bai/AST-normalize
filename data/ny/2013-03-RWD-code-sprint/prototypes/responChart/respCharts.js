(function( $ ){

    $.respCharts = function(chartObj) {

        var chartObj = chartObj;

        // Function for building the default charts
        function chartBuilder(canvasElm, chartType, chartData, chartOptions) {

          if ( typeof(chartOptions) !== "Object") {
            chartOptions = {};
          }

          // Select the canvas element in that is being used
          var $graph = $(canvasElm),
              graphWidth = $graph.parent().width(),
              graphHeight = Math.floor(graphWidth / 1.6667);

          //graph.css({'height':graphHeight,'width':graphWidth});
          $graph.attr('height', graphHeight);
          $graph.attr('width', graphWidth);

          //Get context with jQuery - using jQuery's .get() method.
          var ctx = $graph.get(0).getContext("2d");
          //This will get the first returned node in the jQuery collection.
          var myNewChart = new Chart(ctx);

          // Draw the Chart based on the chartType variable passed
          switch (chartType) {
            case "line":
              myNewChart.Line(chartData,chartOptions);
              break;
            case "bar":
              myNewChart.Bar(chartData,chartOptions);
              break;
            case "radar":
              myNewChart.Radar(chartData,chartOptions);
              break;
            case "polarArea":
              myNewChart.PolarArea(chartData,chartOptions);
              break;
            case "pie":
               myNewChart.Pie(chartData,chartOptions);
              break;
            case "doughnut":
              myNewChart.Doughnut(chartData,chartOptions);
              break;
          }

        }

        // Loop through all of the applied chart objects
        function loopChartArray() {

          for (var i=0, len = chartObj.length; i < len; i++) {

             // For each chart object found call the build function
             chartBuilder(chartObj[i].cId, chartObj[i].cType, chartObj[i].cData, chartObj[i].cOptions);

          }
        }

        // Preform first run
        loopChartArray();

        // Setup the window resize event
        $(window).resize(loopChartArray);

    };

})( jQuery );
