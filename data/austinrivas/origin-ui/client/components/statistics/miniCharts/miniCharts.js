Template.miniCharts.rendered = function () {
    if ($(".spark-me").length > 0) {
        $(".spark-me").sparkline("html", {
            height: '25px',
            enableTagOptions: true
        });
    }
};
