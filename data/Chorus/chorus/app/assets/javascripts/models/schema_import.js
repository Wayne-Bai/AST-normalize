chorus.models.SchemaImport = chorus.models.Base.extend({
    constructorName: "SchemaImport",
    urlTemplate: "schemas/{{schemaId}}/imports",
    parameterWrapper: 'dataset_import',

    declareValidations: function(newAttrs) {
        if (newAttrs.newTable === "true") {
            this.requirePattern("toTable", chorus.ValidationRegexes.ChorusIdentifier64(), newAttrs, 'import.validation.toTable.required');
        }

        this.requirePattern("truncate", chorus.ValidationRegexes.Boolean(), newAttrs);
        this.requirePattern("newTable", chorus.ValidationRegexes.Boolean(), newAttrs);

        if (newAttrs.useLimitRows) {
            this.requirePositiveInteger("sampleCount", newAttrs, 'import.validation.sampleCount.positive');
        }
    }
});
