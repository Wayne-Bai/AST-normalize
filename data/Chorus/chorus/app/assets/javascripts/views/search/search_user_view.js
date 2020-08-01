chorus.views.SearchUser = chorus.views.SearchItemBase.extend({
    constructorName: "SearchUserView",
    templateName: "search_user",

    additionalContext: function() {
        var modelWithSearchResults = Handlebars.helpers.withSearchResults(this.model);
        var supportingMessage = _.compact(_.map(["ou", "content", "email", "username"],
            function(fieldName) {
                var value = this.model.highlightedAttribute(fieldName);
                if (value) {
                    var result = {};
                    result[fieldName] = new Handlebars.SafeString(value);
                    return result;
                }
            }, this), this);

        return _.extend(this._super("additionalContext"), {
            iconSrc: this.model.fetchImageUrl({size: "icon"}),
            link: this.model.showUrl(),
            displayName: new Handlebars.SafeString(modelWithSearchResults.displayName()),
            title: modelWithSearchResults.get("title"),
            supportingMessage: supportingMessage.slice(0, 3),
            moreSupportingMessage: supportingMessage.slice(3),
            hasMoreSupportingMessage: Math.max(0, supportingMessage.length - 3)
        });
    }
});