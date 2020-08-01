chorus.models.Sandbox = chorus.models.Base.extend({
    constructorName: "Sandbox",
    attrToLabel: {
        "dataSourceName": "data_sources.dialog.data_source_name",
        "databaseName": "data_sources.dialog.database_name",
        "schemaName": "data_sources.dialog.schema_name"
    },

    urlTemplate: "workspaces/{{workspaceId}}/sandbox",

    declareValidations: function(attrs) {
        var missingDb = !this.get('databaseId') && !attrs["databaseId"];
        var missingSchema = !this.get('schemaId') && !attrs["schemaId"];
        if(missingSchema || missingDb) {
            this.require("schemaName", attrs);
            this.requirePattern("schemaName", chorus.ValidationRegexes.PostgresIdentifier(63), attrs);
        }
        if(missingDb) {
            this.require("databaseName", attrs);
            this.requirePattern("databaseName", chorus.ValidationRegexes.PostgresIdentifier(63), attrs);
        }
    },

    dataSource: function() {
        this._dataSource = this._dataSource || this.database().dataSource();
        return this._dataSource;
    },

    database: function() {
        this._database = this._database || this.schema().database();

        return this._database;
    },

    schema: function() {
        this._schema = this._schema || new chorus.models.Schema(this.attributes);

        return this._schema;
    },

    canonicalName: function() {
        return this.schema().canonicalName();
    }
});
