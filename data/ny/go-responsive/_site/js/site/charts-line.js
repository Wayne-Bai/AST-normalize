$(document).ready(function(){

  chartObj = [{
    "cId": "#canvasTest-1",
    "cType": "line",
    "cData": {
      labels : ["Jan","Feb","Mar","Apr","May","Jun","Jul"],
      datasets : [
        {
          fillColor : "rgba(220,220,220,0.5)",
          strokeColor : "rgba(220,220,220,1)",
          data : [65,59,90,81,56,55,40]
        },
        {
          fillColor : "rgba(151,187,205,0.5)",
          strokeColor : "rgba(151,187,205,1)",
          data : [28,48,40,19,96,27,100]
        }
      ]
    }}];

  // Call the responsive plugin
  $.respCharts(chartObj);

});
