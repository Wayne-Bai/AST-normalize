chorus.views.UserItem = chorus.views.Base.include(chorus.Mixins.TagsContext).extend({
    constructorName: "UserItemView",
    templateName: "user/user_item",
    tagName: "div",

    additionalContext: function() {
        return _.extend(this.additionalContextForTags(), {
            admin: this.model.isAdmin(),
            iconUrl: this.model.fetchImageUrl({size: "icon"}),
            url: this.model.showUrl(),
            name: this.model.displayName(),
            title: this.model.get("title")
        });
    },

    postRender: function() {
        $(this.el).attr("data-userId", this.model.id);
    }
});
