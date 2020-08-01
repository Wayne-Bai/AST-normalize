chorus.views.PickItemsList = chorus.views.Base.extend({
    constructorName: "PickItemsList",

    templateName: 'pick_items_list',

    events: {
        "click li": 'itemClicked'
    },

    subviews: {
        ".pagination": "paginationView"
    },

    setup: function() {
        if(this.options.pagination) {
            this.paginationView = new chorus.views.ListContentDetails({
                collection: this.collection,
                modelClass: this.options.modelClass
            });
        }

        this.options.selectedItemIds = [];

        if(this.options.defaultSelection) {
            if(this.options.multiSelection) {
                this.options.selectedItemIds = this.options.defaultSelection.pluck('id');
            } else {
                this.options.selectedItemIds.push(this.options.defaultSelection.id);
            }
            this.options.selectedItemIds = _.map(this.options.selectedItemIds, function(id) { return id.toString(); });
        }
        this.listenTo(this.collection, 'searched', this.render);
    },

    additionalContext: function() {
        return {
            pagination: this.options.pagination,
            emptyListTranslationKey: this.options.emptyListTranslationKey || "pickitem.dialog.empty"
        };
    },

    itemClicked: function(e) {
        var selectedItemId = $(e.currentTarget).data('id').toString();
        if(this.options.multiSelection) {
            if(this.isSelected(selectedItemId)) {
                this.options.selectedItemIds.splice(this.options.selectedItemIds.indexOf(selectedItemId), 1);
            } else {
                this.options.selectedItemIds.push(selectedItemId);
            }
        } else {
            this.options.selectedItemIds = [selectedItemId];
        }

        _.each(this.$('li'), _.bind(function(item) {
            item = $(item);
            if(this.isSelected(item.data('id'))) {
                item.addClass('selected');
            } else {
                item.removeClass('selected');
            }
        }, this));
        this.trigger("item:selected", this.selectedItem());
    },

    selectedItem: function() {
        if(this.options.multiSelection) {
            return _.map(this.options.selectedItemIds, _.bind(function(id) {
                return this.collection.get(id);
            }, this));
        } else {
            return this.collection.get(this.options.selectedItemIds[0]);
        }
    },

    isSelected: function(model) {
        model = (model.id || model).toString();
        return _.include(this.options.selectedItemIds, model);
    },

    collectionModelContext: function(model) {
        var self = this;
        return _.extend(this.baseCollectionModelContext(model), {
            selected: self.isSelected(model) ? "selected" : ""
        });
    }
});
