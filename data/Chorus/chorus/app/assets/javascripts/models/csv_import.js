chorus.models.CSVImport = chorus.models.Base.extend({
    constructorName: "CSVImport",
    urlTemplate: "workspaces/{{workspaceId}}/csv/{{csvId}}/imports",
    paramsToIgnore: ['contents'],
    parameterWrapper: 'csv_import',

    declareValidations:function (newAttrs) {
        if (this.get("destinationType") !== "existing") {
            this.requirePattern('toTable', chorus.ValidationRegexes.ChorusIdentifier64(), newAttrs, "import.validation.toTable.required");
        }
    }
});
