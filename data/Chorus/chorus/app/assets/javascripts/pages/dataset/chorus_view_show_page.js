chorus.pages.ChorusViewShowPage = chorus.pages.WorkspaceDatasetShowPage.extend({
    constructorName: "ChorusViewShowPage",

    setup: function() {
        this._super("setup", arguments);
        this.subscribePageEvent("dataset:cancelEdit", this.drawColumns);
    },

    makeModel: function(workspaceId, datasetId) {
        this.loadWorkspace(workspaceId);
        this.model = this.dataset = new chorus.models.ChorusView({ workspace: { id: workspaceId }, id: datasetId });
    },

    drawColumns: function() {
        this.mainContent.contentDetails && this.stopListening(this.mainContent.contentDetails, "dataset:edit");
        this._super('drawColumns');
        this.listenTo(this.mainContent.contentDetails, "dataset:edit", this.editChorusView);
    },

    editChorusView: function() {
        this.stopListening(this.mainContent.contentDetails);
        var sameHeader = this.mainContent.contentHeader;

        this.mainContent && this.mainContent.teardown(true);
        this.mainContent = new chorus.views.MainContentView({
            content: new chorus.views.DatasetEditChorusView({model: this.dataset}),
            contentHeader: sameHeader,
            contentDetails: new chorus.views.DatasetContentDetails({ dataset: this.dataset, collection: this.columnSet, inEditChorusView: true })
        });

        this.renderSubview('mainContent');
    },

    constructSidebarForType: function(type) {
        if(type === 'edit_chorus_view') {
            return new chorus.views.DatasetEditChorusViewSidebar({model: this.model});
        } else {
            return this._super('constructSidebarForType', arguments);
        }
    },

    checkEntityType: $.noop
});
