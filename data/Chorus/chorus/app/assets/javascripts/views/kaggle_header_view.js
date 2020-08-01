chorus.views.KaggleHeader = chorus.views.Base.extend({
    constructorName: "KaggleHeaderView",
    templateName: "kaggle_header",

    additionalContext: function() {
        return {
            summary:  new Handlebars.SafeString(t("kaggle.summary", {kaggleLink: Handlebars.helpers.linkTo('https://www.kaggle.com', 'Kaggle')})),
            listed_below: new Handlebars.SafeString(t("kaggle.listed_below", {termsOfUseLink: Handlebars.helpers.linkTo('https://www.kaggle.com/connect/terms', 'terms of use'),
                agreementsLink: Handlebars.helpers.linkTo('https://www.kaggle.com/connect/agreements', 'here')}))
        };
    }
});