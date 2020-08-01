PykCharts.maps = {};

PykCharts.maps.processInputs = function (chartObject, options) {
    var theme = new PykCharts.Configuration.Theme({})
        , stylesheet = theme.stylesheet
        , functionality = theme.functionality
        , mapsTheme = theme.mapsTheme
        , optional = options.optional;

    chartObject.timeline_duration = "timeline_duration" in options ? options.timeline_duration : mapsTheme.timeline_duration;

    chartObject.margin_left = options.timeline_margin_left ? options.timeline_margin_left : mapsTheme.timeline_margin_left;
    chartObject.margin_right = options.timeline_margin_right ? options.timeline_margin_right : mapsTheme.timeline_margin_right;
    chartObject.margin_top = options.timeline_margin_top ? options.timeline_margin_top : mapsTheme.timeline_margin_top;
    chartObject.margin_bottom = options.timeline_margin_bottom ? options.timeline_margin_bottom : mapsTheme.timeline_margin_bottom;

    chartObject.tooltip_position_top = options.tooltip_position_top ? options.tooltip_position_top : mapsTheme.tooltip_position_top;
    chartObject.tooltip_position_left = options.tooltip_position_left ? options.tooltip_position_left : mapsTheme.tooltip_position_left;
    chartObject.tooltipTopCorrection = d3.select(chartObject.selector).style("top");
    chartObject.tooltipLeftCorrection = d3.select(chartObject.selector).style("left");

    chartObject.chart_color = options.chart_color ? options.chart_color : [];
    chartObject.saturation_color = options.saturation_color ? options.saturation_color : "";
    chartObject.palette_color = options.palette_color ? options.palette_color : mapsTheme.palette_color;

    chartObject.label_enable = options.label_enable ? options.label_enable.toLowerCase() : mapsTheme.label_enable;
    chartObject.chart_onhover_effect = options.chart_onhover_effect ? options.chart_onhover_effect.toLowerCase() : mapsTheme.chart_onhover_effect;
    chartObject.default_zoom_level = options.default_zoom_level ? options.default_zoom_level : 80;
    chartObject.k = new PykCharts.Configuration(chartObject);
    chartObject.total_no_of_colors = options.total_no_of_colors && chartObject.k.__proto__._isNumber(parseInt(options.total_no_of_colors,10))? parseInt(options.total_no_of_colors,10) : mapsTheme.total_no_of_colors;

    chartObject.k.validator().validatingSelector(chartObject.selector.substring(1,chartObject.selector.length))
        .isArray(chartObject.chart_color,"chart_color")
        .validatingDataType(chartObject.margin_left,"timeline_margin_left",mapsTheme.timeline_margin_left,"margin_left")
        .validatingDataType(chartObject.margin_right,"timeline_margin_right",mapsTheme.timeline_margin_right,"margin_right")
        .validatingDataType(chartObject.margin_top,"timeline_margin_top",mapsTheme.timeline_margin_top,"margin_top")
        .validatingDataType(chartObject.margin_bottom,"timeline_margin_bottom",mapsTheme.timeline_margin_bottom,"margin_bottom")
        .validatingDataType(chartObject.tooltip_position_top,"tooltip_position_top",mapsTheme.tooltip_position_top)
        .validatingDataType(chartObject.tooltip_position_left,"tooltip_position_left",mapsTheme.tooltip_position_left)
        .validatingColor(chartObject.highlight_color,"highlight_color",stylesheet.highlight_color)
        .validatingColor(chartObject.saturation_color,"saturation_color",stylesheet.saturation_color);

        if(chartObject.chart_color.constructor === Array) {
            if(chartObject.chart_color[0]) {
                chartObject.k.validator()
                    .validatingColor(chartObject.chart_color[0],"chart_color",stylesheet.chart_color);
            }
        }

    if (chartObject.color_mode === "saturation") {
        try {
            if(chartObject.total_no_of_colors < 3 || chartObject.total_no_of_colors > 9) {
                chartObject.total_no_of_colors = mapsTheme.total_no_of_colors;
                throw "total_no_of_colors";
            }
        }
        catch (err) {
            chartObject.k.warningHandling(err,"10");
        }
    }

    try {
        if(chartObject.chart_onhover_effect.toLowerCase() === "shadow" || chartObject.chart_onhover_effect.toLowerCase() === "none" || chartObject.chart_onhover_effect.toLowerCase() === "highlight_border" || chartObject.chart_onhover_effect.toLowerCase() === "color_saturation") {
        } else {
            chartObject.chart_onhover_effect = mapsTheme.chart_onhover_effect;
            throw "chart_onhover_effect";
        }
    }
    catch (err) {
        chartObject.k.warningHandling(err,"12");
    }

    try {
        if(!chartObject.k.__proto__._isNumber(chartObject.default_zoom_level)) {
            chartObject.default_zoom_level = 80;
            throw "default_zoom_level"
        }
    }

    catch (err) {
        chartObject.k.warningHandling(err,"1");
    }

    chartObject.timeline_duration = (chartObject.timeline_duration * 1000);

    return chartObject;
};