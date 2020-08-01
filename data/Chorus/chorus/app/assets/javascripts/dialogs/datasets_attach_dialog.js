chorus.dialogs.DatasetsAttach = chorus.dialogs.PickItems.extend({
    title: t("dataset.attach"),
    constructorName: "DatasetsAttachDialog",
    submitButtonTranslationKey: "actions.dataset_attach",
    emptyListTranslationKey: "dataset.none",
    searchPlaceholderKey: "dataset.dialog.search",
    selectedEvent: 'datasets:selected',
    modelClass: "WorkspaceDataset",
    pagination: true,
    multiSelection: true,

    makeModel: function() {
        this._super("makeModel", arguments);
        this.collection = new chorus.collections.WorkspaceDatasetSet([], {
            workspaceId: this.options.workspaceId
        });
        this.collection.sortAsc("objectName");
        this.collection.fetch();
    },

    collectionModelContext: function (model) {
        return {
            name: model.get("objectName"),
            imageUrl: model.iconUrl({size: 'icon'})
        };
    }
});