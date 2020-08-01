chorus.models.DatasetImportability = chorus.models.Base.extend({
    urlTemplate: function() {
        return "datasets/{{datasetId}}/importability";
    }
});
