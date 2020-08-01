chorus.models.DatasetFilter = chorus.models.Filter.extend({
    constructorName: "DatasetFilter",

    getFilterMap: function() {
        switch (this.has("column") && this.get("column").get("typeCategory")) {
        case "STRING":
        case "LONG_STRING":
            return new chorus.models.DatasetFilterMaps.String();
        case "BOOLEAN":
            return new chorus.models.DatasetFilterMaps.Boolean();
        case "WHOLE_NUMBER":
        case "REAL_NUMBER":
            return new chorus.models.DatasetFilterMaps.Numeric();
        case "DATE":
            return new chorus.models.DatasetFilterMaps.Date();
        case "TIME":
            return new chorus.models.DatasetFilterMaps.Time();
        case "DATETIME":
            return new chorus.models.DatasetFilterMaps.Timestamp();
        default:
            return new chorus.models.DatasetFilterMaps.Other();
        }
    },

    sqlString: function() {
        var columnName = this.get("column") && this.get("column").quotedName();
        var comparatorName = this.get("comparator");
        var inputValue = this.get("input") && this.get("input").value;

        return (columnName && comparatorName) ? this.getFilterMap().comparators[comparatorName].generate(columnName, inputValue) : "";
    },

    isComplete: function() {
        var usesInput = this.getFilterMap().comparators[this.get('comparator')].usesInput;
        var input = this.get("input") && this.get("input").value;
        return !!(!usesInput || input);
    }
});