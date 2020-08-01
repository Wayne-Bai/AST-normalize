chorus.collections.DatasetFilterSet = chorus.collections.Base.extend({
    constructorName: "DatasetFilterSet",
    model: chorus.models.DatasetFilter,

    sqlStrings: function() {
        var wheres = this.map(function(filter) {
            return filter.sqlString();
        });

        wheres = _.without(wheres, "");
        return wheres;
    },

    whereClause: function() {
        var wheres = this.sqlStrings();
        return wheres.length ? ("WHERE " + wheres.join(" AND ")) : "";
    },

    count: function() {
        return this.sqlStrings().length;
    },

    clone: function() {
        var clonedModels = this.map(function(model) {
            return model.clone();
        });
        return new chorus.collections.DatasetFilterSet(clonedModels);
    }
});
