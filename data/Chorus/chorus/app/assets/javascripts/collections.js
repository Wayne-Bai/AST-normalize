chorus.collections = {
    Base: Backbone.Collection.include(
        chorus.Mixins.Urls,
        chorus.Mixins.Events,
        chorus.Mixins.Fetching,
        chorus.Mixins.ServerErrors
    ).extend({
        constructorName: "Collection",

        initialize: function(models, options) {
            this.attributes = options || {};
            this.setup(arguments);
        },

        clone: function() {
            var clone = this._super('clone');
            clone.attributes = _.clone(this.attributes);
            return clone;
        },

        setup: $.noop,

        url: function(options) {
            options = _.extend({
                per_page: this.per_page !== undefined ? this.per_page : 50,
                page: 1
            }, options);
            var template = _.isFunction(this.urlTemplate) ? this.urlTemplate(options) : this.urlTemplate;
            var compiledTemplateWith = Handlebars.compile(template, {noEscape: true});

            var uri = new URI("/" + compiledTemplateWith(this.attributes));

            if (this.urlParams) {
                var params = _.isFunction(this.urlParams) ? this.urlParams(options) : this.urlParams;
                uri.addSearch(this.underscoreKeys(params));
            }

            uri.addSearch({
                page: options.page,
                per_page: options.per_page
            });

            if (options.order) {
                uri.addSearch({
                    order: _.underscored(options.order)
                });
            }

            if (this.order) {
                uri.addSearch({
                    order: _.underscored(this.order)
                });
            }

            // this ensures that IE doesn't cache 'needs_login' responses
            if (!window.jasmine) {
                uri.addSearch({iebuster: chorus.cachebuster()});
            }

            return uri.toString();
        },

        isDeleted: function() {
            return false;
        },

        shouldTriggerImmediately: function(eventName) {
            if (eventName === "loaded") {
                return this.loaded;
            }

            return false;
        },

        destroy: function () {
            this.invoke('destroy');
        },

        fetchPage: function(page, options) {
            if (options && options.per_page !== undefined) {
                this.per_page = options.per_page;
                delete options.per_page;
            }
            var url = this.url({ page: page });
            options = _.extend({}, options, { url: url });
            var success = options.success || $.noop;
            options.success = _.bind(function() {
                this.trigger("paginate");
                success(arguments);
            }, this);
            this.fetch(options);
        },

        fetchAll: (function(params) {
            var fetchPage = function(page) {
                this.fetch({
                    url: this.url({ page: page, per_page: 1000 }),
                    silent: true,
                    reset: page === 1,
                    remove: false,
                    success: function(collection, data, xhr) {
                        var total = data.pagination ? parseInt(data.pagination.total, 10) : 1;
                        var page = data.pagination ? parseInt(data.pagination.page, 10) : 1;
                        if (page >= total) {
                            collection.trigger("reset", collection);
                            collection.trigger("loaded");
                            collection.trigger("serverResponded");
                        } else {
                            collection.loaded = false;
                            fetchPage.call(collection, page + 1);
                        }
                    },
                    error: function(collection) {
                        collection.trigger("reset", collection);
                        collection.trigger("loaded");
                        collection.trigger("serverResponded");
                    }
                });
            };

            return function() {
                fetchPage.call(this, 1);
            };
        })(),

        totalRecordCount: function() {
            return (this.pagination && this.pagination.records) || this.models.length;
        },

        sortDesc: function(idx) {
            // Not used. We only do ascending sort for now.
            this._sort(idx, "desc");
        },

        sortAsc: function(idx) {
            // We only support ascending sort at the moment.
            this._sort(idx, "asc");
        },

        updateTags: function(options) {
            if (!this.taggingsUpdater) {
                this.taggingsUpdater = new chorus.models.TaggingsUpdater({
                    collection: this
                });

                this.listenTo(this.taggingsUpdater, "updateFailed", function(modelWithServerErrors) {
                    this.trigger("updateTagsFailed", modelWithServerErrors);
                    this.each(function(model) {
                        model.tags().fetchAll();
                    });
                });
            }

            this.taggingsUpdater.updateTags(options);
        },

        remove: function (models, options) {
            models = _.isArray(models) ? models.slice() : [models];
            options || (options = {});
            var i, l, index, model;
            for (i = 0, l = models.length; i < l; i++) {
                model = this.get(models[i]);
                if (!model) continue;
                delete this._byId[model.id];
                delete this._byId[model.cid];
                index = this.indexOf(model);
                this.models.splice(index, 1);
                this.length--;
                if(this.pagination) this.pagination.records--;
                if (!options.silent) {
                    options.index = index;
                    model.trigger('remove', model, this, options);
                }
                this._removeReference(model);
            }
            return this;
        },

        reset: function(models, options) {
            if (options && options.pagination) {
                this.pagination = _.clone(options.pagination);
            } else if (this.pagination) {
                this.pagination.records = (models || []).length;
            }
            return this._super("reset", [models || [], options]);
        },

        _prepareModel: function() {
            var model = this._super("_prepareModel", arguments);
            this.attributes || (this.attributes = {});
            if (_.isFunction(this.modelAdded)) this.modelAdded(model);
            return model;
        },

        _sort: function(idx, order) {
            // order argument not used at this time. We only support ascending sort for now.
            this.order = idx;
        }
    })
};
chorus.collections.Base.extend = chorus.classExtend;

chorus.collections.LastFetchWins = chorus.collections.Base.extend({
    lastFetchId: 0,

    makeSuccessFunction: function(options, success) {
        var fetchId = ++this.lastFetchId;
        return _.bind(function(collection, data) {
            if (fetchId !== this.lastFetchId) return;
            var parentFunction = this._super("makeSuccessFunction", [options || {}, success]);
            return parentFunction(collection, data);
        }, this);
    }
});
