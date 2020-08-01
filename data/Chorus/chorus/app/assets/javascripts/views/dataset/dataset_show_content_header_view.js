chorus.views.DatasetShowContentHeader = chorus.views.ListHeaderView.extend({
    templateName: "dataset_show_content_header",
    additionalClass: 'taggable_header',

    subviews: {
        '.tag_box': 'tagBox'
    },

    setup: function() {
        this.tagBox = new chorus.views.TagBox({
            model: this.model,
            workspaceIdForTagLink: this.options.workspaceId
        });
        this.requiredResources.add(this.model);
    },

    additionalContext: function() {
        return {
            workspacesAssociated: this.model.workspacesAssociated(),
            tableauWorkbooks: this.model.tableauWorkbooks(),
            dataset: this.model.asWorkspaceDataset(),
            showLocation: this.options && this.options.showLocation,
            title: this.model.name(),
            imageUrl: this.model.iconUrl()
        };
    },

    postRender: function() {
        this._super('postRender', arguments);
        this.menu(this.$('.found_in .open_other_menu'), {
            content: this.$('.found_in .other_menu'),
            classes: "found_in_other_workspaces_menu"
        });
        this.menu(this.$('.published_to .open_other_menu'), {
            content: this.$('.published_to .other_menu'),
            classes: "found_in_other_workspaces_menu"
        });
    }
});