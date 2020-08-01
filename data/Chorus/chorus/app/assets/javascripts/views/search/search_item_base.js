chorus.views.SearchItemBase = chorus.views.Base.extend(chorus.Mixins.TagsContext).extend({
    tagName: "div",
    additionalClass: "result_item",

    events: {
        "click a.show_more_comments": "showMoreComments",
        "click a.show_fewer_comments": "showFewerComments"
    },

    additionalContext: function() {
        return this.additionalContextForTags();
    },

    postRender: function() {
        var commentsView = this.makeCommentList();
        this.$(".comments_container").append(commentsView.render().el);
    },

    makeCommentList: function() {
        return new chorus.views.SearchResultCommentList({comments: this.getComments(), columns: this.getColumns(),
            columnDescriptions: this.getColumnDescriptions(), tableDescription: this.getTableDescription()});
    },

    getTableDescription: function() {
        var descriptions = this.model.get("tableDescription") || [];
        _.each(descriptions, function(description) { description.subType = 'table_description'; });

        return descriptions;
    },

    getColumns: function() {
        var columns = this.model.get("columns") || [];
        _.each(columns, function(column) { column.subType = 'column'; });

        return columns;
    },

    getColumnDescriptions: function() {
        var columnDescriptions = this.model.get("columnDescriptions") || [];
        _.each(columnDescriptions, function(columnDescription) { columnDescription.subType = 'column_description'; });

        return columnDescriptions;
    },

    getComments: function() {
        return this.model.get("comments") || [];
    },

    showMoreComments: function(evt) {
        evt && evt.preventDefault();
        this.$(".has_more_comments").addClass("hidden");
        this.$(".more_comments").removeClass("hidden");
    },

    showFewerComments: function(evt) {
        evt && evt.preventDefault();
        this.$(".has_more_comments").removeClass("hidden");
        this.$(".more_comments").addClass("hidden");
    }
});