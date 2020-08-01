chorus.pages.WorkspaceTagShowPage = chorus.pages.TagShowPage.extend({
    crumbs: [],

    searchInMenuOptions: function() {
        return this._super("searchInMenuOptions", arguments).concat([
            { data: "this_workspace", text: t("search.in.this_workspace", {workspaceName: this.search.workspace().get("name")}) }
        ]);
    },

    typeOptions: function() {
        var options = this._super("typeOptions", arguments);
        if (this.search.isScoped()) {
            var toDisable = ["data_source", "user", "workspace", "hdfs_entry"];
            _.each(options, function(option) {
                if (_.include(toDisable, option.data)) {
                    option.disabled = true;
                }
            });
        }

        return options;
    },

    makeModel: function(workspaceId) {
        this.workspaceId = workspaceId;
        this._super("makeModel", Array.prototype.slice.call(arguments, 1));

        this.workspace = this.search.workspace();
        this.requiredResources.add(this.workspace);
    },

    parseSearchParams: function(searchParams) {
        return _.extend(this._super("parseSearchParams", [ searchParams ]), {
            workspaceId: this.workspaceId
        });
    },

    setup: function() {
        this.listenTo(this.search.workspace(), "loaded", this.resourcesLoaded);
        this.workspace.fetch();
    },

    resourcesLoaded: function() {
        if(this.search.workspace().loaded && this.search.loaded) {
            this._super("resourcesLoaded", arguments);
        }
    }
});
