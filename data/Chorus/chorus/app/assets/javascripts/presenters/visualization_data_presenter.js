(function(ns) {
    ns.presenters.visualizations = {};

    ns.presenters.visualizations.Timeseries = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(ns.presenters.visualizations.Timeseries.prototype, {
        present: function() {
            var rows = _.map(this.task.get("rows"), function(row) {
                var value = row.value;
                var time = row.time;
                if(!Date.parse(time)) {
                    time = "2001-01-01 "+time.slice(11);
                }
                return {time: time, value: value};
            });

            rows.minY = _.min(_.pluck(rows, "value"));
            rows.maxY = _.max(_.pluck(rows, "value"));
            rows.minX = _.first(_.pluck(rows, "time"));
            rows.maxX = _.last(_.pluck(rows, "time"));

            return rows;
        }
    });

    ns.presenters.visualizations.Boxplot = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(ns.presenters.visualizations.Boxplot.prototype, {
        present: function() {
            var boxes = _.map(this.task.get("rows"), function(row) {
                return {
                    min:           row.min,
                    median:        row.median,
                    bucket:        row.bucket,
                    max:           row.max,
                    firstQuartile: row.firstQuartile,
                    thirdQuartile: row.thirdQuartile,
                    percentage:    row.percentage
                };
            });

            var orderedBoxes = _.sortBy(boxes, function(box) {
                return -1 * parseFloat(box.percentage);
            });

            orderedBoxes.minY = _.min(_.pluck(orderedBoxes, "min"));
            orderedBoxes.maxY = _.max(_.pluck(orderedBoxes, "max"));
            if(orderedBoxes.minY === orderedBoxes.maxY) {
                orderedBoxes.minY -= 1;
                orderedBoxes.maxY += 1;
            }

            return orderedBoxes;
        }
    });

    chorus.presenters.visualizations.Histogram = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(chorus.presenters.visualizations.Histogram.prototype, {
        present: function() {
            return _.map(this.task.get("rows"), function(row) {
                return {bin: row.bin, frequency: row.frequency};
            });
        }
    });

    chorus.presenters.visualizations.Heatmap = function(task, options) {
        this.task = task;
        this.options = options;
    };

    _.extend(chorus.presenters.visualizations.Heatmap.prototype, {
        present: function() {
            var rows = _.clone(this.task.get("rows"));
            
            var xs = _.pluck(rows, 'xLabel');
            var ys = _.pluck(rows, 'yLabel');
            var values = _.pluck(rows, 'value');

            rows.minX = _.min(_.flatten(xs));
            rows.minY = _.min(_.flatten(ys));
            rows.maxX = _.max(_.flatten(xs));
            rows.maxY = _.max(_.flatten(ys));

            rows.minValue = _.min(values);
            rows.maxValue = _.max(values);

            return rows;
        }
    });

})(chorus);
