chorus.views.KaggleFilterWizard = chorus.views.FilterWizard.extend({
    title: "kaggle.filter.title",

    events: {
        "click .add_filter": "addFilter",
        "click .search_kaggle_user": "filterUsers"
    },

    setup: function() {
        this.collection = this.collection || this.filterCollection();
        this.columnSet = new chorus.collections.KaggleColumnSet();
    },

    filterView: function(filter) {
        return new chorus.views.KaggleFilter({model: filter, collection: this.columnSet});
    },

    filterModel: function() {
        return new chorus.models.KaggleFilter();
    },

    filterCollection: function() {
        return new chorus.collections.KaggleFilterSet();
    },

    extraContent: function() {
        return new Handlebars.SafeString(Handlebars.compile('<button class="search_kaggle_user" type="button">{{t "kaggle.search.users"}}</button>')());
    },

    filterUsers: function() {
        chorus.PageEvents.trigger("filterKaggleUsers", this.collection);
    }
});