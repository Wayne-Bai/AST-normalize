PykCharts.oneD.percentageColumn = function (options) {
    var that = this;
    that.interval = "";
    var theme = new PykCharts.Configuration.Theme({});
    this.execute = function (pykquery_data) {
        var that = this;

        that = new PykCharts.validation.processInputs(that, options, 'oneDimensionalCharts');

        that.chart_height = PykCharts['boolean'](options.chart_height) ? options.chart_height : that.chart_width;
        that.percent_column_rect_width = options.percent_column_rect_width ? options.percent_column_rect_width : theme.oneDimensionalCharts.percent_column_rect_width;

        that.k.validator()
            .validatingDataType(that.chart_height,"chart_height",that.chart_width)
            .validatingDataType(that.percent_column_rect_width,"percent_column_rect_width",theme.oneDimensionalCharts.percent_column_rect_width);

        if(that.stop) {
            return;
        }
        that.k.storeInitialDivHeight();
        if(that.percent_column_rect_width > 100) {
            that.percent_column_rect_width = 100;
        }

        that.percent_column_rect_width = that.k.__proto__._radiusCalculation(that.percent_column_rect_width,"percentageBar") * 2;

        if(that.mode === "default") {
           that.k.loading();
        }
        
        that.executeData = function (data) {
            var validate = that.k.validator().validatingJSON(data),
                id = that.selector.substring(1,that.selector.length);
            if(that.stop || validate === false) {
                that.k.remove_loading_bar(id);
                return;
            }            
            that.data = that.k.__proto__._groupBy("oned",data);
            that.compare_data = that.k.__proto__._groupBy("oned",data);
            that.k.remove_loading_bar(id);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.render();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeData");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeData");
        }   
    };
    this.refresh = function (pykquery_data) {
        that.executeRefresh = function (data) {
            that.data = that.k.__proto__._groupBy("oned",data);
            that.clubdata_enable = that.data.length>that.clubdata_maximum_nodes ? that.clubdata_enable : "no";
            that.refresh_data = that.k.__proto__._groupBy("oned",data);
            var compare = that.k.checkChangeInData(that.refresh_data,that.compare_data);
            that.compare_data = compare[0];
            var data_changed = compare[1];
            if(data_changed) {
                that.k.lastUpdatedAt("liveData");
            }
            that.optionalFeatures()
                    .clubData()
            if(that.color_mode === "shade") {
                shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
                that.new_data.forEach(function (d,i) {
                    d.color = shade_array[i];
                })
            }
            that.optionalFeatures()
                    .createChart()
                    .label()
                    .ticks();
        };
        if (PykCharts['boolean'](that.interactive_enable)) {
            that.k.dataFromPykQuery(pykquery_data);
            that.k.dataSourceFormatIdentification(that.data,that,"executeRefresh");
        } else {
            that.k.dataSourceFormatIdentification(options.data,that,"executeRefresh");
        }   
    };

    this.render = function () {
        var that = this;
        var id = that.selector.substring(1,that.selector.length);
        var container_id = id + "_svg";
        that.fillChart = new PykCharts.Configuration.fillChart(that);
        that.transitions = new PykCharts.Configuration.transition(that);

        if(that.mode === "default") {
            that.k.title()
                    .backgroundColor(that)
                    .export(that,"#"+container_id,"percentageColumn")
                    .emptyDiv(that.selector)
                    .subtitle();
        }
        if(that.mode === "infographics") {
            that.k.backgroundColor(that)
                .export(that,"#"+container_id,"percentageColumn")
                    .emptyDiv(that.selector);

            that.new_data = that.data;
        }

        that.k.tooltip();

        that.mouseEvent = new PykCharts.Configuration.mouseEvent(that);
        if(that.mode === "default") {
            percent_column = that.optionalFeatures()
                            .clubData();
        }
        if(that.color_mode === "shade") {
            shade_array = that.k.shadeColorConversion(that.shade_color,that.new_data.length);
            that.new_data.forEach(function (d,i) {
                d.color = shade_array[i];
            })
        }
        that.optionalFeatures().svgContainer(container_id)
            .createChart()
            .label()
            .ticks();
        if(that.mode === "default") {
            that.k.liveData(that)
                .createFooter()
                .lastUpdatedAt()
                .credits()
                .dataSource();
        }
        
        var add_extra_width = 0;

        setTimeout(function () {
            if(that.ticks_text_width.length) {
                add_extra_width = d3.max(that.ticks_text_width,function(d){
                    return d;
                });
            }
            that.k.exportSVG(that,"#"+container_id,"percentageColumn",undefined,undefined,(add_extra_width+15))
            if(!PykCharts['boolean'](options.chart_width)) {
                that.chart_width = that.percent_column_rect_width + 10 + add_extra_width;
                that.svgContainer.attr("viewBox","0 0 " + that.chart_width + " " + that.chart_height);
            }
            var resize = that.k.resize(that.svgContainer);
            that.k.__proto__._ready(resize);
        },that.transitions.duration());
        
        
        window.addEventListener('resize', function(event){
            return that.k.resize(that.svgContainer);
        });

    };
    this.optionalFeatures = function () {
        var optional = {
            createChart: function () {
                var border = new PykCharts.Configuration.border(that);
                var arr = that.new_data.map(function (d) {
                    return d.weight;
                });
                arr.sum = function () {
                    var sum = 0;
                    for(var i = 0 ; i < this.length; ++i) {
                        sum += this[i];
                    }
                    return sum;
                };

                var sum = arr.sum();
                that.new_data.forEach(function (d, i) {
                    this[i].percentValue= d.weight * 100 / sum;
                }, that.new_data);
               // that.new_data.sort(function (a,b) { return b.weight - a.weight; })
                that.chart_data = that.group.selectAll('.per-rect')
                    .data(that.new_data)

                that.chart_data.enter()
                    .append('rect')
                    .attr("class","per-rect")

                that.chart_data.attr({
                    'x': 0,
                    'y': function (d, i) {
                        if (i === 0) {
                            return 0;
                        } else {
                            var sum = 0,
                                subset = that.new_data.slice(0,i);

                            subset.forEach(function(d, i){
                                sum += this[i].percentValue;
                            },subset);

                            return sum * that.chart_height / 100;
                        }
                    },
                    'width': that.percent_column_rect_width,
                    'height': 0,
                    "fill": function (d) {
                        return that.fillChart.selectColor(d);
                    },
                    "fill-opacity": 1,
                    "data-fill-opacity": function () {
                        return d3.select(this).attr("fill-opacity");
                    },
                    "stroke": border.color(),
                    "stroke-width": border.width(),
                    "stroke-dasharray": border.style(),
                    "data-id" : function (d,i) {
                        return d.name;
                    }
                })
                .on({
                    "mouseover": function (d,i) {
                        if(that.mode === "default") {
                            d.tooltip=d.tooltip||"<table class='PykCharts'><tr><th colspan='2' class='tooltip-heading'>"+d.name+"</tr><tr><td class='tooltip-left-content'>"+that.k.appendUnits(d.weight)+"<td class='tooltip-right-content'>("+d.percentValue.toFixed(1)+"%)</tr></table>"
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlight(that.selector+" "+".per-rect",this);
                            }
                            that.mouseEvent.tooltipPosition(d);
                            that.mouseEvent.tooltipTextShow(d.tooltip);
                        }
                    },
                    "mouseout": function (d) {
                        if(that.mode === "default") {
                            if(PykCharts['boolean'](that.chart_onhover_highlight_enable)) {
                                that.mouseEvent.highlightHide(that.selector+" "+".per-rect");
                            }
                            that.mouseEvent.tooltipHide(d);
                        }
                    },
                    "mousemove": function (d,i) {
                        if(that.mode === "default") {
                            that.mouseEvent.tooltipPosition(d);
                        }
                    },
                    "click" :  function (d,i) {
                        if(PykCharts['boolean'](that.click_enable)){
                           that.addEvents(d.name, d3.select(this).attr("data-id")); 
                        }                     
                    }
                })
                .transition()
                .duration(that.transitions.duration())
                .attr('height', function (d) {
                    return d.percentValue * that.chart_height / 100;
                });
                that.chart_data.exit()
                    .remove();

                return this;
            },
            svgContainer :function (container_id) {

                that.svgContainer = d3.select(that.selector)
                    .append('svg')
                    .attr({
                        "width": that.chart_width,
                        "height": that.chart_height,
                        "preserveAspectRatio": "xMinYMin",
                        "viewBox": "0 0 " + that.chart_width + " " + that.chart_height,
                        "id": container_id,
                        "class": "svgcontainer PykCharts-oneD"
                    });

                    that.group = that.svgContainer.append("g")
                        .attr("id","percentageColumn");

                return this;
            },
            label : function () {
                    that.chart_text = that.group.selectAll(".per-text")
                        .data(that.new_data);
                    var sum = 0;
                    that.chart_text.enter()
                        .append("text")
                        .attr("class","per-text");

                    that.chart_text.attr({
                        "class": "per-text",
                        "x": (that.percent_column_rect_width/2 ),
                        "y": function (d,i) {
                            sum = sum + d.percentValue;
                            if (i===0) {
                                return (0 + (sum * that.chart_height / 100))/2+5;
                            } else {
                                return (((sum - d.percentValue) * that.chart_height/100)+(sum * that.chart_height / 100))/2+5;
                            }
                        }
                    });
                    sum = 0;

                    that.chart_text.text("")
                        .attr({
                            "fill": function(d) {
                                if(that.color_mode === "shade" && !options.label_color) {
                                    var color_value = that.k.__proto__._colourBrightness(d.color);
                                    if(color_value === "light") {
                                        return "black";
                                    } else {
                                        return "white";
                                    }
                                }
                                return that.label_color;
                            },
                            "text-anchor": "middle",
                            "pointer-events": "none"
                        })
                        .style({
                            "font-size": that.label_size + "px",
                            "font-weight": that.label_weight,
                            "font-family": that.label_family
                        });
                        function chart_text_timeout(){
                            that.chart_text.text(function (d) {
                                return d.percentValue.toFixed(1)+"%";
                            })
                            .text(function (d) {
                                if(this.getBBox().width < (0.92*that.percent_column_rect_width) && this.getBBox().height < (d.percentValue * that.chart_height / 100)) {
                                    return d.percentValue.toFixed(1)+"%";
                                }else {
                                    return "";
                                }
                            });
                        }
                        setTimeout(chart_text_timeout, that.transitions.duration());

                    that.chart_text.exit()
                        .remove();
                return this;
            },
            ticks : function () {
                if(PykCharts['boolean'](that.pointer_overflow_enable)) {
                    that.svgContainer.style("overflow","visible");
                }
                    var sum = 0, sum1 = 0;

                    var x, y, w = [];
                    sum = 0;
                    that.ticks_text_width = [];

                    var tick_line = that.group.selectAll(".per-ticks")
                        .data(that.new_data);

                    tick_line.enter()
                        .append("line")
                        .attr("class", "per-ticks");

                    var tick_label = that.group.selectAll(".ticks_label")
                                        .data(that.new_data);

                    tick_label.enter()
                        .append("text")
                        .attr("class", "ticks_label")

                    tick_label.attr("class", "ticks_label")
                        .attr("transform",function (d) {
                            sum = sum + d.percentValue
                            x = (that.percent_column_rect_width) + 15;
                            y = (((sum - d.percentValue) * that.chart_height/100)+(sum * that.chart_height / 100))/2 + 5;

                            return "translate(" + x + "," + y + ")";
                        });

                    tick_label.text(function (d) {
                            return "";
                        })
                        .attr({
                            "font-size": that.pointer_size,
                            "text-anchor": "start",
                            "fill": that.pointer_color,
                            "font-family": that.pointer_family,
                            "font-weight": that.pointer_weight,
                            "pointer-events": "none"
                        });

                        function tick_label_timeout() {
                            tick_label.text(function (d) {
                                return d.name;
                            })
                            .text(function (d,i) {
                                w[i] = this.getBBox().height;
                                that.ticks_text_width[i] = this.getBBox().width;
                                if (this.getBBox().height < (d.percentValue * that.chart_height / 100)) {
                                    return d.name;
                                }
                                else {
                                    return "";
                                }
                            });

                            sum = 0;
                            tick_line
                                .attr({
                                    "x1": function (d,i) {
                                        return that.percent_column_rect_width;
                                    },
                                    "y1": function (d,i) {
                                        sum = sum + d.percentValue;
                                        if (i===0){
                                            return (0 + (sum * that.chart_height / 100))/2;
                                        }else {
                                            return (((sum - d.percentValue) * that.chart_height/100)+(sum * that.chart_height / 100))/2;
                                        }
                                    },
                                    "x2": function (d, i) {
                                         return (that.percent_column_rect_width);
                                    },
                                    "y2": function (d,i) {
                                        sum1 = sum1 + d.percentValue;
                                        if (i===0){
                                            return (0 + (sum1 * that.chart_height / 100))/2;
                                        }else {
                                            return (((sum1 - d.percentValue) * that.chart_height/100)+(sum1 * that.chart_height / 100))/2;
                                        }
                                    },
                                    "stroke-width": that.pointer_thickness + "px",
                                    "stroke": that.pointer_color,
                                    "x2": function (d, i) {
                                        if((d.percentValue * that.chart_height / 100) > w[i]) {
                                            return (that.percent_column_rect_width) + 10;
                                        } else {
                                            return (that.percent_column_rect_width) ;
                                        }
                                    }
                                });
                        }
                        setTimeout(tick_label_timeout,that.transitions.duration());

                    tick_label.exit().remove();

                    tick_line.exit().remove();

                return this;
            },
            clubData : function () {

                if(PykCharts['boolean'](that.clubdata_enable)) {
                    var clubdata_content = [];
                    if(that.clubdata_always_include_data_points.length!== 0){
                        var l = that.clubdata_always_include_data_points.length;
                        for(i=0; i < l; i++){
                            clubdata_content[i] = that.clubdata_always_include_data_points[i];
                        }
                    }
                    var new_data1 = [];
                    for(i=0;i<clubdata_content.length;i++){
                        for(j=0;j<that.data.length;j++){
                            if(clubdata_content[i].toUpperCase() === that.data[j].name.toUpperCase()){
                                new_data1.push(that.data[j]);
                            }
                        }
                    }
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    var k = 0;

                    while(new_data1.length<that.clubdata_maximum_nodes-1){
                        for(i=0;i<clubdata_content.length;i++){
                            if(that.data[k].name.toUpperCase() === clubdata_content[i].toUpperCase()){
                                k++;
                            }
                        }
                        new_data1.push(that.data[k]);
                        k++;
                    }
                    var sum_others = 0;
                    for(j=k; j < that.data.length; j++){
                        for(i=0; i<new_data1.length && j<that.data.length; i++){
                            if(that.data[j].name.toUpperCase() === new_data1[i].name.toUpperCase()){
                                sum_others +=0;
                                j++;
                                i = -1;
                            }
                        }
                        if(j < that.data.length){
                            sum_others += that.data[j].weight;
                        }
                    }
                    var sortfunc = function (a,b) { return b.weight - a.weight; };

                    while(new_data1.length > that.clubdata_maximum_nodes){
                        new_data1.sort(sortfunc);
                        var a=new_data1.pop();
                    }
                    var others_Slice = { "name":that.clubdata_text, "weight": sum_others, /*"color": that.clubData_color,*/ "tooltip": that.clubdata_tooltip };
                    new_data1.sort(function(a,b){
                        return b.weight - a.weight;
                    })
                    if(new_data1.length < that.clubdata_maximum_nodes){
                        new_data1.push(others_Slice);
                    }
                    that.new_data = new_data1;
                }
                else {
                    that.data.sort(function (a,b) { return b.weight - a.weight; });
                    that.new_data = that.data;
                }
                return this;
            }
        };
        return optional;
    };
};
