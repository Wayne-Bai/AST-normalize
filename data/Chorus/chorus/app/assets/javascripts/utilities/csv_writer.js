chorus.utilities.CsvWriter = function(columnNames, uniqueNames, rows, options) {
    this.options = _.extend({
        delimiter: ","
    }, options);

    this.toCsv = function() {
        var csvData = _.map(columnNames, function(name) {
            return '"'+name+'"';
        }).join(this.delimiter) + "\n";

        _.each(rows, function(row) {
            var orderedRow = _.map(uniqueNames, function(name){
                return '"' + row[name] + '"';
            });
            csvData += orderedRow.join(this.delimiter) + "\n";
        }, this);

        return csvData;
    };
};