chorus.views.DataSourceListSidebar = chorus.views.Sidebar.extend({
    constructorName: "DataSourceListSidebarView",
    templateName: "data_source_list_sidebar",
    useLoadingSection: true,

    subviews: {
        '.tab_control': 'tabs',
        '.workspace_usage_container': 'workspaceUsagesWidget'
    },

    events: {
        "click .edit_tags": 'startEditingTags',
        "click .remove_credentials": 'launchRemoveCredentialsAlert',
        "click .edit_data_source": 'editDataSource',
        "click .delete_data_source": 'deleteDataSource'
    },

    setup: function() {
        this.subscribePageEvent("data_source:selected", this.setDataSource);
        this.tabs = new chorus.views.TabControl(["activity", "configuration"]);
    },

    additionalContext: function() {
        if (!this.model) {
            return {};
        }

        var dataSourceType = this.model.get("isHawq") ? "hawq_data_source" : this.model.get("entityType");
        var dataSourceAccounts = this.dataSource.accounts();
        var dataSourceAccountsCount = dataSourceAccounts.persistedAccountCount ? dataSourceAccounts.persistedAccountCount() : dataSourceAccounts.length;

        return {
            hasUsage: this.model.usage(),
            userHasAccount: this.model.accountForCurrentUser() && this.model.accountForCurrentUser().has("id"),
            userCanEditPermissions: this.canEditPermissions(),
            userCanEditDataSource: this.canEditDataSource(),
            dataSourceAccountsCount: dataSourceAccountsCount,
            isOnlineOrOffline: this.dataSource.isOnline() || this.dataSource.isOffline(),
            entityType: this.model.entityType,
            dataSourceProvider: t("data_sources.provider." + dataSourceType),
            shared: this.model.isShared && this.model.isShared(),
            isGnip: this.model.isGnip()
        };
    },

    setUpWorkspaceUsagesWidget: function() {
        this.workspaceUsagesWidget = new chorus.views.DataSourceWorkspaceUsagesWidget();
    },

    setupSubviews: function() {
        this.tabs.activity && this.tabs.activity.teardown();
        this.tabs.configuration && this.tabs.configuration.teardown();
        this.setUpWorkspaceUsagesWidget();
        if (this.dataSource) {
            this.tabs.activity = new chorus.views.ActivityList({
                collection: this.dataSource.activities(),
                displayStyle: 'without_object'
            });

            this.tabs.configuration = new chorus.views.DataSourceConfigurationDetails({ model: this.dataSource });

            this.registerSubView(this.tabs.activity);
            this.registerSubView(this.tabs.configuration);

            this.registerSubView(this.workspaceUsagesWidget);
            this.workspaceUsagesWidget.setDataSource(this.dataSource);
        }
    },

    clear: function() {
        this.resource = this.dataSource = this.model = undefined;
        this.render();
    },

    setDataSource: function(dataSource) {
        this.resource = this.dataSource = this.model = dataSource;

        this.resource.loaded = true;

        this.dataSource.activities().fetch();

        this.requiredResources.reset();
        this.listenTo(this.resource, "change", this.render);

        if(this.resource.isGreenplum() || this.resource.isPostgres() || this.resource.isOracle() || this.resource.isJdbc()) {
            var account = this.dataSource.accountForCurrentUser();
            this.dataSource.accounts().fetchAllIfNotLoaded();
            account.fetchIfNotLoaded();
            this.requiredResources.push(this.dataSource.accounts());
            this.requiredResources.push(account);
            this.listenTo(this.dataSource.accounts(), "change", this.render);
            this.listenTo(this.dataSource.accounts(), "remove", this.render);
            this.listenTo(account, "change", this.render);
            this.listenTo(account, "fetchFailed", this.render);
        }

        this.workspaceUsagesWidget || this.setUpWorkspaceUsagesWidget();
        this.workspaceUsagesWidget.setDataSource(this.dataSource);
        this.render();
    },

    postRender: function() {
        this._super("postRender");
        if (this.dataSource) {
            this.$("a.dialog").data("dataSource", this.dataSource);
        }
    },

    canEditPermissions: function() {
        return this.resource.canHaveIndividualAccounts() && this.adminOrOwner();
    },

    canEditDataSource: function() {
        return !this.options.searchPage && this.adminOrOwner();
    },

    adminOrOwner: function() {
        return this.resource.owner().get("id") === chorus.session.user().get("id") || chorus.session.user().get("admin");
    },

    startEditingTags: function(e) {
        e.preventDefault();
        new chorus.dialogs.EditTags({collection: new chorus.collections.Base([this.model])}).launchModal();
    },

    launchRemoveCredentialsAlert: function(e){
        e && e.preventDefault();
        new chorus.alerts.DataSourceAccountDelete({dataSource: this.model}).launchModal();
    },

    editDataSource: function(e) {
        e.preventDefault();
        new chorus.dialogs.DataSourceEdit({model: this.model}).launchModal();
    },

    deleteDataSource: function(e) {
        e.preventDefault();
        new chorus.alerts.DataSourceDelete({model: this.model}).launchModal();
    }
});
