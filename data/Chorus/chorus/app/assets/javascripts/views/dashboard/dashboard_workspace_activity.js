chorus.views.DashboardWorkspaceActivity = chorus.views.Base.extend({
    constructorName: "DashboardWorkspaceActivity",
    templateName:"dashboard/workspace_activity",
    entityType: "workspace_activity",
    events: {
        "change .date_group_filter": "onFilterChange"
    },
    setup: function() {
        this.date_options = {
            'day_7': {
                dateGroup: 'day',
                dateParts: 7,
                tickFcn: d3.time.days
            },
            'week_4': {
                dateGroup: 'week',
                dateParts: 4,
                tickFcn: d3.time.weeks
            },
            'week_12': {
                dateGroup: 'week',
                dateParts: 12,
                tickFcn: d3.time.weeks
            }
        };

        this.model = new chorus.models.DashboardData({});
        this.requiredResources.add(this.model);

        this.cur_date_opt = 'day_7';
        this.model.urlParams = {
            entityType: this.entityType,
            dateGroup: 'day',
            dateParts: 7
        };
        this.tickFcn = d3.time.days;
        this.model.fetch();

        this.vis = {
            // Properties about data provided by server
            dataSettings: {
                date_format: d3.time.format("%Y-%m-%d") // d3.time.format.iso
            },

            // Data to be rendered.
            data: null,

            // Reference to the SVG canvas rendered into
            canvas: null,

            // Properties for each entity we'll include in the visualization
            entities: {
                // The stacked chart
                chart: {
                    // Reference to the domElement
                    domElement: null,
                    // Params we'll use during rendering
                    properties: {
                        margin: {
                            top:    20,
                            right:  40,
                            bottom: 40,
                            left:   40
                        },
                        get height () {
                            return 340 - this.margin.top - this.margin.bottom;
                        },
                        get width () {
                            return 960 - this.margin.left - this.margin.right;
                        },
                        // Groovy colors: fillColors: ['#B343BB', '#2A8C82', '#999989', '#CFCF15', '#393BBD', '#FF9C1A', '#91C531', '#DC2C2C', '#666666', '#DE592C']
                        fillColors: ['#3182bd', '#6baed6', '#9ecae1', '#e6550d', '#fd8d3c', '#fdae6b', '#31a354', '#74c476', '#A1D99B', '#756bb1']
                    }
                },
                // hovercard shown in the chart upon mouseover
                hovercard: {
                    // Params we'll use during rendering
                    properties: {
                    }
                }
            }
        };
    },
    additionalContext: function () {
        return {
            modelLoaded: this.model.get("data") !== undefined,
            hasModels: this.model.get("data") ? this.model.get("data").events && this.model.get("data").events.length > 0 : false
        };
    },
    onFilterChange: function(e) {
        e && e.preventDefault();
        this.cur_date_opt = this.selectElement().val();
        var opt = this.date_options[this.cur_date_opt];
        this.model.urlParams = {
            entityType: this.entityType,
            dateGroup: opt.dateGroup,
            dateParts: opt.dateParts
        };
        this.tickFcn = opt.tickFcn;
        this.model.fetch();
    },
    selectElement: function() {
        return this.$("select.date_group_filter");
    },
    postRender: function() {
        // Bind date filter selection
        _.defer(_.bind(function () {
            chorus.styleSelect(this.selectElement());
        }, this));
        this.selectElement().val(this.cur_date_opt);

        // Load raw data used in visualization:
        var fetchedData = this.model.get("data");

        var workspaces = fetchedData.workspaces;
        var tickLabels = fetchedData.labels;
        var data = this.vis.data = _.each(
            fetchedData.events,
            function(pt) {
                if (typeof pt.datePart === 'string' || pt.datePart instanceof String) {
                    pt.datePart = this.vis.dataSettings.date_format.parse(pt.datePart);
                }
            },
            this);

        if (fetchedData === null || workspaces === null || tickLabels === null || data === null ||
            workspaces.length === 0 || tickLabels.length === 0 || data.length === 0) {
                this.$(".chart").html( t("dashboard.workspace_activity.no_activity.text") );
            return;
        }

        // We use "nest" to transform it into d3-style dictionary, with key: workspaceId, values: data rows having workspaceId.
        var event_counts_by_workspace_id = d3.nest()
            .key(function(d) {
                return d.workspaceId;
            });
        // Sort the workspaces such that the most active appears on the top
        var processed_data = event_counts_by_workspace_id.entries(data)
            .sort(function(a,b) {
                return (a.values[0].rank > b.values[0].rank)? 1 : (a.rank === b.rank)? 0 : -1;
            });

        // Entities in the visualization:
        var chart = this.vis.entities.chart;

        // Set up scaling functions and the axes
        var xScale  = d3.time.scale().range([0, chart.properties.width]),
            yScale = d3.scale.linear().range([chart.properties.height, 0]);

        var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(this.tickFcn)
                .tickValues(_.uniq(_.map(data, function(d) {return d.datePart;}), function (d) { return JSON.stringify(d); }))
                .tickFormat(function(d) {
                    var ind = Math.floor((tickLabels.length - 1)*xScale(d)/chart.properties.width);
                    return tickLabels[ind];
                });

        // Our chart will contain a "stack layout": https://github.com/mbostock/d3/wiki/Stack-Layout
        var stackLayout = d3.layout.stack()
            .offset("zero")
            .values(function(d) { return d.values; })
            // Date on x-axis
            .x(function(d) { return d.datePart; })
            // Count on y-axis
            .y(function(d) { return d.eventCount; });
        var layers = stackLayout(processed_data);

        // Function yielding the areas to fill in
        var areaFcn = d3.svg.area()
            .interpolate("cardinal")
            .x(function(d) {
                return xScale(d.datePart);
            })
            .y0(function(d) {
                return yScale(d.y0);
            })
            .y1(function(d) {
                return yScale(d.y0 + d.y);
            });
        xScale.domain(d3.extent(data, function(d) { return d.datePart; }));
        yScale.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

        var colorFillFcn = d3.scale.ordinal()
            .domain(_.range(chart.properties.fillColors.length))
            .range(chart.properties.fillColors);

        //// Rendering:
        var $el = this.$(".chart");
        $el.html("").addClass("visualization");
        chart.domElement = $el;

        var w = chart.properties.width + chart.properties.margin.left + chart.properties.margin.right;
        var h = chart.properties.height + chart.properties.margin.top + chart.properties.margin.bottom;

        var svg = d3.select($el[0]).append("svg");
        var canvas = this.vis.canvas = svg
            .attr("preserveAspectRatio", "xMidYMid")
            .attr("width", w)
            .attr("height", h)
            .attr("viewbox", "0 0 " + w +  " " + h)
            .append("g")
            .attr("transform", "translate(" + chart.properties.margin.left + "," + chart.properties.margin.top + ")");

        // Clip interpolation layers beneath x-axis
        canvas.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("x", "0")
            .attr("y", -chart.properties.margin.top)
            .attr("width", chart.properties.width)
            .attr("height", chart.properties.height + chart.properties.margin.top);

        canvas.selectAll(".layer")
            .data(layers)
            .enter()
            .append("path")
            .attr("class", "layer")
            .attr("d", function(d) { return areaFcn(d.values); })
            .style("fill", function(d, i) {
                return colorFillFcn(i);
            })
            .attr("clip-path", "url(#clip)")
            .each(function(s) {
                var wid = workspaces.map(function(e) { return e.workspaceId; }).indexOf(1*s.key);

				// generate the content of the hovercard.
				// ...this should be in a template...

                // name
                var workspace_name = !workspaces[wid].isAccessible? '<div class="inactive">' + workspaces[wid].name + '</div>': '<a href="#workspaces/' + workspaces[wid].workspaceId + '" title="'+ workspaces[wid].name + '">' + workspaces[wid].name + '</a>';
                var hovercard_name_html = '<div class="name_row">' + workspace_name + '</div>';

				// workspace description, if there is one 
                var hovercard_summary_html = workspaces[wid].summary ? '<div class="summary_row" id="colorFillFcn(wid)"><p>' + workspaces[wid].summary + '</p></div>' : "";

                // metric value
                var hovercard_activityMetric = workspaces[wid].eventCount;
                var hovercard_activityMetric_html = '<div class="activity_metric_row"><p title="' + t("dashboard.workspace_activity.metric_tip") + '">' + t("dashboard.workspace_activity.metric") + " " + hovercard_activityMetric + '</p></div>';

                var hovercard_html = hovercard_name_html + hovercard_summary_html + hovercard_activityMetric_html;

                $(this).qtip({
                    content: {
                        button: true,
                        text: hovercard_html
                    },
                    hide: {
                        event: 'mouseout',
                        delay: 400,
                        fixed: true,
                        effect: {
                            type: 'fade',
                            length: 32
                        }
                    },
                    show: {
                        solo: true, 
                        effect: {
                            type: 'fade',
                            length: 170
                        }        
                    },
                    position: {
                        target: 'mouse',
                        adjust: {
                            mouse: false
                        },
                        at: 'topLeft',
                        my: 'bottomCenter'
                    },
                    style: {
                        classes: "tooltip-white hovercard",
                        tip: {
                            width: 12,
                            height: 15
                        }
                    }
                });
            });

        canvas.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.properties.height + ")")
            .call(xAxis)
            .selectAll("text")
            .call(this.wrap, chart.properties.width / (tickLabels.length + 4));
    },
    wrap: function (text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
            word = words.pop();
            while (word) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }

                word = words.pop();
            }
        });
    },
    _log: function(type, msg) {
        chorus.isDevMode() && chorus.toast("=> " + type + ": " + msg, { skipTranslation: true });
    }
});
