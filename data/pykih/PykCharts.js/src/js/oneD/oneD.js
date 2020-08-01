PykCharts.oneD = {};
PykCharts.oneD.processInputs = function (chartObject, options) {
    var theme = new PykCharts.Configuration.Theme({})
        , stylesheet = theme.stylesheet
        , functionality = theme.functionality
        , oneDimensionalCharts = theme.oneDimensionalCharts;

    chartObject.selector = options.selector ? options.selector : stylesheet.selector;
    chartObject.chart_width = options.chart_width  ? options.chart_width : stylesheet.chart_width;
    chartObject.interactive_enable = options.interactive_enable ? options.interactive_enable.toLowerCase(): stylesheet.interactive_enable;
    chartObject.click_enable = options.click_enable ? options.click_enable.toLowerCase() : stylesheet.click_enable;

    chartObject.mode = options.mode ? options.mode.toLowerCase(): stylesheet.mode;

    if (options.title_text) {
        chartObject.title_text = options.title_text;
        chartObject.title_size = "title_size" in options ? options.title_size : stylesheet.title_size;
        chartObject.title_color = options.title_color ? options.title_color : stylesheet.title_color;
        chartObject.title_weight = options.title_weight ? options.title_weight.toLowerCase() : stylesheet.title_weight;
        chartObject.title_family = options.title_family ? options.title_family.toLowerCase() : stylesheet.title_family;
    }

    if (options.subtitle_text) {
        chartObject.subtitle_text = options.subtitle_text;
        chartObject.subtitle_size = "subtitle_size" in options ? options.subtitle_size : stylesheet.subtitle_size;
        chartObject.subtitle_color = options.subtitle_color ? options.subtitle_color : stylesheet.subtitle_color;
        chartObject.subtitle_weight = options.subtitle_weight ? options.subtitle_weight.toLowerCase() : stylesheet.subtitle_weight;
        chartObject.subtitle_family = options.subtitle_family ? options.subtitle_family.toLowerCase() : stylesheet.subtitle_family;
    }
    
    chartObject.real_time_charts_refresh_frequency = options.real_time_charts_refresh_frequency ? options.real_time_charts_refresh_frequency : functionality.real_time_charts_refresh_frequency;
    chartObject.real_time_charts_last_updated_at_enable = options.real_time_charts_last_updated_at_enable ? options.real_time_charts_last_updated_at_enable.toLowerCase() : functionality.real_time_charts_last_updated_at_enable;

    if(options.credit_my_site_name || options.credit_my_site_url) {
        chartObject.credit_my_site_name = options.credit_my_site_name ? options.credit_my_site_name : "";
        chartObject.credit_my_site_url = options.credit_my_site_url ? options.credit_my_site_url : "";
    } else {
        chartObject.credit_my_site_name = stylesheet.credit_my_site_name;
        chartObject.credit_my_site_url = stylesheet.credit_my_site_url;
    }
    
    chartObject.data_source_name = options.data_source_name ? options.data_source_name : "";
    chartObject.data_source_url = options.data_source_url ? options.data_source_url : "";

    chartObject.clubdata_enable = options.clubdata_enable ? options.clubdata_enable.toLowerCase() : oneDimensionalCharts.clubdata_enable;
    chartObject.clubdata_text = PykCharts['boolean'](chartObject.clubdata_enable) && options.clubdata_text ? options.clubdata_text : oneDimensionalCharts.clubdata_text;
    chartObject.clubdata_maximum_nodes = PykCharts['boolean'](chartObject.clubdata_enable) && options.clubdata_maximum_nodes ? options.clubdata_maximum_nodes : oneDimensionalCharts.clubdata_maximum_nodes;
    chartObject.clubdata_always_include_data_points = PykCharts['boolean'](chartObject.clubdata_enable) && options.clubdata_always_include_data_points ? options.clubdata_always_include_data_points : [];

    chartObject.transition_duration = options.transition_duration ? options.transition_duration : functionality.transition_duration;
    chartObject.pointer_overflow_enable = options.pointer_overflow_enable ? options.pointer_overflow_enable.toLowerCase() : stylesheet.pointer_overflow_enable;

    chartObject.background_color = options.background_color ? options.background_color : stylesheet.background_color;

    chartObject.chart_color = options.chart_color  ? options.chart_color : stylesheet.chart_color;
    chartObject.highlight_color = options.highlight_color ? options.highlight_color : stylesheet.highlight_color;

    chartObject.fullscreen_enable = options.fullscreen_enable ? options.fullscreen_enable : stylesheet.fullscreen_enable;
    chartObject.loading_type = options.loading_type ? options.loading_type : stylesheet.loading_type;
    chartObject.loading_source = options.loading_source ? options.loading_source : stylesheet.loading_source;
    chartObject.tooltip_enable = options.tooltip_enable ? options.tooltip_enable.toLowerCase() : stylesheet.tooltip_enable;
    chartObject.border_between_chart_elements_thickness = "border_between_chart_elements_thickness" in options ? options.border_between_chart_elements_thickness : stylesheet.border_between_chart_elements_thickness;
    chartObject.border_between_chart_elements_color = options.border_between_chart_elements_color ? options.border_between_chart_elements_color : stylesheet.border_between_chart_elements_color;
    chartObject.border_between_chart_elements_style = options.border_between_chart_elements_style ? options.border_between_chart_elements_style.toLowerCase() : stylesheet.border_between_chart_elements_style;
    switch(chartObject.border_between_chart_elements_style) {
        case "dotted" : chartObject.border_between_chart_elements_style = "1,3";
                        break;
        case "dashed" : chartObject.border_between_chart_elements_style = "5,5";
                       break;
        default : chartObject.border_between_chart_elements_style = "0";
                  break;
    }
    chartObject.highlight = options.highlight ? options.highlight : stylesheet.highlight;

    chartObject.label_size = "label_size" in options ? options.label_size : stylesheet.label_size;
    chartObject.label_color = options.label_color ? options.label_color : stylesheet.label_color;
    chartObject.label_weight = options.label_weight ? options.label_weight.toLowerCase() : stylesheet.label_weight;
    chartObject.label_family = options.label_family ? options.label_family.toLowerCase() : stylesheet.label_family;

    chartObject.pointer_thickness = "pointer_thickness" in options ? options.pointer_thickness : stylesheet.pointer_thickness;
    chartObject.pointer_size = "pointer_size" in options ? options.pointer_size : stylesheet.pointer_size;
    chartObject.pointer_color = options.pointer_color ? options.pointer_color : stylesheet.pointer_color;
    chartObject.pointer_family = options.pointer_family ? options.pointer_family.toLowerCase() : stylesheet.pointer_family;
    chartObject.pointer_weight = options.pointer_weight ? options.pointer_weight.toLowerCase() : stylesheet.pointer_weight;

    chartObject.units_prefix = options.units_prefix ? options.units_prefix : false;
    chartObject.units_suffix = options.units_suffix ? options.units_suffix : false;

    chartObject.chart_onhover_highlight_enable = options.chart_onhover_highlight_enable ? options.chart_onhover_highlight_enable : stylesheet.chart_onhover_highlight_enable;
    
    chartObject.export_enable = options.export_enable ? options.export_enable.toLowerCase() : stylesheet.export_enable;
    chartObject.k = new PykCharts.Configuration(chartObject);

    chartObject.k.validator().validatingSelector(chartObject.selector.substring(1,chartObject.selector.length))
        .isArray(chartObject.chart_color,"chart_color")
        .isArray(chartObject.clubdata_always_include_data_points)
        .validatingChartMode(chartObject.mode,"mode",stylesheet.mode)
        .validatingDataType(chartObject.chart_width,"chart_width",stylesheet.chart_width)
        .validatingDataType(chartObject.title_size,"title_size",stylesheet.title_size)
        .validatingDataType(chartObject.subtitle_size,"subtitle_size",stylesheet.subtitle_size)
        .validatingDataType(chartObject.real_time_charts_refresh_frequency,"real_time_charts_refresh_frequency",functionality.real_time_charts_refresh_frequency)
        .validatingDataType(chartObject.transition_duration,"transition_duration",functionality.transition_duration)
        .validatingDataType(chartObject.border_between_chart_elements_thickness,"border_between_chart_elements_thickness",stylesheet.border_between_chart_elements_thickness)
        .validatingDataType(chartObject.label_size,"label_size",stylesheet.label_size)
        .validatingDataType(chartObject.pointer_thickness,"pointer_thickness",stylesheet.pointer_thickness)
        .validatingDataType(chartObject.pointer_size,"pointer_size",stylesheet.pointer_size)
        .validatingDataType(chartObject.clubdata_maximum_nodes,"clubdata_maximum_nodes",oneDimensionalCharts.clubdata_maximum_nodes)
        .validatingFontWeight(chartObject.title_weight,"title_weight",stylesheet.title_weight)
        .validatingFontWeight(chartObject.subtitle_weight,"subtitle_weight",stylesheet.subtitle_weight)
        .validatingFontWeight(chartObject.pointer_weight,"pointer_weight",stylesheet.pointer_weight)
        .validatingFontWeight(chartObject.label_weight,"label_weight",stylesheet.label_weight)
        .validatingColor(chartObject.background_color,"background_color",stylesheet.background_color)
        .validatingColor(chartObject.title_color,"title_color",stylesheet.title_color)
        .validatingColor(chartObject.subtitle_color,"subtitle_color",stylesheet.subtitle_color)
        .validatingColor(chartObject.highlight_color,"highlight_color",stylesheet.highlight_color)
        .validatingColor(chartObject.label_color,"label_color",stylesheet.label_color)
        .validatingColor(chartObject.pointer_color,"pointer_color",stylesheet.pointer_color)
        .validatingColor(chartObject.border_between_chart_elements_color,"border_between_chart_elements_color",stylesheet.border_between_chart_elements_color);
        
        if(chartObject.chart_color.constructor === Array) {
            if(chartObject.chart_color[0]) {
                chartObject.k.validator()
                    .validatingColor(chartObject.chart_color[0],"chart_color",stylesheet.chart_color);
            }
        }
    return chartObject;
};
