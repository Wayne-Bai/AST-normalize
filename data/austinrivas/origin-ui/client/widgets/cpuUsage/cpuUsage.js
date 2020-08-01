Template.cpuUsageWidget.rendered = function () {
    if ($("#flot-cpu").length > 0) {
        var f = [
            [1364598e6, 50],
            [13646016e5, 45],
            [13646052e5, 50],
            [13646088e5, 40],
            [13646124e5, 60],
            [1364616e6, 50],
            [13646196e5, 40],
            [13646232e5, 30],
            [13646268e5, 35],
            [13646304e5, 55],
            [1364634e6, 40],
            [13646376e5, 30],
            [13646412e5, 45],
            [13646448e5, 55],
            [13646484e5, 65],
            [1364652e6, 40],
            [13646556e5, 45],
            [13646592e5, 50],
            [13646628e5, 55],
            [13646664e5, 60],
            [136467e7, 65],
            [13646736e5, 70],
            [13646772e5, 75],
            [13646808e5, 78],
            [13646844e5, 80]
        ];
        $.plot($("#flot-cpu"), [
            {label: "CPU usage", data: f, color: "#74ad4b"}
        ], {xaxis: {min: (new Date("2013/03/30")).getTime(), max: (new Date("2013/03/31")).getTime(), mode: "time", tickSize: [3, "hour"]}, series: {lines: {show: !0, fill: !0}, points: {show: !0}}, grid: {hoverable: !0, clickable: !0}, legend: {show: !1}});
        $("#flot-cpu").bind("plothover", function (e, t, n) {
            if (n) {
                if (previousPoint != n.dataIndex) {
                    previousPoint = n.dataIndex;
                    $("#tooltip").remove();
                    var r = n.datapoint[1].toFixed();
                    showTooltip(n.pageX, n.pageY, n.series.label + " = " + r + "%")
                }
            } else {
                $("#tooltip").remove();
                previousPoint = null
            }
        })
    }
};
