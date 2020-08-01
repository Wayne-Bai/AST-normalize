
jQuery(function() {

    var cpuMetricsPeriod = 12 * 60 * 60;        // 12 hours
    var vcpuMetricsPeriod = 12 * 60 * 60;       // 12 hours
    var memoryMetricsPeriod = 12 * 60 * 60;     // 12 hours
    var diskMetricsPeriod = 12 * 60 * 60;       // 12 hours
    var interval = 60;                          // 1 minute
    
    var cpuMetricsData = [{
            color: '#2ca02c',
            key: 'CPU',
            values: getValues(cpuMetricsUrl, cpuMetricsPeriod)
    }];
    var vcpuMetricsData = [{
            color: '#2ca02c',
            key: 'VCPU',
            values: getValues(vcpuMetricsUrl, vcpuMetricsPeriod)
    }];
    var memoryMetricsData = [{
            color: '#2ca02c',
            key: 'Memory',
            values: getValues(memoryMetricsUrl, memoryMetricsPeriod)
    }];
    var diskMetricsData = [{
            color: '#2ca02c',
            key: 'Disk',
            values: getValues(diskMetricsUrl, diskMetricsPeriod)
    },{
            color: '#ff7f0e',
            key: 'Ephemeral Disk',
            values: getValues(diskEphemeralUrl, diskMetricsPeriod)
    }];

    function calcEndTimestamp(values) {
        return values[values.length - 1].x;
    }

    function calcStartTimestamp(endTimestamp, period) {
        return endTimestamp - (period * 1000);
    }
    
    function calcTickValues(startTimestamp, period, tickCount) {
        var tickValues = [];
        var tickInterval = period * 1000 / tickCount;
        for (x = 1; x <= tickCount; x++) {
            var tickValue = startTimestamp + tickInterval*x;
            tickValue = tickValue - (tickValue % tickInterval);
            tickValues.push(tickValue);
        }
        return tickValues;
    }

    function drawLineChart(id, data, period, yAxisLabel) {
        nv.addGraph(function() {
            var lineChart = nv.models.lineChart()
                    .margin({left:80})
                    .forceY([0]);
            var endTimestamp = calcEndTimestamp(data[0].values);
            var startTimestamp = calcStartTimestamp(endTimestamp, period);
            lineChart.xDomain([startTimestamp, endTimestamp]);
            var tickValues = calcTickValues(startTimestamp, period, 12);
            lineChart.xAxis
                    .rotateLabels(-45)
                    .showMaxMin(false)
                    .tickValues(tickValues)
                    .tickFormat(function(x) { return d3.time.format('%I:%M%p')(new Date(x)); });
            lineChart.yAxis
                    .axisLabel(yAxisLabel)
                    .tickFormat(d3.format('.2f'));
            lineChart.tooltipContent(function(key, x, y, e, graph) { return '<h3>' + key + '<h3><p>' + y + ' ' + yAxisLabel + ' at ' + d3.time.format('%x %I:%M%p')(new Date(e.point.x)) + '</p>';});
            redrawChart(id, data, lineChart);
            nv.utils.windowResize(lineChart.update);
            return lineChart;
        });
    }
    
    function redrawChart(id, data, chart) {
        d3.select(id+' svg')
            .datum(data)
            .transition().duration(500)
            .call(chart);
    }

/*
    var multiMetricsData = [{
            key: 'VCPU',
            type: 'bar',
            yAxis: '1',
            values: getValues(vcpuMetricsUrl, vcpuMetricsPeriod)
    },{
            key: 'Memory',
            type: 'line',
            yAxis: '2',
            values: getValues(memoryMetricsUrl, memoryMetricsPeriod)
    }];
    // Example of a multiChart.
    function drawMultiMetricsChart(id, data) {
        nv.addGraph(function() {
            // Specify all the margins due to a bug in multiChart.
            var multiMetricsChart = nv.models.multiChart()
                    .margin({top: 30, right: 80, bottom: 50, left: 80})
                    .color(d3.scale.category10().range());
            multiMetricsChart.lines1.forceY([0]);
            multiMetricsChart.lines2.forceY([0]);
            multiMetricsChart.xAxis
                    .rotateLabels(-45)
                    .tickFormat(function(x) { return d3.time.format('%I:%M%p')(new Date(x)); });
            multiMetricsChart.yAxis1
                    .axisLabel('# of VCPUs')
                    .tickFormat(d3.format('.2f'));
            multiMetricsChart.yAxis2
                    .axisLabel('Memory (MB)')
                    .tickFormat(d3.format('.2f'));
            multiMetricsChart.tooltipContent(function(key, x, y, e, graph) { return '<h3>' + key + '<h3><p>' + y + ' at ' + d3.time.format('%x %I:%M%p')(new Date(e.point.x)) + '</p>';});
            redrawChart(id, data, multiMetricsChart);
            nv.utils.windowResize(multiMetricsChart.update);
            return multiMetricsChart;
        });
    }
*/
    function getValues(url, period) {
        var values = [];
        jQuery.ajax({
            async: false,
            dataType: "json",
            url: url+'&period='+period,
            success: function(data) {
                jQuery.each(data, function() {
                    values.push({
                        x: d3.time.format('%Y-%m-%dT%H:%M:%S').parse(this.x),
                        y: this.y
                    });
                });
            }
        });
        return values;
    }
/*
    // Used for development purposes.
    function getValues(url, period) {
        var values = [];
        var endTimestamp = new Date().getTime();
        var timestamp = endTimestamp - (period * 1000);
        while (timestamp < endTimestamp) {
            values.push({
                x: timestamp,
                y: Math.floor(Math.random() * 100)
            });
            // Random 1 - 20 minutes (in milliseconds.)
            var randomMinutes = (Math.floor(Math.random() * 20) + 1) * 60 * 1000;
            // Random 1 - 60 seconds (in milliseconds.)
            var randomSeconds = (Math.floor(Math.random() * 60) + 1) * 1000;
            timestamp = timestamp + randomMinutes + randomSeconds;
        }
        
        return values;
    }
*/
    function scheduleLineChartUpdate(id, data, period, yAxisLabel, urls, interval) {
        setInterval(function () {
            for (var i = 0; i < urls.length; i++) {
                var values = data[i].values;
                var newValues = getValues(urls[i], interval);
                if (newValues.length > 0) {
                    for (x = 0; x < newValues.length; x++) {
                        values.push(newValues[x]);
                    }
                    var endTimestamp = calcEndTimestamp(values);
                    var startTimestamp = calcStartTimestamp(endTimestamp, period);
                    while (values[1].x < startTimestamp) {
                        values.shift();
                    }
                }
            }
            drawLineChart(id, data, period, yAxisLabel);
        }, interval*1000);
    }

    //drawMultiMetricsChart("#multiMetricsChart", multiMetricsData);
    drawLineChart('#cpuMetricsChart', cpuMetricsData, cpuMetricsPeriod, 'CPU Utilization');
    drawLineChart('#vcpuMetricsChart', vcpuMetricsData, vcpuMetricsPeriod, '# of VCPUs');
    drawLineChart('#memoryMetricsChart', memoryMetricsData, memoryMetricsPeriod, 'Memory (MB)');
    drawLineChart('#diskMetricsChart', diskMetricsData, diskMetricsPeriod, 'Disk (GB)');
    //scheduleLineChartUpdate('#cpuMetricsChart', cpuMetricsData, cpuMetricsPeriod, 'CPU Utilization', [cpuMetricsUrl], interval);
    //scheduleLineChartUpdate('#vcpuMetricsChart', vcpuMetricsData, vcpuMetricsPeriod, '# of VCPUs', [vcpuMetricsUrl], interval);
    //scheduleLineChartUpdate('#memoryMetricsChart', memoryMetricsData, memoryMetricsPeriod, 'Memory (MB)', [memoryMetricsUrl], interval);
    //scheduleLineChartUpdate('#diskMetricsChart', diskMetricsData, diskMetricsPeriod, 'Disk (GB)', [diskMetricsUrl, diskEphemeralUrl], interval);
});