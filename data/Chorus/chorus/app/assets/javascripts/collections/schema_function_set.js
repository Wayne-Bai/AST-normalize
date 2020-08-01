chorus.collections.SchemaFunctionSet = chorus.collections.Base.extend({
    constructorName: "SchemaFunctionSet",
    model:chorus.models.SchemaFunction,
    urlTemplate:"schemas/{{id}}/functions",

    comparator:function (schemaFunction) {
        return schemaFunction.get('name').toLowerCase();
    }
});
