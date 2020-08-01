chorus.views.KaggleUserItem = chorus.views.Base.extend({
    constructorName: "KaggleUserItem",
    templateName: "kaggle/user_item",
    tagName: "div",

    additionalContext: function() {
        return {
            kaggleRank: new Handlebars.SafeString(t('kaggle.rank', {rankHtml: Handlebars.helpers.spanFor(this.model.get('rank'), {'class': 'kaggle_rank'})})),
            iconUrl: this.model.get("gravatarUrl") || "/images/kaggle/default_user.jpeg",
            name: this.model.name()
        };
    }
});
