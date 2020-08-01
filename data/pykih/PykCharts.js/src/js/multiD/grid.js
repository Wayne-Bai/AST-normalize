PykCharts.grid = function (options) {
    options.k.yGrid =  function (svg, gsvg, yScale,legendsGroup_width) {
        var width = options.chart_width,
            height = options.chart_height;
        if(PykCharts['boolean'](options.chart_grid_y_enable)) {
            var ygrid = PykCharts.Configuration.makeYGrid(options,yScale,legendsGroup_width);
            gsvg.selectAll(options.selector + " g.y.grid-line")
                .style("stroke",function () { return options.chart_grid_color; })
                .call(ygrid);
        }
        return this;
    },
    options.k.xGrid = function (svg, gsvg, xScale,legendsGroup_height) {
        var width = options.chart_width,
            height = options.chart_height;

        if(PykCharts['boolean'](options.chart_grid_x_enable)) {
            var xgrid = PykCharts.Configuration.makeXGrid(options,xScale,legendsGroup_height);
            gsvg.selectAll(options.selector + " g.x.grid-line")
                .style("stroke",function () { return options.chart_grid_color; })
                .call(xgrid);
        }
        return this;
    }
}
PykCharts.Configuration.makeXGrid = function(options,xScale,legendsGroup_height) {
    var that = this;
    if(!legendsGroup_height) {
        legendsGroup_height = 0;
    }
    var xgrid = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(options.axis_x_no_of_axis_value)
                    .tickFormat("")
                    .tickSize(options.chart_height - options.chart_margin_top - options.chart_margin_bottom - legendsGroup_height)
                    .outerTickSize(0);

    d3.selectAll(options.selector + " .x.axis .tick text")
                    .attr("font-size",options.axis_x_pointer_size + "px")
                    .style({
                        "font-weight" : options.axis_x_pointer_weight,
                        "font-family" : options.axis_x_pointer_family
                    });

    return xgrid;
};

configuration.makeYGrid = function(options,yScale,legendsGroup_width) {
    var that = this, size;
    if(!legendsGroup_width) {
        legendsGroup_width = 0;
    }

    if(PykCharts['boolean'](options.panels_enable)) {
        size = options.w - options.chart_margin_left - options.chart_margin_right - legendsGroup_width;
    } else {
        size = options.chart_width - options.chart_margin_left - options.chart_margin_right - legendsGroup_width;
    }
    var ygrid = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(options.axis_x_no_of_axis_value)
                    .tickSize(-size)
                    .tickFormat("")
                    .outerTickSize(0);

    d3.selectAll(options.selector + " .y.axis .tick text")
                    .attr("font-size",options.axis_y_pointer_size + "px")
                    .style({
                        "font-weight" : options.axis_x_pointer_weight,
                        "font-family" : options.axis_x_pointer_family
                    });


    return ygrid;
};