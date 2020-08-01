chorus.collections.SchemaSet = chorus.collections.Base.include(
    chorus.Mixins.DataSourceCredentials.model
).extend({
    constructorName: "SchemaSet",
    model:chorus.models.Schema,
    urlTemplate:"databases/{{databaseId}}/schemas",

    comparator:function (schema) {
        return schema.get('name').toLowerCase();
    }
});
