chorus.models.PgDataSource = chorus.models.DataSource.extend({
    constructorName: 'PgDataSource',
    entityType: 'pg_data_source',
    showUrlTemplate: "data_sources/{{id}}/databases",
    parameterWrapper: "data_source",
    defaults: {
        entityType: 'pg_data_source'
    },

    databases: function() {
        this._databases || (this._databases = new chorus.collections.DatabaseSet([], {dataSourceId: this.get("id")}));
        return this._databases;
    }
});
