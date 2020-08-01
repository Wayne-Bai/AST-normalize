chorus.models.BoxplotTask = chorus.models.ChartTask.extend({
    chartType: "boxplot",
    columnLabels : {
        "bucket" : "dataset.visualization.boxplot.bucket",
        "min" : "dataset.visualization.boxplot.minimum",
        "median" : "dataset.visualization.boxplot.median",
        "max" : "dataset.visualization.boxplot.maximum",
        "percentage" : "dataset.visualization.boxplot.percentage",
        "firstQuartile" : "dataset.visualization.boxplot.1stquartile",
        "thirdQuartile" : "dataset.visualization.boxplot.3rdquartile"
    },

    getSortedRows : function(rows) {
        return _.sortBy(rows, function(row) {
            return -1 * parseFloat(row.percentage);
        });
    },

    beforeSave: function() {
        this._super("beforeSave");
        this.set({
            'chart[bins]' : this.get("bins"),
            'chart[xAxis]': this.get("xAxis"),
            'chart[yAxis]': this.get("yAxis")
        });
    }
});
