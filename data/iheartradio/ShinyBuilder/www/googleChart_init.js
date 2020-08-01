$(document).ready(function () {

//Google Chart Output Binding
var googleChartOutputBinding = new Shiny.OutputBinding();
$.extend(googleChartOutputBinding, {
  find: function(scope) {
    return $('.shinyGoogleChart')
  },
  getId: function(el) {
    return $(el).attr('id');
  },
  renderValue: function(el, data){
      function googleLoaded() {
      var dataLabels = JSON.parse(data.dataLabels);
      var chartData =  new google.visualization.DataTable();
      $.each(dataLabels, function(i, obj) {
        chartData.addColumn(obj, i);
      });
      chartData.addRows(JSON.parse(data.dataJSON));
      wrapper = new google.visualization.ChartWrapper({
            dataTable:    chartData,
            containerId:  $(el).attr('id'),
            chartType:    data.chartType,
            options:      JSON.parse(data.options)
      });
      wrapper.draw();
      $(el).data('chart', wrapper);
    };
    google.load("visualization", "1", {"callback" : googleLoaded, "packages" : "charteditor"});
  },
  renderError: function(el, err){
  },
  clearError: function(el){
  }
});
Shiny.outputBindings.register(googleChartOutputBinding);

  
   //chartEditor Input Binding
//-------------------------
var chartEditorInputBinding = new Shiny.InputBinding();
$.extend(chartEditorInputBinding, {
  find: function(scope) {
    return $('.chartEditor');
  },
  getValue: function(el) {
    return  {chartType : $(el).attr('chartType'), options : $(el).attr('options')};
  },
  setValue: function(el, value) {
  },
  subscribe: function(el, callback) {  
    $(el).on("change.chartEditorInputBinding", function(e) {
      callback();
    });
  },
  unsubscribe: function(el) {
  $(el).off(".chartEditorInputBinding");
  }
});
Shiny.inputBindings.register(chartEditorInputBinding);   
    
});