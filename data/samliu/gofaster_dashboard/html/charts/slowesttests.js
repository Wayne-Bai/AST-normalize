/*
* Requires jquery to be included earlier
* Outputs results to div id "result"
*/

  $.getJSON('mochitest.json', function(data) {
      counter = 0;
      max = 20000000;
      totalTestTime = 0;
      var topSlowest = new Array();
      function sortPairs(a,b)
      {
        if(a[0] > b[0]){
          return -1;
        }
        return 1;
      }


      for (x in data["mochitests-2"]){
        if(counter >= max){
          break;
        }
        counter++;
        var testRunTime = 0;
        for (y in data["mochitests-2"][x]){
          testRunTime+=parseInt(data["mochitests-2"][x][y]["avg"]);
        }
        totalTestTime += testRunTime;
        topSlowest.push([testRunTime,x]);
        testRunTime = testRunTime.toString();
      }

      //Write results out to div
      $('#result').append("<h1>Top 10 Slowest MochiTests</h1>");
      $('#result').append(Math.round(totalTestTime / 10 / 60 / 60)/100 + "  hours total time running mochitest. <br/><br/>");


      topSlowest.sort(sortPairs);
      $('#result').append("<ol>");
      for(i=1;i<11;i++){
        $('#result ol').append("<li>" + topSlowest[i][1] + " (" + topSlowest[i][0]+"ms)</li>");
      }
      $('#result').append("</ol>");

  });
  // TODO Get top 10 slowest data out of json and reformat to be graph-friendly json
  //var jsonObj = []; //declare array
  //for (var i = 0; i < status.options.length; i++) {
  //  jsonObj.push({id: status.options[i].text, optionValue: status.options[i].value});
  //}


  var chart;
  $(document).ready(function() {
    chart = new Highcharts.Chart({
      chart: {
        renderTo: 'container',
        defaultSeriesType: 'scatter',
        zoomType: 'xy'
      },
      title: {
        text: 'Slowest Mochitests over Time'
      },
      subtitle: {
        text: ''
      },
      xAxis: {
        title: {
          enabled: true,
          text: 'Time'
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true
      },
      yAxis: {
        title: {
          text: 'Speed (smaller = faster)'
        }
      },
      tooltip: {
        formatter: function() {
                    return ''+
            this.x +' days, '+ this.y +' ms';
        }
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 100,
        y: 70,
        floating: true,
        backgroundColor: '#FFFFFF',
        borderWidth: 1
      },
      plotOptions: {
        scatter: {
          marker: {
            radius: 5,
            states: {
              hover: {
                enabled: true,
                lineColor: 'rgb(100,100,100)'
              }
            }
          },
          states: {
            hover: {
              marker: {
                enabled: false
              }
            }
          }
        }
      },
      series: [
      
      TODO Get datapoints in the correct json format
      {
        name: 'testname1',
        color: 'rgba(223, 83, 83, .5)',
        data: [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
          [176.5, 71.8], [164.4, 55.5], [160.7, 48.6], [174.0, 66.4], [163.8, 67.3]]

      },

      {
        name: 'testname2',
        color: 'rgba(119, 152, 191, .5)',
        data: [[174.0, 65.6], [175.3, 71.8], [193.5, 80.7], [186.5, 72.6], [187.2, 78.8],
          [180.3, 83.2], [180.3, 83.2]]

      }

      ]
    });


  });
