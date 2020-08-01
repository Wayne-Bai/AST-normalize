chorus.pages.WorkspaceDatasetShowPage = chorus.pages.DatasetShowPage.extend({
    constructorName: "WorkspaceDatasetShowPage",
    helpId: "dataset",
    isDataSourceBrowser: false,

    crumbs: [],

    setup: function() {
        this._super('setup', arguments);

        this.sidebarOptions = {
            workspace: this.workspace,
            requiredResources: [ this.workspace ]
        };

        this.contentDetailsOptions = { workspace: this.workspace };

        this.subNav = new chorus.views.SubNav({workspace: this.workspace, tab: "datasets"});
    },

    makeModel: function(workspaceId, datasetId) {
        this.loadWorkspace(workspaceId, {required: true});
        this.model = this.dataset = new chorus.models.WorkspaceDataset({ workspace: { id: workspaceId }, id: datasetId });
    },

    bindCallbacks: function() {
        this._super('bindCallbacks');
        this.subscribePageEvent("cancel:sidebar", this.hideSidebar);
    },

    showSidebar: function(type) {
        this.$('.sidebar_content.primary').addClass("hidden");
        this.$('.sidebar_content.secondary').removeClass("hidden");

        if (this.secondarySidebar) {
            this.secondarySidebar.teardown();
            delete this.secondarySidebar;
        }

        this.mainContent.content.selectMulti = false;
        this.secondarySidebar = this.constructSidebarForType(type);

        if (this.secondarySidebar) {
            this.secondarySidebar.filters = this.mainContent.contentDetails.filterWizardView.collection;
            this.secondarySidebar.errorContainer = this.mainContent.contentDetails;
            this.renderSubview('secondarySidebar');
            this.trigger('resized');
        }
    },

    hideSidebar: function(type) {
        this.dataset.clearDatasetNumber();
        this.columnSet.reset(this.dataset.columns().models);
        this.mainContent.content.selectMulti = false;
        this.mainContent.content.showDatasetName = false;
        this.sidebar.disabled = false;

        if (this.secondarySidebar) {
            this.secondarySidebar.teardown(true);
            delete this.secondarySidebar;
        }

        this.mainContent.content.render();
        this.$('.sidebar_content.primary').removeClass("hidden");
        this.$('.sidebar_content.secondary').addClass("hidden");
        this.$('.sidebar_content.secondary').removeClass("dataset_create_" + type + "_sidebar");
        this.trigger('resized');
    },

    getHeaderView: function(options) {
        return new chorus.views.DatasetShowContentHeader(_.extend({
            showLocation: true,
            workspaceId: this.workspace.id
        }, options));
    },

    constructSidebarForType: function(type) {
        this.dataset.setDatasetNumber(1);
        this.sidebar.disabled = true;
        this.mainContent.content.selectMulti = true;
        this.mainContent.content.showDatasetName = true;
        this.mainContent.content.render();
        this.mainContent.content.selectNone();
        return new chorus.views.CreateChorusViewSidebar({model: this.model, aggregateColumnSet: this.columnSet});
    }
});
