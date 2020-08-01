/**
 * User: austinrivas
 * Date: 5/2/13
 * Time: 2:04 AM
 * To change this template use File | Settings | File Templates.
 */
function showTooltip(e, t, n) {
    $('<div id="tooltip" class="flot-tooltip tooltip"><div class="tooltip-arrow"></div>' + n + "</div>").css({top: t - 43, left: e - 15}).appendTo("body").fadeIn(200)
}

Template.hddUsageWidget.rendered = function () {
    var f = [
        [1364598e6, 10],
        [13646016e5, 12],
        [13646052e5, 14],
        [13646088e5, 14],
        [13646124e5, 10],
        [1364616e6, 16],
        [13646196e5, 18],
        [13646232e5, 15],
        [13646268e5, 16],
        [13646304e5, 18],
        [1364634e6, 20],
        [13646376e5, 22],
        [13646412e5, 24],
        [13646448e5, 25],
        [13646484e5, 27],
        [1364652e6, 31],
        [13646556e5, 33],
        [13646592e5, 36],
        [13646628e5, 37],
        [13646664e5, 38],
        [136467e7, 39],
        [13646736e5, 42],
        [13646772e5, 45],
        [13646808e5, 47],
        [13646844e5, 50]
    ];
    $.plot($("#flot-hdd"), [
        {label: "HDD usage", data: f, color: "#f36b6b"}
    ], {xaxis: {min: (new Date("2013/03/30")).getTime(), max: (new Date("2013/03/31")).getTime(), mode: "time", tickSize: [3, "hour"]}, series: {lines: {show: !0, fill: !0}, points: {show: !0}}, grid: {hoverable: !0, clickable: !0}, legend: {show: !1}});
    $("#flot-hdd").bind("plothover", function (e, t, n) {
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
    });
};