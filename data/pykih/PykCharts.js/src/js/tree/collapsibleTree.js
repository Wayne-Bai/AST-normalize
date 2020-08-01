PykCharts.tree.collapsibleTree = function (options) {
    var that = this;
    this.execute = function () {
        that = new PykCharts.tree.processInputs(that, options, "collapsibleTree");
        that.k1 = new PykCharts.tree.configuration(that);
        if(that.mode === "default") {
           that.k.loading();
        }
        d3.json(options.data, function(e, data){
            
            that.data = data;
            that.tree_data = that.k1.dataTransfer(that.data);
            
            $(that.selector+" #chart-loader").remove();
            $(that.selector).css("height","auto");
            that.render();

        });
    };
    this.refresh = function () {
        d3.json(options.data, function (e, data) {
            
            that.data = data;  
            that.tree_data = that.k1.dataTransfer(that.data);
            that.optionalFeatures()
                    .createChart()
           that.zoomListener = that.k1.zoom(that.svg,that.group);
        });
    };
    this.render = function () {
        that.border = new PykCharts.Configuration.border(that);
        that.transitions = new PykCharts.Configuration.transition(that);
        
        if(that.mode === "default") {

            that.k.title()
                .subtitle();

            that.optionalFeatures()
                .svgContainer();

            that.k.credits()
                .dataSource()
                .liveData(that)
                .tooltip();

            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
            
            that.optionalFeatures()
                .createChart()
            that.zoomListener = that.k1.zoom(that.svg,that.group);
              
        } else if(that.mode === "infographic") {

            that.optionalFeatures().svgContainer()
                .createChart();

            that.k.tooltip();
            that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        }
    };
    this.optionalFeatures = function () {
        var optional = {
            svgContainer : function () {
                that.svg = d3.select(options.selector)
                    .attr("class", "Pykcharts-tree")
                    .attr("id","svgcontainer")
                    .append("svg")
                    .attr("width", that.width)
                    .attr("height", that.height)
                    .style("overflow","visible");

                that.group = that.svg.append("g")
                    .attr("transform", "translate(" + that.margin.left + "," + that.margin.top + ")");
            },
            createChart : function () {
                that.w = that.width - that.margin.right - that.margin.left,
                that.h = that.height - that.margin.top - that.margin.bottom;
                that.i = 0;

                that.tree = d3.layout.tree()
                    .size([that.h, that.w])
                    .children(function (d) {
                        return d.values;
                    });

                that.diagonal = d3.svg.diagonal()
                    .projection(function(d) { return [d.y, d.x]; });

                that.root = that.tree_data;
                that.root.x0 = that.h / 2;
                that.root.y0 = 0;

                function collapse(d) {
                    if (d.values) {
                        d._values = d.values;
                        d._values.forEach(collapse);
                        d.values = null;
                    }
                }

                that.root.values.forEach(collapse);
                this.update(that.root).chartLabel();
                return this;
            },

            chartLabel : function () {
                if(PykCharts['boolean'](that.label.size)) {
                    that.nodeEnter.append("text")
                        .attr("x", function(d) { return d.values || d._values ? -10 : 10; })
                        .attr("dy", ".35em")
                        .attr("text-anchor", function(d) { return d.values || d._values ? "end" : "start"; })
                        .attr("pointer-events","none")
                        .text(function(d) { return d.key; })
                        .style("fill-opacity", 1e-6)
                        .style("font-weight", that.label.weight)
                        .style("font-size", that.label.size)
                        .style("fill", that.label.color)
                        .style("font-family", that.label.family);
                    that.nodeUpdate.select("text")
                        .style("fill-opacity", 1);
                    that.nodeExit.select("text")
                        .style("fill-opacity", 1e-6);
                }
                return this;
            },
            update : function (source) {
                var nodes = that.tree.nodes(that.root).reverse(),
                    links = that.tree.links(nodes);

                nodes.forEach(function(d) { d.y = d.depth * 180; });

                var node = that.group.selectAll("g.node")
                    .data(nodes, function(d) { return d.id || (d.id = ++that.i); });

                that.nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                    

                that.nodeEnter.append("circle")
                    .attr("r", that.nodeRadius)
                    .style("fill", function(d) { return d._values ? that.chartColor : "#fff"; })
                    .style("stroke",that.border.color())
                    .style("stroke-width",that.border.width())
                    .on("mouseover", function (d) {
                        that.mouseEvent.tooltipPosition(d);
                        that.mouseEvent.tooltipTextShow(d.key);
                    })
                    .on("mousemove", function (d) {
                        that.mouseEvent.tooltipPosition(d);
                    })
                    .on("mouseout", function (d) {
                        that.mouseEvent.tooltipHide(d);
                        
                    })
                    .on("click", that.click);

                that.nodeUpdate = node.transition()
                    .duration(that.transitions.duration())
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

                that.nodeUpdate.select("circle")
                    .attr("r", that.nodeRadius)
                    .style("fill", function(d) { return d._values ? that.chartColor : "#fff"; })

                that.nodeExit = node.exit().transition()
                    .duration(that.transitions.duration())
                    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                    .remove();

                that.nodeExit.select("circle")
                    .attr("r", that.nodeRadius);

                var link = that.group.selectAll("path.link")
                    .data(links, function(d) { return d.target.id; });

                link.enter().insert("path", "g")
                    .attr("class", "link")
                    .attr("d", function(d) {
                        var o = {x: source.x0, y: source.y0};
                        return that.diagonal({source: o, target: o});
                    });

                link.transition()
                    .duration(that.transitions.duration())
                    .attr("d", that.diagonal);

                link.exit().transition()
                    .duration(that.transitions.duration())
                    .attr("d", function(d) {
                        var o = {x: source.x, y: source.y};
                        return that.diagonal({source: o, target: o});
                    })
                    .remove();
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
                return this;
            },
            centerNode : function (source) {
                var scale = that.zoomListener.scale();
                x = -source.y0;
                y = -source.x0;
                x = x * scale + that.w / 2;
                y = y * scale + that.h / 2;
                d3.select('g').transition()
                    .duration(that.transitions.duration)
                    .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
                that.zoomListener.scale(scale);
                that.zoomListener.translate([x, y]);
            }
        }
        return optional;

    }
    that.click = function (d) {
        if (d.values) {
            d._values = d.values;
            d.values = null;
        } else {
            d.values = d._values;
            d._values = null;
        }
        that.optionalFeatures().update(d)
            .chartLabel()
            .centerNode(d);
    };
}