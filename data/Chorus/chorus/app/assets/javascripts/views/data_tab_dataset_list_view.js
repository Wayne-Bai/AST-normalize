chorus.views.DataTabDatasetList = chorus.views.Base.extend({
    constructorName: "DataTabDatasetListView",
    templateName: "data_tab_dataset_list",
    useLoadingSection: true,

    datasetViewsAreDirty: true,

    events: {
        "click a.more"  : "fetchMoreDatasets"
    },

    setup: function() {
        this.listenTo(this.collection, "reset", this.markDatasetViewsAsDirty);
        this.listenTo(this.collection, "add", this.markDatasetViewsAsDirty);
        this.listenTo(this.collection, "searched", this.rebuildDatasetViews);
        this.datasetViews = [];
    },

    markDatasetViewsAsDirty: function() {
        this.datasetViewsAreDirty = true;
    },

    postRender: function() {
        if (this.datasetViewsAreDirty) {
            this.rebuildDatasetViews();
            this.datasetViewsAreDirty = false;
        }
        _.each(this.datasetViews, function(view) {
            this.$("ul").append(view.render().$el);
            view.delegateEvents();
        }, this);

        this.setupDragging();
    },

    rebuildDatasetViews: function() {
        _.each(this.datasetViews, function(view) {
            view.teardown();
        });

        this.datasetViews = [];
        this.collection.each(function(model) {
            var datasetView = new chorus.views.DataTabDataset({model: model});
            this.datasetViews.push(datasetView);
            this.registerSubView(datasetView);
        }, this);

        this.render();
    },

    fetchMoreDatasets: function(e) {
        e && e.preventDefault();
        this.trigger('fetch:more');
    },

    setupDragging: function() {
        this.$("ul.list li").draggable({
            cursorAt: { top: 0, left: 0 },
            containment: "document",
            appendTo: "body",
            helper: this.dragHelper
        });
    },

    dragHelper: function(e) {
        var $dragEl = $(e.currentTarget).clone().addClass("drag_helper");
        $dragEl.find(".column_list").remove();
        return $dragEl;
    },

    additionalContext:function () {
        var ctx = {};
        if (this.collection.pagination) {
            ctx.showMoreLink = this.collection.pagination.page < this.collection.pagination.total;
        }
        return ctx;
    },

    displayLoadingSection: function () {
        return !(this.collection && this.collection.loaded || this.collection.serverErrors);
    }
});