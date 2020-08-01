chorus.collections.WorkspaceImportSet = chorus.collections.Base.extend({
    constructorName: "WorkspaceImportSet",
    model:chorus.models.WorkspaceImport,
    urlTemplate: "workspaces/{{workspaceId}}/datasets/{{datasetId}}/imports"
});