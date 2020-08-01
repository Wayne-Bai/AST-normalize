chorus.dialogs.PickWorkspace = chorus.dialogs.PickItems.extend({
    title: t("dataset.associate.title.one"),
    constructorName: "PickWorkspaceDialog",
    submitButtonTranslationKey: "dataset.associate.button.one",
    emptyListTranslationKey: "dataset.associate.empty.placeholder",
    searchPlaceholderKey: "dataset.associate.search",
    selectedEvent: 'files:selected',
    modelClass: "Workspace",

    makeModel: function() {
        this.pageModel = this.options.pageModel;
        this.collection = new chorus.collections.FilteringCollection(null, {collection: this.defaultWorkspaces()});
        this.collection.fetchAll();
    },

    defaultWorkspaces: function() {
        if (this.options.activeOnly) {
            return chorus.session.user().activeWorkspaces();
        }
        return chorus.session.user().workspaces();
    },

    collectionModelContext: function(model) {
        return {
            name: model.name(),
            imageUrl: model.defaultIconUrl("small")
        };
    }
});
