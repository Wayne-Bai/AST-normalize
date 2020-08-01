PykCharts.multiD.panelsOfScatter = function (options) {
  var that = this;
  that.interval = "";
  var theme = new PykCharts.Configuration.Theme({});

  this.execute = function(pykquery_data) {
    that = new PykCharts.validation.processInputs(that, options, 'multiDimensionalCharts');
    PykCharts.scaleFunction(that);
    that.bubbleRadius = options.scatterplot_radius ? options.scatterplot_radius : theme.multiDimensionalCharts.scatterplot_radius;
    that.panels_enable = "yes";
    that.legends_display = "horizontal";
    try {
      if(!that.k.__proto__._isNumber(that.bubbleRadius)) {
        that.bubbleRadius = theme.multiDimensionalCharts.scatterplot_radius;
        throw "bubbleRadius"
      }
    }

    catch (err) {
      that.k.warningHandling(err,"1");
    }

    if(that.stop){
      return;
    }
    that.k.storeInitialDivHeight();
    if(that.mode === "default") {
      that.k.loading();
    }

    var multiDimensionalCharts = theme.multiDimensionalCharts,
    stylesheet = theme.stylesheet;

    that.multiD = new PykCharts.multiD.configuration(that);
    that.scatterplot_pointer_enable =  options.scatterplot_pointer_enable ? options.scatterplot_pointer_enable.toLowerCase() : multiDimensionalCharts.scatterplot_pointer_enable;
    that.zoomed_out = true;

    if(PykCharts['boolean'](that.panels_enable)) {
      that.radius_range = [that.k.__proto__._radiusCalculation(3.5)*2,that.k.__proto__._radiusCalculation(8)*2];
    } else {
      that.radius_range = [that.k.__proto__._radiusCalculation(4.5)*2,that.k.__proto__._radiusCalculation(11)*2];
    }

    that.executeData = function (data) {
      var validate = that.k.validator().validatingJSON(data),
      id = that.selector.substring(1,that.selector.length);
      if(that.stop || validate === false) {
        that.k.remove_loading_bar(id);
        return;
      }

      that.data = that.k.__proto__._groupBy("scatterplot",data);
      that.axis_y_data_format = that.k.yAxisDataFormatIdentification(that.data);
      that.axis_x_data_format = that.k.xAxisDataFormatIdentification(that.data);
      if(that.axis_x_data_format === "time" && that.axis_x_time_value_datatype === "") {
        console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
      }
      if(that.axis_y_data_format === "time" && that.axis_y_time_value_datatype === "") {
        console.warn('%c[Warning - Pykih Charts] ', 'color: #F8C325;font-weight:bold;font-size:14px', " at "+that.selector+".(\""+"You seem to have passed Date data so please pass the value for axis_x_time_value_datatype"+"\")  Visit www.pykcharts.com/errors#warning_15");
      }
      that.compare_data = that.k.__proto__._groupBy("scatterplot",data);
      that.k.remove_loading_bar(id);
      var a = new PykCharts.multiD.scatterplotFunctions(options,that,"scatterplot");
      a.render();
    };
    if (PykCharts['boolean'](that.interactive_enable)) {
        that.k.dataFromPykQuery(pykquery_data);
        that.k.dataSourceFormatIdentification(that.data,that,"executeData");
    } else {
        that.k.dataSourceFormatIdentification(options.data,that,"executeData");
    }
  };
};