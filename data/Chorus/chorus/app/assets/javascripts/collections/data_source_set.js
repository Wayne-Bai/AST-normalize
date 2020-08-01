chorus.collections.DataSourceSet = chorus.collections.Base.extend({
    urlTemplate: 'data_sources',
    constructorName: 'DataSourceSet',
    model: chorus.models.DynamicDataSource,
    urlParams: function() {
        var params = { all: this.attributes.all };

        if (this.attributes.succinct) {
            params.succinct = true;
        }

        return params;
    },

    comparator: function(dataSource) {
        return dataSource.get("name").toLowerCase();
    }
});
