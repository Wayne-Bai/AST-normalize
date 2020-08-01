chorus.Mixins.SQLResults = {
    getRows: function() {
        var rows = this.get("rows"),
            columns = this.getColumns(),
            column,
            value;
        return _.map(rows, function(row) {
            return _.inject(_.zip(columns, row), function(memo, columnValuePair) {
                column = columnValuePair[0];
                value = columnValuePair[1];
                memo[column.uniqueName] = value;
                return memo;
            }, {});
        });
    },

    getColumns: function() {
        var columns = this.get("columns");
        _.each(columns, function(column, index) {
            column["uniqueName"] = column["name"] + "_" + index;
        });
        return columns;
    },

    getErrors: function() {
        return this.attributes;
    },

    getColumnLabel: function(columnName) {
        return columnName;
    },

    getSortedRows: function(rows) {
        return rows;
    },

    hasResults: function() {
        return !!this.getRows().length;
    }
};
