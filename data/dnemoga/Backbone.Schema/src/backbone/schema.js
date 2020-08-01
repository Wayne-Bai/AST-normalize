/*jshint maxstatements:15, maxcomplexity:9, maxlen:104 */
(function (factory) {
    'use strict';

    var isNode = typeof module === 'object' && typeof exports === 'object';

    ////////////////////

    var root = isNode ? {
        _: require('underscore'),
        Backbone: require('backbone'),
        Globalize: require('globalize')
    } : window;

    ////////////////////

    (isNode ? exports : Backbone).Schema = factory(root, isNode);

}(function (root) {
    'use strict';

    var _ = root._, Backbone = root.Backbone, Globalize = root.Globalize;

    ////////////////////

    var Schema = Backbone.Schema = function (model) {

        ////////////////////

        if (!(this instanceof Schema)) {
            return new Schema(model);
        }

        ////////////////////

        this.model = model;
        this.attributes = {};
        model.schema = this;

        ////////////////////

        _.extend(model, {
            toJSON: _.wrap(model.toJSON, function (fn, options) {
                var attributes = fn.call(this, options);

                _.each(attributes, function (value, attribute, attributes) {

                    ////////////////////

                    if (value instanceof Backbone.Model) {
                        value = value.source ? value.id : value.toJSON(options);
                    } else if (value instanceof Backbone.Collection) {
                        value = value.source ? _.pluck(value.models, 'id') : value.toJSON(options);
                    }

                    ////////////////////

                    attributes[attribute] = value;
                });

                return attributes;
            }),

            get: _.wrap(model.get, function (fn, attribute) {

                ////////////////////

                var options = this.schema.attributes[attribute],
                    getter = options && options.getter;

                ////////////////////

                var value = fn.call(this, attribute);

                ////////////////////

                return getter ? getter(attribute, value) : value;
            }),

            set: _.wrap(model.set, function (fn, key, value, options) {

                ////////////////////

                var attributes;

                if (!key || _.isObject(key)) {
                    attributes = key;
                    options = value;
                } else {
                    (attributes = {})[key] = value;
                }

                ////////////////////

                var values = {};

                _.each(attributes, function (value, attribute, attributes) {

                    ////////////////////

                    var options = this.schema.attributes[attribute],
                        setter = options && options.setter;

                    ////////////////////

                    var result = setter ? setter(attribute, value) : _.pick(attributes, attribute);

                    ////////////////////

                    _.each(result, function (value, key) {
                        values[key] = value;
                    });
                }, this);

                return fn.call(this, values, options);
            })
        });
    };

    _.extend(Schema, {
        extend: Backbone.Model.extend
    }, {
        handlers: {
            string: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value) {
                    return _.isString(value) ? value : String(value);
                }
            },

            boolean: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value) {
                    return _.isBoolean(value) ? value : Boolean(value);
                }
            },

            number: {
                getter: function (attribute, value, options) {

                    ////////////////////

                    var culture = options.culture, format = options.format;

                    ////////////////////

                    return format ? Globalize.format(value, format, culture) : value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    var culture = options.culture;

                    ////////////////////

                    var result = Number(value);

                    if (isNaN(result)) {
                        result = _.isString(value) ? value : String(value);
                    }

                    return _.isNumber(result) ? result : Globalize.parseFloat(result, culture) || 'NaN';
                }
            },

            datetime: {
                getter: function (attribute, value, options) {

                    ////////////////////

                    var culture = options.culture, format = options.format;

                    ////////////////////

                    if (!_.isDate(value)) {
                        value = new Date(value);
                    }

                    ////////////////////

                    return format ? Globalize.format(value, format, culture) : value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    var culture = options.culture, format = options.format, standard = options.standard;

                    ////////////////////

                    if(format) {
                        value = Globalize.parseDate(value, format, culture) || new Date(value);
                    } else {
                        value = new Date(value);
                    }

                    ////////////////////

                    var result;

                    switch (standard) {
                    case 'iso':
                        result = value.toJSON() ? value.toISOString() : value.toString();
                        break;
                    case 'unix':
                        result = value.getTime();
                        break;
                    default:
                        result = value;
                        break;
                    }

                    return result;
                }
            },

            locale: {
                getter: function (attribute, value, options) {

                    ////////////////////

                    var culture = options.culture;

                    ////////////////////

                    return Globalize.localize(value, culture) || value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    var culture = options.culture;

                    ////////////////////

                    var result, messages = Globalize.findClosestCulture(culture).messages;

                    _.find(messages, function (localization, message) {
                        return localization === value ? result = message : false;
                    });

                    return result || String(value);
                }
            },

            model: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    options = _.clone(options);

                    ////////////////////

                    var Model, source = options.source, clear = options.clear;

                    Model = options.model || source.model;

                    ////////////////////

                    var model = this.model.get(attribute), attributes;

                    if (value instanceof Backbone.Model) {
                        attributes = value === model ? value : _.clone(value.attributes);
                    } else {
                        attributes = source ? source.get(value) : value;
                    }

                    if (attributes instanceof Model) {
                        model = attributes;
                    } else if (model instanceof Model) {
                        if (clear) {
                            model.clear().set(attributes, options);
                        } else {
                            model.set(attributes, options);
                        }
                    } else {
                        model = new Model(attributes, options);
                    }

                    model.source = source || null;

                    return model;
                }
            },

            collection: {
                getter: function (attribute, value) {
                    return value;
                },

                setter: function (attribute, value, options) {

                    ////////////////////

                    options = _.clone(options);

                    ////////////////////

                    var Collection, source = options.source, reset = options.reset;

                    Collection = options.collection || source.constructor;

                    ////////////////////

                    var collection = this.model.get(attribute), models;

                    if (value instanceof Backbone.Collection) {
                        models = value === collection ? value : _.clone(value.models);
                    } else {
                        models = source ? source.filter(function (model) {
                            return _.contains(value, model.id);
                        }) : value;
                    }

                    if (models instanceof Collection) {
                        collection = models;
                    } else if (collection instanceof Collection) {
                        if (reset) {
                            collection.reset(models, options);
                        } else {
                            collection.set(models, options);
                        }
                    } else {
                        collection = new Collection(models, options);
                    }

                    collection.source = source || null;

                    return collection;
                }
            }
        }
    });

    _.extend(Schema.prototype, {
        constructor: Schema
    }, {
        define: function (attribute, options) {

            ////////////////////

            var attributes;

            if (!attribute || _.isObject(attribute)) {
                attributes = attribute;
            } else {
                (attributes = {})[attribute] = options;
            }

            ////////////////////

            _.each(attributes, function (options, attribute) {

                ////////////////////

                options = options || {};

                ////////////////////

                this._addAttribute(attribute, options);
            }, this);

            this.refresh();

            return this;
        },

        refresh: function () {

            ////////////////////

            var attributes = this.attributes, values = {};

            _.each(attributes, function (options, attribute) {
                values[attribute] = this.model.attributes[attribute];
            }, this);

            ////////////////////

            this.model.set(values);

            return this;
        },

        defaultValue: function (attribute) {

            ////////////////////

            var defaults = _.result(this.model, 'defaults');

            ////////////////////

            return defaults && _.has(defaults, attribute) ? defaults[attribute] : null;
        },

        _addAttribute: function (attribute, options) {

            ////////////////////

            var type = options.type, array = options.array,
                model = options.model, collection = options.collection;

            if (!type) {
                if (array) {
                    type = array;
                } else if (model) {
                    type = 'model';
                } else if (collection) {
                    type = 'collection';
                }
            }

            ////////////////////

            var constructor = this.constructor;

            ////////////////////

            var handlers = constructor.handlers[type],

                getter = handlers && handlers.getter,
                setter = handlers && handlers.setter;

            ////////////////////

            this.attributes[attribute] = _.defaults(options, {
                getter: _.wrap(getter, function (fn, attribute, value) {
                    var results = [], values = array ? value : [value];

                    _.each(values, function (value) {
                        var result;

                        if (_.isNull(value)) {
                            result = value;
                        } else {
                            result = fn ? fn.call(this, attribute, value, options) : value;
                        }

                        results.push(result);
                    }, this);

                    return array ? results : results[0];
                }),

                setter: _.wrap(setter, function (fn, attribute, value) {
                    var results = [], values = array ? value : [value];

                    _.each(values, function (value) {

                        ////////////////////

                        if (_.isUndefined(value)) {
                            value = this.defaultValue(attribute);
                        }

                        ////////////////////

                        var result;

                        if (_.isNull(value)) {
                            switch (type) {
                            case 'model':
                                result = fn ? fn.call(this, attribute, {}, options) : value;
                                break;
                            case 'collection':
                                result = fn ? fn.call(this, attribute, [], options) : value;
                                break;
                            default:
                                result = value;
                                break;
                            }
                        } else {
                            result = fn ? fn.call(this, attribute, value, options) : value;
                        }

                        results.push(result);
                    }, this);

                    return _.object([attribute], [array ? results : results[0]]);
                })
            });

            this._bindHandlers(options);

            return this;
        },

        _bindHandlers: function (options) {

            ////////////////////

            var getter = options.getter, setter = options.setter;

            ////////////////////

            if (getter) options.getter = _.bind(getter, this);
            if (setter) options.setter = _.bind(setter, this);

            return this;
        }
    });

    return Schema;
}));
