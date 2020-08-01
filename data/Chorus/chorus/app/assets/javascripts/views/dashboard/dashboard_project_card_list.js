    chorus.views.DashboardProjectCardList = chorus.views.DashboardModule.extend({
    constructorName: "DashboardProjectCardList",
    additionalClass: "project_list",

    setup: function () {
        this.contentHeader = new chorus.views.ProjectListHeader();
        this.contentHeader.list = this;
    },

    fillOutContent: function(option) {
        var workspaceSet = new chorus.collections.WorkspaceSet();

        workspaceSet.attributes.showLatestComments = true;
        workspaceSet.attributes.succinct = true;
        workspaceSet.attributes.active = true;
        if(option) {
            workspaceSet.attributes.getOptions = option;
        }
        workspaceSet.sortAsc("name");
        workspaceSet.fetchAll();

        this.content = new chorus.views.DashboardProjectList({ collection: workspaceSet, option: option });
        this.contentHeader.projectlist = this.content;
        this.render();
    }
});
