/*
  knockback-core-stack.js 0.20.5
  Copyright (c)  2011-2015 Kevin Malakoff.
  License: MIT (http://www.opensource.org/licenses/mit-license.php)
  Source: https://github.com/kmalakoff/knockback
  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("jquery"));
	else if(typeof define === 'function' && define.amd)
		define(["jquery"], factory);
	else if(typeof exports === 'object')
		exports["kb"] = factory(require("jquery"));
	else
		root["kb"] = factory(root["jQuery"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_15__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);
	__webpack_require__(8);
	__webpack_require__(9);
	__webpack_require__(10);
	__webpack_require__(11);
	__webpack_require__(12);
	__webpack_require__(13);
	module.exports = __webpack_require__(14);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var COMPARE_ASCENDING, COMPARE_DESCENDING, COMPARE_EQUAL, KEYS_PUBLISH, _, kb, ko, ref,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
	  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko;

	COMPARE_EQUAL = 0;

	COMPARE_ASCENDING = -1;

	COMPARE_DESCENDING = 1;

	KEYS_PUBLISH = ['destroy', 'shareOptions', 'filters', 'comparator', 'sortAttribute', 'viewModelByModel', 'hasViewModels'];

	kb.compare = function(value_a, value_b) {
	  if (_.isString(value_a)) {
	    return value_a.localeCompare("" + value_b);
	  }
	  if (_.isString(value_b)) {
	    return value_b.localeCompare("" + value_a);
	  }
	  if (value_a === value_b) {
	    return COMPARE_EQUAL;
	  } else {
	    if (value_a < value_b) {
	      return COMPARE_ASCENDING;
	    } else {
	      return COMPARE_DESCENDING;
	    }
	  }
	};

	kb.CollectionObservable = (function() {
	  CollectionObservable.extend = kb.extend;

	  function CollectionObservable(collection, view_model, options) {
	    this._onCollectionChange = bind(this._onCollectionChange, this);
	    var args;
	    args = Array.prototype.slice.call(_.isArguments(collection) ? collection : arguments);
	    return kb.ignore((function(_this) {
	      return function() {
	        var arg, create_options, i, len, observable;
	        collection = args[0] instanceof kb.Collection ? args.shift() : (_.isArray(args[0]) ? new kb.Collection(args.shift()) : new kb.Collection());
	        if (_.isFunction(args[0])) {
	          args[0] = {
	            view_model: args[0]
	          };
	        }
	        options = {};
	        for (i = 0, len = args.length; i < len; i++) {
	          arg = args[i];
	          _.extend(options, arg);
	        }
	        observable = kb.utils.wrappedObservable(_this, ko.observableArray([]));
	        observable.__kb_is_co = true;
	        _this.in_edit = 0;
	        _this.__kb || (_this.__kb = {});
	        options = kb.utils.collapseOptions(options);
	        if (options.auto_compact) {
	          _this.auto_compact = true;
	        }
	        if (options.sort_attribute) {
	          _this._comparator = ko.observable(_this._attributeComparator(options.sort_attribute));
	        } else {
	          _this._comparator = ko.observable(options.comparator);
	        }
	        if (options.filters) {
	          _this._filters = ko.observableArray(_.isArray(options.filters) ? options.filters : options.filters ? [options.filters] : void 0);
	        } else {
	          _this._filters = ko.observableArray([]);
	        }
	        create_options = _this.create_options = {
	          store: kb.Store.useOptionsOrCreate(options, collection, observable)
	        };
	        kb.utils.wrappedObject(observable, collection);
	        _this.path = options.path;
	        create_options.factory = kb.utils.wrappedFactory(observable, _this._shareOrCreateFactory(options));
	        create_options.path = kb.utils.pathJoin(options.path, 'models');
	        create_options.creator = create_options.factory.creatorForPath(null, create_options.path);
	        if (create_options.creator) {
	          _this.models_only = create_options.creator.models_only;
	        }
	        kb.publishMethods(observable, _this, KEYS_PUBLISH);
	        _this._collection = ko.observable(collection);
	        observable.collection = _this.collection = ko.computed({
	          read: function() {
	            return _this._collection();
	          },
	          write: function(new_collection) {
	            return kb.ignore(function() {
	              var previous_collection;
	              if ((previous_collection = _this._collection()) === new_collection) {
	                return;
	              }
	              kb.utils.wrappedObject(observable, new_collection);
	              if (previous_collection) {
	                previous_collection.unbind('all', _this._onCollectionChange);
	              }
	              if (new_collection) {
	                new_collection.bind('all', _this._onCollectionChange);
	              }
	              return _this._collection(new_collection);
	            });
	          }
	        });
	        if (collection) {
	          collection.bind('all', _this._onCollectionChange);
	        }
	        _this._mapper = ko.computed(function() {
	          var comparator, current_collection, filter, filters, j, len1, models, previous_view_models, view_models;
	          comparator = _this._comparator();
	          filters = _this._filters();
	          if (filters) {
	            for (j = 0, len1 = filters.length; j < len1; j++) {
	              filter = filters[j];
	              ko.utils.unwrapObservable(filter);
	            }
	          }
	          current_collection = _this._collection();
	          if (_this.in_edit) {
	            return;
	          }
	          observable = kb.utils.wrappedObservable(_this);
	          previous_view_models = kb.peek(observable);
	          if (current_collection) {
	            models = current_collection.models;
	          }
	          if (!models || (current_collection.models.length === 0)) {
	            view_models = [];
	          } else {
	            models = _.filter(models, function(model) {
	              return !filters.length || _this._selectModel(model);
	            });
	            if (comparator) {
	              view_models = _.map(models, function(model) {
	                return _this._createViewModel(model);
	              }).sort(comparator);
	            } else {
	              if (_this.models_only) {
	                view_models = filters.length ? models : models.slice();
	              } else {
	                view_models = _.map(models, function(model) {
	                  return _this._createViewModel(model);
	                });
	              }
	            }
	          }
	          _this.in_edit++;
	          observable(view_models);
	          _this.in_edit--;
	        });
	        observable.subscribe(_.bind(_this._onObservableArrayChange, _this));
	        !kb.statistics || kb.statistics.register('CollectionObservable', _this);
	        return observable;
	      };
	    })(this));
	  }

	  CollectionObservable.prototype.destroy = function() {
	    var array, collection, observable;
	    this.__kb_released = true;
	    observable = kb.utils.wrappedObservable(this);
	    collection = kb.peek(this._collection);
	    kb.utils.wrappedObject(observable, null);
	    if (collection) {
	      collection.unbind('all', this._onCollectionChange);
	      array = kb.peek(observable);
	      array.splice(0, array.length);
	    }
	    this.collection.dispose();
	    this._collection = observable.collection = this.collection = null;
	    this._mapper.dispose();
	    this._mapper = null;
	    kb.release(this._filters);
	    this._filters = null;
	    this._comparator(null);
	    this._comparator = null;
	    this.create_options = null;
	    observable.collection = null;
	    kb.utils.wrappedDestroy(this);
	    return !kb.statistics || kb.statistics.unregister('CollectionObservable', this);
	  };

	  CollectionObservable.prototype.shareOptions = function() {
	    var observable;
	    observable = kb.utils.wrappedObservable(this);
	    return {
	      store: kb.utils.wrappedStore(observable),
	      factory: kb.utils.wrappedFactory(observable)
	    };
	  };

	  CollectionObservable.prototype.filters = function(filters) {
	    if (filters) {
	      return this._filters(_.isArray(filters) ? filters : [filters]);
	    } else {
	      return this._filters([]);
	    }
	  };

	  CollectionObservable.prototype.comparator = function(comparator) {
	    return this._comparator(comparator);
	  };

	  CollectionObservable.prototype.sortAttribute = function(sort_attribute) {
	    return this._comparator(sort_attribute ? this._attributeComparator(sort_attribute) : null);
	  };

	  CollectionObservable.prototype.viewModelByModel = function(model) {
	    var id_attribute;
	    if (this.models_only) {
	      return null;
	    }
	    id_attribute = model.hasOwnProperty(model.idAttribute) ? model.idAttribute : 'cid';
	    return _.find(kb.peek(kb.utils.wrappedObservable(this)), function(test) {
	      var ref1;
	      if (test != null ? (ref1 = test.__kb) != null ? ref1.object : void 0 : void 0) {
	        return test.__kb.object[id_attribute] === model[id_attribute];
	      } else {
	        return false;
	      }
	    });
	  };

	  CollectionObservable.prototype.hasViewModels = function() {
	    return !this.models_only;
	  };

	  CollectionObservable.prototype.compact = function() {
	    return kb.ignore((function(_this) {
	      return function() {
	        var observable;
	        observable = kb.utils.wrappedObservable(_this);
	        if (!kb.utils.wrappedStoreIsOwned(observable)) {
	          return;
	        }
	        kb.utils.wrappedStore(observable).clear();
	        return _this._collection.notifySubscribers(_this._collection());
	      };
	    })(this));
	  };

	  CollectionObservable.prototype._shareOrCreateFactory = function(options) {
	    var absolute_models_path, existing_creator, factories, factory;
	    absolute_models_path = kb.utils.pathJoin(options.path, 'models');
	    factories = options.factories;
	    if ((factory = options.factory)) {
	      if ((existing_creator = factory.creatorForPath(null, absolute_models_path)) && (!factories || (factories['models'] === existing_creator))) {
	        if (!factories) {
	          return factory;
	        }
	        if (factory.hasPathMappings(factories, options.path)) {
	          return factory;
	        }
	      }
	    }
	    factory = new kb.Factory(options.factory);
	    if (factories) {
	      factory.addPathMappings(factories, options.path);
	    }
	    if (!factory.creatorForPath(null, absolute_models_path)) {
	      if (options.hasOwnProperty('models_only')) {
	        if (options.models_only) {
	          factory.addPathMapping(absolute_models_path, {
	            models_only: true
	          });
	        } else {
	          factory.addPathMapping(absolute_models_path, kb.ViewModel);
	        }
	      } else if (options.view_model) {
	        factory.addPathMapping(absolute_models_path, options.view_model);
	      } else if (options.create) {
	        factory.addPathMapping(absolute_models_path, {
	          create: options.create
	        });
	      } else {
	        factory.addPathMapping(absolute_models_path, kb.ViewModel);
	      }
	    }
	    return factory;
	  };

	  CollectionObservable.prototype._onCollectionChange = function(event, arg) {
	    return kb.ignore((function(_this) {
	      return function() {
	        var collection, comparator, observable, view_model;
	        if (_this.in_edit || kb.wasReleased(_this)) {
	          return;
	        }
	        switch (event) {
	          case 'reset':
	            if (_this.auto_compact) {
	              _this.compact();
	            } else {
	              _this._collection.notifySubscribers(_this._collection());
	            }
	            break;
	          case 'sort':
	          case 'resort':
	            _this._collection.notifySubscribers(_this._collection());
	            break;
	          case 'new':
	          case 'add':
	            if (!_this._selectModel(arg)) {
	              return;
	            }
	            observable = kb.utils.wrappedObservable(_this);
	            collection = _this._collection();
	            if (collection.indexOf(arg) === -1) {
	              return;
	            }
	            if ((view_model = _this.viewModelByModel(arg))) {
	              return;
	            }
	            _this.in_edit++;
	            if ((comparator = _this._comparator())) {
	              observable().push(_this._createViewModel(arg));
	              observable.sort(comparator);
	            } else {
	              observable.splice(collection.indexOf(arg), 0, _this._createViewModel(arg));
	            }
	            _this.in_edit--;
	            break;
	          case 'remove':
	          case 'destroy':
	            _this._onModelRemove(arg);
	            break;
	          case 'change':
	            if (!_this._selectModel(arg)) {
	              return _this._onModelRemove(arg);
	            }
	            view_model = _this.models_only ? arg : _this.viewModelByModel(arg);
	            if (!view_model) {
	              return _this._onCollectionChange('add', arg);
	            }
	            if (!(comparator = _this._comparator())) {
	              return;
	            }
	            _this.in_edit++;
	            kb.utils.wrappedObservable(_this).sort(comparator);
	            _this.in_edit--;
	        }
	      };
	    })(this));
	  };

	  CollectionObservable.prototype._onModelRemove = function(model) {
	    var observable, view_model;
	    view_model = this.models_only ? model : this.viewModelByModel(model);
	    if (!view_model) {
	      return;
	    }
	    observable = kb.utils.wrappedObservable(this);
	    this.in_edit++;
	    observable.remove(view_model);
	    return this.in_edit--;
	  };

	  CollectionObservable.prototype._onObservableArrayChange = function(models_or_view_models) {
	    return kb.ignore((function(_this) {
	      return function() {
	        var collection, current_view_model, has_filters, i, len, model, models, observable, view_model, view_models;
	        if (_this.in_edit) {
	          return;
	        }
	        (_this.models_only && (!models_or_view_models.length || kb.isModel(models_or_view_models[0]))) || (!_this.models_only && (!models_or_view_models.length || (_.isObject(models_or_view_models[0]) && !kb.isModel(models_or_view_models[0])))) || kb._throwUnexpected(_this, 'incorrect type passed');
	        observable = kb.utils.wrappedObservable(_this);
	        collection = kb.peek(_this._collection);
	        has_filters = kb.peek(_this._filters).length;
	        if (!collection) {
	          return;
	        }
	        view_models = models_or_view_models;
	        if (_this.models_only) {
	          models = _.filter(models_or_view_models, function(model) {
	            return !has_filters || _this._selectModel(model);
	          });
	        } else {
	          !has_filters || (view_models = []);
	          models = [];
	          for (i = 0, len = models_or_view_models.length; i < len; i++) {
	            view_model = models_or_view_models[i];
	            model = kb.utils.wrappedObject(view_model);
	            if (has_filters) {
	              if (!_this._selectModel(model)) {
	                continue;
	              }
	              view_models.push(view_model);
	            }
	            if (current_view_model = _this.create_options.store.find(model, _this.create_options.creator)) {
	              (current_view_model.constructor === view_model.constructor) || kb._throwUnexpected(_this, 'replacing different type of view model');
	            }
	            _this.create_options.store.retain(view_model, model, _this.create_options.creator);
	            models.push(model);
	          }
	        }
	        _this.in_edit++;
	        (models_or_view_models.length === view_models.length) || observable(view_models);
	        _.isEqual(collection.models, models) || collection.reset(models);
	        _this.in_edit--;
	      };
	    })(this));
	  };

	  CollectionObservable.prototype._attributeComparator = function(sort_attribute) {
	    var modelAttributeCompare;
	    modelAttributeCompare = function(model_a, model_b) {
	      var attribute_name;
	      attribute_name = ko.utils.unwrapObservable(sort_attribute);
	      return kb.compare(model_a.get(attribute_name), model_b.get(attribute_name));
	    };
	    return (this.models_only ? modelAttributeCompare : function(model_a, model_b) {
	      return modelAttributeCompare(kb.utils.wrappedModel(model_a), kb.utils.wrappedModel(model_b));
	    });
	  };

	  CollectionObservable.prototype._createViewModel = function(model) {
	    if (this.models_only) {
	      return model;
	    }
	    return this.create_options.store.retainOrCreate(model, this.create_options);
	  };

	  CollectionObservable.prototype._selectModel = function(model) {
	    var filter, filters, i, len, ref1;
	    filters = kb.peek(this._filters);
	    for (i = 0, len = filters.length; i < len; i++) {
	      filter = filters[i];
	      filter = kb.peek(filter);
	      if (_.isFunction(filter)) {
	        if (!filter(model)) {
	          return false;
	        }
	      } else if (_.isArray(filter)) {
	        if (ref1 = model.id, indexOf.call(filter, ref1) < 0) {
	          return false;
	        }
	      } else {
	        if (model.id !== filter) {
	          return false;
	        }
	      }
	    }
	    return true;
	  };

	  return CollectionObservable;

	})();

	kb.collectionObservable = function(collection, view_model, options) {
	  return new kb.CollectionObservable(arguments);
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var ALL_ORMS, _, kb, key, ko, ref, value;

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko;

	ALL_ORMS = {
	  "default": null,
	  'backbone-orm': null,
	  'backbone-associations': __webpack_require__(16),
	  'backbone-relational': __webpack_require__(17),
	  supermodel: __webpack_require__(18)
	};

	kb.orm = ALL_ORMS["default"];

	for (key in ALL_ORMS) {
	  value = ALL_ORMS[key];
	  if (value && value.isAvailable()) {
	    kb.orm = value;
	    break;
	  }
	}

	module.exports = function(options) {
	  var orm;
	  if (options == null) {
	    options = {};
	  }
	  for (key in options) {
	    value = options[key];
	    switch (key) {
	      case 'orm':
	        if (_.isString(value)) {
	          if (!ALL_ORMS.hasOwnProperty(value)) {
	            console.log("Knockback configure: could not find orm: " + value + ". Available: " + (_.keys(ALL_ORMS).join(', ')));
	            continue;
	          }
	          if ((orm = ALL_ORMS[value]) && !orm.isAvailable()) {
	            console.log("Knockback configure: could not enable orm " + value + ". Make sure it is included before Knockback");
	            continue;
	          }
	          kb.orm = orm;
	          continue;
	        } else {
	          kb.orm = value;
	        }
	        break;
	      default:
	        kb[key] = value;
	    }
	  }
	};


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _, kb, ko, ref,
	  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko;

	kb.EventWatcher = (function() {
	  EventWatcher.useOptionsOrCreate = function(options, emitter, obj, callback_options) {
	    if (options.event_watcher) {
	      if (!(options.event_watcher.emitter() === emitter || (options.event_watcher.model_ref === emitter))) {
	        kb._throwUnexpected(this, 'emitter not matching');
	      }
	      return kb.utils.wrappedEventWatcher(obj, options.event_watcher).registerCallbacks(obj, callback_options);
	    } else {
	      kb.utils.wrappedEventWatcherIsOwned(obj, true);
	      return kb.utils.wrappedEventWatcher(obj, new kb.EventWatcher(emitter)).registerCallbacks(obj, callback_options);
	    }
	  };

	  function EventWatcher(emitter, obj, callback_options) {
	    this._unbindCallbacks = bind(this._unbindCallbacks, this);
	    this._onModelUnloaded = bind(this._onModelUnloaded, this);
	    this._onModelLoaded = bind(this._onModelLoaded, this);
	    this.__kb || (this.__kb = {});
	    this.__kb.callbacks = {};
	    this.ee = null;
	    if (callback_options) {
	      this.registerCallbacks(obj, callback_options);
	    }
	    if (emitter) {
	      this.emitter(emitter);
	    }
	  }

	  EventWatcher.prototype.destroy = function() {
	    this.emitter(null);
	    this.__kb.callbacks = null;
	    return kb.utils.wrappedDestroy(this);
	  };

	  EventWatcher.prototype.emitter = function(new_emitter) {
	    if ((arguments.length === 0) || (this.ee === new_emitter)) {
	      return this.ee;
	    }
	    if (this.model_ref) {
	      this.model_ref.unbind('loaded', this._onModelLoaded);
	      this.model_ref.unbind('unloaded', this._onModelUnloaded);
	      this.model_ref.release();
	      this.model_ref = null;
	    }
	    if (kb.Backbone && kb.Backbone.ModelRef && (new_emitter instanceof kb.Backbone.ModelRef)) {
	      this.model_ref = new_emitter;
	      this.model_ref.retain();
	      this.model_ref.bind('loaded', this._onModelLoaded);
	      this.model_ref.bind('unloaded', this._onModelUnloaded);
	      new_emitter = this.model_ref.model() || null;
	    } else {
	      delete this.model_ref;
	    }
	    if (this.ee !== new_emitter) {
	      if (new_emitter) {
	        this._onModelLoaded(new_emitter);
	      } else {
	        this._onModelUnloaded(this.ee);
	      }
	    }
	    return new_emitter;
	  };

	  EventWatcher.prototype.registerCallbacks = function(obj, callback_info) {
	    var event_name, event_names, fn, i, len, model;
	    obj || kb._throwMissing(this, 'obj');
	    callback_info || kb._throwMissing(this, 'callback_info');
	    event_names = callback_info.event_selector ? callback_info.event_selector.split(' ') : ['change'];
	    model = this.ee;
	    fn = (function(_this) {
	      return function(event_name) {
	        var callbacks, info;
	        if (!(callbacks = _this.__kb.callbacks[event_name])) {
	          callbacks = _this.__kb.callbacks[event_name] = {
	            model: null,
	            list: [],
	            fn: function(model) {
	              var info, j, len1, ref1;
	              ref1 = callbacks.list;
	              for (j = 0, len1 = ref1.length; j < len1; j++) {
	                info = ref1[j];
	                if (!info.update) {
	                  continue;
	                }
	                if (model && info.key && (model.hasChanged && !model.hasChanged(ko.utils.unwrapObservable(info.key)))) {
	                  continue;
	                }
	                !kb.statistics || kb.statistics.addModelEvent({
	                  name: event_name,
	                  model: model,
	                  key: info.key,
	                  path: info.path
	                });
	                info.update();
	              }
	              return null;
	            }
	          };
	        }
	        callbacks.list.push(info = _.defaults({
	          obj: obj
	        }, callback_info));
	        if (model) {
	          return _this._onModelLoaded(model);
	        }
	      };
	    })(this);
	    for (i = 0, len = event_names.length; i < len; i++) {
	      event_name = event_names[i];
	      if (!event_name) {
	        continue;
	      }
	      fn(event_name);
	    }
	    return this;
	  };

	  EventWatcher.prototype.releaseCallbacks = function(obj) {
	    var callbacks, event_name, ref1;
	    this.ee = null;
	    ref1 = this.__kb.callbacks;
	    for (event_name in ref1) {
	      callbacks = ref1[event_name];
	      this._unbindCallbacks(event_name, callbacks, kb.wasReleased(obj));
	    }
	    return delete this.__kb.callbacks;
	  };

	  EventWatcher.prototype._onModelLoaded = function(model) {
	    var callbacks, event_name, i, info, len, ref1, ref2, ref3;
	    this.ee = model;
	    ref1 = this.__kb.callbacks;
	    for (event_name in ref1) {
	      callbacks = ref1[event_name];
	      if (callbacks.model && (callbacks.model !== model)) {
	        this._unbindCallbacks(event_name, callbacks, true);
	      }
	      if (!callbacks.model) {
	        callbacks.model = model;
	        model.bind(event_name, callbacks.fn);
	      }
	      ref2 = callbacks.list;
	      for (i = 0, len = ref2.length; i < len; i++) {
	        info = ref2[i];
	        info.unbind_fn || (info.unbind_fn = (ref3 = kb.orm) != null ? ref3.bind(model, info.key, info.update, info.path) : void 0);
	        if (info.emitter) {
	          info.emitter(model);
	        }
	      }
	    }
	  };

	  EventWatcher.prototype._onModelUnloaded = function(model) {
	    var callbacks, event_name, ref1;
	    if (this.ee !== model) {
	      return;
	    }
	    this.ee = null;
	    ref1 = this.__kb.callbacks;
	    for (event_name in ref1) {
	      callbacks = ref1[event_name];
	      this._unbindCallbacks(event_name, callbacks);
	    }
	  };

	  EventWatcher.prototype._unbindCallbacks = function(event_name, callbacks, skip_emitter) {
	    var i, info, len, ref1;
	    if (callbacks.model) {
	      callbacks.model.unbind(event_name, callbacks.fn);
	      callbacks.model = null;
	    }
	    ref1 = callbacks.list;
	    for (i = 0, len = ref1.length; i < len; i++) {
	      info = ref1[i];
	      if (info.unbind_fn) {
	        info.unbind_fn();
	        info.unbind_fn = null;
	      }
	      if (info.emitter && !skip_emitter && !kb.wasReleased(info.obj)) {
	        info.emitter(null);
	      }
	    }
	  };

	  return EventWatcher;

	})();

	kb.emitterObservable = function(emitter, observable) {
	  return new kb.EventWatcher(emitter, observable);
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _, kb;

	_ = (kb = __webpack_require__(6))._;

	kb.Factory = (function() {
	  Factory.useOptionsOrCreate = function(options, obj, owner_path) {
	    var factory;
	    if (options.factory && (!options.factories || (options.factories && options.factory.hasPathMappings(options.factories, owner_path)))) {
	      return kb.utils.wrappedFactory(obj, options.factory);
	    }
	    factory = kb.utils.wrappedFactory(obj, new kb.Factory(options.factory));
	    if (options.factories) {
	      factory.addPathMappings(options.factories, owner_path);
	    }
	    return factory;
	  };

	  function Factory(parent_factory) {
	    this.paths = {};
	    if (parent_factory) {
	      this.parent_factory = parent_factory;
	    }
	  }

	  Factory.prototype.hasPath = function(path) {
	    var ref;
	    return this.paths.hasOwnProperty(path) || ((ref = this.parent_factory) != null ? ref.hasPath(path) : void 0);
	  };

	  Factory.prototype.addPathMapping = function(path, create_info) {
	    return this.paths[path] = create_info;
	  };

	  Factory.prototype.addPathMappings = function(factories, owner_path) {
	    var create_info, path;
	    for (path in factories) {
	      create_info = factories[path];
	      this.paths[kb.utils.pathJoin(owner_path, path)] = create_info;
	    }
	  };

	  Factory.prototype.hasPathMappings = function(factories, owner_path) {
	    var all_exist, creator, existing_creator, path;
	    all_exist = true;
	    for (path in factories) {
	      creator = factories[path];
	      all_exist &= (existing_creator = this.creatorForPath(null, kb.utils.pathJoin(owner_path, path))) && (creator === existing_creator);
	    }
	    return all_exist;
	  };

	  Factory.prototype.creatorForPath = function(obj, path) {
	    var creator, ref;
	    if (creator = this.paths[path]) {
	      return (creator.view_model ? creator.view_model : creator);
	    }
	    if (creator = (ref = this.parent_factory) != null ? ref.creatorForPath(obj, path) : void 0) {
	      return creator;
	    }
	    return null;
	  };

	  return Factory;

	})();


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var $, _, _ko_applyBindings, kb, ko, onReady, ref, window;

	window = window != null ? window : global;

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko, $ = ref.$;

	kb.RECUSIVE_AUTO_INJECT = true;

	ko.bindingHandlers['inject'] = {
	  'init': function(element, value_accessor, all_bindings_accessor, view_model) {
	    return kb.Inject.inject(ko.utils.unwrapObservable(value_accessor()), view_model, element, value_accessor, all_bindings_accessor);
	  }
	};

	kb.Inject = (function() {
	  function Inject() {}

	  Inject.inject = function(data, view_model, element, value_accessor, all_bindings_accessor, nested) {
	    var inject;
	    inject = function(data) {
	      var key, target, value;
	      if (_.isFunction(data)) {
	        view_model = new data(view_model, element, value_accessor, all_bindings_accessor);
	        kb.releaseOnNodeRemove(view_model, element);
	      } else {
	        if (data.view_model) {
	          view_model = new data.view_model(view_model, element, value_accessor, all_bindings_accessor);
	          kb.releaseOnNodeRemove(view_model, element);
	        }
	        for (key in data) {
	          value = data[key];
	          if (key === 'view_model') {
	            continue;
	          }
	          if (key === 'create') {
	            value(view_model, element, value_accessor, all_bindings_accessor);
	          } else if (_.isObject(value) && !_.isFunction(value)) {
	            target = nested || (value && value.create) ? {} : view_model;
	            view_model[key] = kb.Inject.inject(value, target, element, value_accessor, all_bindings_accessor, true);
	          } else {
	            view_model[key] = value;
	          }
	        }
	      }
	      return view_model;
	    };
	    if (nested) {
	      return inject(data);
	    } else {
	      return kb.ignore(function() {
	        return inject(data);
	      });
	    }
	  };

	  Inject.injectViewModels = function(root) {
	    var afterBinding, app, beforeBinding, data, expression, findElements, i, len, options, results;
	    results = [];
	    findElements = function(el) {
	      var attr, child_el, i, len, ref1;
	      if (!el.__kb_injected) {
	        if (el.attributes && (attr = _.find(el.attributes, function(attr) {
	          return attr.name === 'kb-inject';
	        }))) {
	          el.__kb_injected = true;
	          results.push({
	            el: el,
	            view_model: {},
	            binding: attr.value
	          });
	        }
	      }
	      ref1 = el.childNodes;
	      for (i = 0, len = ref1.length; i < len; i++) {
	        child_el = ref1[i];
	        findElements(child_el);
	      }
	    };
	    if (!root && (window != null ? window.document : void 0)) {
	      root = window.document;
	    }
	    findElements(root);
	    for (i = 0, len = results.length; i < len; i++) {
	      app = results[i];
	      if (expression = app.binding) {
	        (expression.search(/[:]/) < 0) || (expression = "{" + expression + "}");
	        data = (new Function("", "return ( " + expression + " )"))();
	        data || (data = {});
	        (!data.options) || (options = data.options, delete data.options);
	        options || (options = {});
	        app.view_model = kb.Inject.inject(data, app.view_model, app.el, null, null, true);
	        afterBinding = app.view_model.afterBinding || options.afterBinding;
	        beforeBinding = app.view_model.beforeBinding || options.beforeBinding;
	      }
	      if (beforeBinding) {
	        beforeBinding.call(app.view_model, app.view_model, app.el, options);
	      }
	      kb.applyBindings(app.view_model, app.el, options);
	      if (afterBinding) {
	        afterBinding.call(app.view_model, app.view_model, app.el, options);
	      }
	    }
	    return results;
	  };

	  return Inject;

	})();

	_ko_applyBindings = ko.applyBindings;

	ko.applyBindings = function(context, element) {
	  var results;
	  results = kb.RECUSIVE_AUTO_INJECT ? kb.injectViewModels(element) : [];
	  if (!results.length) {
	    return _ko_applyBindings.apply(this, arguments);
	  }
	};

	kb.injectViewModels = kb.Inject.injectViewModels;

	if (typeof document !== "undefined" && document !== null) {
	  if ($) {
	    $(function() {
	      return kb.injectViewModels();
	    });
	  } else {
	    (onReady = function() {
	      if (document.readyState !== 'complete') {
	        return setTimeout(onReady, 0);
	      }
	      return kb.injectViewModels();
	    })();
	  }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var Backbone, LIFECYCLE_METHODS, _, kb, ko, window;

	window = window != null ? window : global;

	ko = __webpack_require__(25);

	LIFECYCLE_METHODS = ['release', 'destroy', 'dispose'];

	module.exports = kb = (function() {
	  var ref;

	  function kb() {}

	  kb.VERSION = '0.20.5';

	  kb.TYPE_UNKNOWN = 0;

	  kb.TYPE_SIMPLE = 1;

	  kb.TYPE_ARRAY = 2;

	  kb.TYPE_MODEL = 3;

	  kb.TYPE_COLLECTION = 4;

	  kb.wasReleased = function(obj) {
	    return !obj || obj.__kb_released;
	  };

	  kb.isReleaseable = function(obj, depth) {
	    var i, key, len, method, value;
	    if (depth == null) {
	      depth = 0;
	    }
	    if ((!obj || (obj !== Object(obj))) || obj.__kb_released) {
	      return false;
	    }
	    if (ko.isObservable(obj) || (obj instanceof kb.ViewModel)) {
	      return true;
	    }
	    if ((typeof obj === 'function') || kb.isModel(obj) || kb.isCollection(obj)) {
	      return false;
	    }
	    for (i = 0, len = LIFECYCLE_METHODS.length; i < len; i++) {
	      method = LIFECYCLE_METHODS[i];
	      if (typeof obj[method] === 'function') {
	        return true;
	      }
	    }
	    if (depth > 0) {
	      return false;
	    }
	    for (key in obj) {
	      value = obj[key];
	      if ((key !== '__kb') && kb.isReleaseable(value, depth + 1)) {
	        return true;
	      }
	    }
	    return false;
	  };

	  kb.release = function(obj) {
	    var array, i, index, len, method, value;
	    if (!kb.isReleaseable(obj)) {
	      return;
	    }
	    obj.__kb_released = true;
	    if (_.isArray(obj)) {
	      for (index in obj) {
	        value = obj[index];
	        if (kb.isReleaseable(value)) {
	          obj[index] = null;
	          kb.release(value);
	        }
	      }
	      return;
	    }
	    if (ko.isObservable(obj) && _.isArray(array = kb.peek(obj))) {
	      if (obj.__kb_is_co || (obj.__kb_is_o && (obj.valueType() === kb.TYPE_COLLECTION))) {
	        return typeof obj.destroy === "function" ? obj.destroy() : void 0;
	      }
	      for (index in array) {
	        value = array[index];
	        if (kb.isReleaseable(value)) {
	          array[index] = null;
	          kb.release(value);
	        }
	      }
	      if (typeof obj.dispose === 'function') {
	        obj.dispose();
	      }
	      return;
	    }
	    for (i = 0, len = LIFECYCLE_METHODS.length; i < len; i++) {
	      method = LIFECYCLE_METHODS[i];
	      if (typeof obj[method] === 'function') {
	        return obj[method].call(obj);
	      }
	    }
	    if (!ko.isObservable(obj)) {
	      return this.releaseKeys(obj);
	    }
	  };

	  kb.releaseKeys = function(obj) {
	    var key, value;
	    for (key in obj) {
	      value = obj[key];
	      if (key !== '__kb' && kb.isReleaseable(value)) {
	        obj[key] = null;
	        kb.release(value);
	      }
	    }
	  };

	  kb.releaseOnNodeRemove = function(view_model, node) {
	    view_model || kb._throwUnexpected(this, 'missing view model');
	    node || kb._throwUnexpected(this, 'missing node');
	    return ko.utils.domNodeDisposal.addDisposeCallback(node, function() {
	      return kb.release(view_model);
	    });
	  };

	  kb.renderTemplate = function(template, view_model, options) {
	    var document, el, observable;
	    if (options == null) {
	      options = {};
	    }
	    if (!(document = window != null ? window.document : void 0)) {
	      return typeof console !== "undefined" && console !== null ? console.log('renderTemplate: document is undefined') : void 0;
	    }
	    el = document.createElement('div');
	    observable = ko.renderTemplate(template, view_model, options, el, 'replaceChildren');
	    if (el.childNodes.length === 1) {
	      el = el.childNodes[0];
	    } else if (el.childNodes.length) {
	      ko.storedBindingContextForNode(el, ko.contextFor(el.childNodes[0]));
	    }
	    kb.releaseOnNodeRemove(view_model, el);
	    observable.dispose();
	    if (view_model.afterRender && !options.afterRender) {
	      view_model.afterRender(el);
	    }
	    return el;
	  };

	  kb.applyBindings = function(view_model, node) {
	    var child, children, i, len, ref;
	    if (node.length) {
	      ref = [document.createElement('div'), node], node = ref[0], children = ref[1];
	      for (i = 0, len = children.length; i < len; i++) {
	        child = children[i];
	        node.appendChild(child);
	      }
	    }
	    ko.applyBindings(view_model, node);
	    kb.releaseOnNodeRemove(view_model, node);
	    return node;
	  };

	  kb.getValue = function(model, key, args) {
	    var ref;
	    if (!model) {
	      return;
	    }
	    if (_.isFunction(model[key]) && ((ref = kb.orm) != null ? ref.useFunction(model, key) : void 0)) {
	      return model[key]();
	    }
	    if (!args) {
	      return model.get(key);
	    }
	    return model.get.apply(model, _.map([key].concat(args), function(value) {
	      return kb.peek(value);
	    }));
	  };

	  kb.setValue = function(model, key, value) {
	    var attributes, ref;
	    if (!model) {
	      return;
	    }
	    if (_.isFunction(model[key]) && ((ref = kb.orm) != null ? ref.useFunction(model, key) : void 0)) {
	      return model[key](value);
	    }
	    (attributes = {})[key] = value;
	    return model.set(attributes);
	  };

	  kb.ignore = ((ref = ko.dependencyDetection) != null ? ref.ignore : void 0) || function(callback, callbackTarget, callbackArgs) {
	    var value;
	    value = null;
	    ko.computed(function() {
	      return value = callback.apply(callbackTarget, callbackArgs || []);
	    }).dispose();
	    return value;
	  };

	  kb.extend = __webpack_require__(19);

	  kb._throwMissing = function(instance, message) {
	    throw (_.isString(instance) ? instance : instance.constructor.name) + ": " + message + " is missing";
	  };

	  kb._throwUnexpected = function(instance, message) {
	    throw (_.isString(instance) ? instance : instance.constructor.name) + ": " + message + " is unexpected";
	  };

	  kb.publishMethods = function(observable, instance, methods) {
	    var fn, i, len;
	    for (i = 0, len = methods.length; i < len; i++) {
	      fn = methods[i];
	      observable[fn] = kb._.bind(instance[fn], instance);
	    }
	  };

	  kb.peek = function(obs) {
	    if (!ko.isObservable(obs)) {
	      return obs;
	    }
	    if (obs.peek) {
	      return obs.peek();
	    }
	    return kb.ignore(function() {
	      return obs();
	    });
	  };

	  kb.isModel = function(obj) {
	    return obj && ((obj instanceof kb.Model) || ((typeof obj.get === 'function') && (typeof obj.bind === 'function')));
	  };

	  kb.isCollection = function(obj) {
	    return obj && (obj instanceof kb.Collection);
	  };

	  return kb;

	})();

	if (window.Parse) {
	  Backbone = kb.Parse = window.Parse;
	  _ = kb._ = window.Parse._;
	} else {
	  Backbone = kb.Backbone = __webpack_require__(23);
	  _ = kb._ = __webpack_require__(24);
	}

	kb.ko = ko;

	kb.Collection = Backbone.Collection;

	kb.Model = Backbone.Object || Backbone.Model;

	kb.Events = Backbone.Events;

	kb.$ = window.jQuery || window.$;

	try {
	  kb.$ || (kb.$ = __webpack_require__(15));
	} catch (_error) {}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _extend, kb, ko, ref, ref1;

	ko = (kb = __webpack_require__(6)).ko;

	if ((ref = ko.subscribable) != null ? (ref1 = ref.fn) != null ? ref1.extend : void 0 : void 0) {
	  _extend = ko.subscribable.fn.extend;
	  ko.subscribable.fn.extend = function() {
	    var _dispose, target;
	    target = _extend.apply(this, arguments);
	    if (target !== this && kb.isReleaseable(this)) {
	      _dispose = target.dispose;
	      target.dispose = (function(_this) {
	        return function() {
	          if (_dispose != null) {
	            _dispose.apply(target, arguments);
	          }
	          return kb.release(_this);
	        };
	      })(this);
	    }
	    return target;
	  };
	}


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var KEYS_INFO, KEYS_PUBLISH, TypedValue, _, kb, ko, ref;

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko;

	TypedValue = __webpack_require__(11);

	KEYS_PUBLISH = ['value', 'valueType', 'destroy'];

	KEYS_INFO = ['args', 'read', 'write'];

	kb.Observable = (function() {
	  function Observable(model, key_or_info, options, _vm) {
	    this._vm = _vm != null ? _vm : {};
	    return kb.ignore((function(_this) {
	      return function() {
	        var create_options, event_watcher, i, key, len, observable;
	        key_or_info || kb._throwMissing(_this, 'key_or_info');
	        _this.key = key_or_info.key || key_or_info;
	        for (i = 0, len = KEYS_INFO.length; i < len; i++) {
	          key = KEYS_INFO[i];
	          if (key_or_info[key]) {
	            _this[key] = key_or_info[key];
	          }
	        }
	        create_options = kb.utils.collapseOptions(options);
	        event_watcher = create_options.event_watcher;
	        delete create_options.event_watcher;
	        _this._value = new TypedValue(create_options);
	        _this._model = ko.observable();
	        observable = kb.utils.wrappedObservable(_this, ko.computed({
	          read: function() {
	            var _model, arg, args, j, len1, ref1, ref2;
	            _model = _this._model();
	            ref1 = args = [_this.key].concat(_this.args || []);
	            for (j = 0, len1 = ref1.length; j < len1; j++) {
	              arg = ref1[j];
	              ko.utils.unwrapObservable(arg);
	            }
	            if ((ref2 = kb.utils.wrappedEventWatcher(_this)) != null) {
	              ref2.emitter(_model || null);
	            }
	            if (_this.read) {
	              _this.update(_this.read.apply(_this._vm, args));
	            } else if (!_.isUndefined(_model)) {
	              kb.ignore(function() {
	                return _this.update(kb.getValue(_model, kb.peek(_this.key), _this.args));
	              });
	            }
	            return _this._value.value();
	          },
	          write: function(new_value) {
	            return kb.ignore(function() {
	              var _model, unwrapped_new_value;
	              unwrapped_new_value = kb.utils.unwrapModels(new_value);
	              _model = kb.peek(_this._model);
	              if (_this.write) {
	                _this.write.call(_this._vm, unwrapped_new_value);
	                new_value = kb.getValue(_model, kb.peek(_this.key), _this.args);
	              } else if (_model) {
	                kb.setValue(_model, kb.peek(_this.key), unwrapped_new_value);
	              }
	              return _this.update(new_value);
	            });
	          },
	          owner: _this._vm
	        }));
	        observable.__kb_is_o = true;
	        create_options.store = kb.utils.wrappedStore(observable, create_options.store);
	        create_options.path = kb.utils.pathJoin(create_options.path, _this.key);
	        if (create_options.factories && ((typeof create_options.factories === 'function') || create_options.factories.create)) {
	          create_options.factory = kb.utils.wrappedFactory(observable, new kb.Factory(create_options.factory));
	          create_options.factory.addPathMapping(create_options.path, create_options.factories);
	        } else {
	          create_options.factory = kb.Factory.useOptionsOrCreate(create_options, observable, create_options.path);
	        }
	        delete create_options.factories;
	        kb.publishMethods(observable, _this, KEYS_PUBLISH);
	        observable.model = _this.model = ko.computed({
	          read: function() {
	            return ko.utils.unwrapObservable(_this._model);
	          },
	          write: function(new_model) {
	            return kb.ignore(function() {
	              var new_value;
	              if (_this.__kb_released || (kb.peek(_this._model) === new_model)) {
	                return;
	              }
	              new_value = kb.getValue(new_model, kb.peek(_this.key), _this.args);
	              _this._model(new_model);
	              if (!new_model) {
	                return _this.update(null);
	              } else if (!_.isUndefined(new_value)) {
	                return _this.update(new_value);
	              }
	            });
	          }
	        });
	        kb.EventWatcher.useOptionsOrCreate({
	          event_watcher: event_watcher
	        }, model || null, _this, {
	          emitter: _this.model,
	          update: (function() {
	            return kb.ignore(function() {
	              return _this.update();
	            });
	          }),
	          key: _this.key,
	          path: create_options.path
	        });
	        _this._value.rawValue() || _this._value.update();
	        if (kb.LocalizedObservable && key_or_info.localizer) {
	          observable = new key_or_info.localizer(observable);
	        }
	        if (kb.DefaultObservable && key_or_info.hasOwnProperty('default')) {
	          observable = kb.defaultObservable(observable, key_or_info["default"]);
	        }
	        return observable;
	      };
	    })(this));
	  }

	  Observable.prototype.destroy = function() {
	    var observable;
	    observable = kb.utils.wrappedObservable(this);
	    this.__kb_released = true;
	    this._value.destroy();
	    this._value = null;
	    this.model.dispose();
	    this.model = observable.model = null;
	    return kb.utils.wrappedDestroy(this);
	  };

	  Observable.prototype.value = function() {
	    return this._value.rawValue();
	  };

	  Observable.prototype.valueType = function() {
	    return this._value.valueType(kb.peek(this._model), kb.peek(this.key));
	  };

	  Observable.prototype.update = function(new_value) {
	    if (this.__kb_released) {
	      return;
	    }
	    if (!arguments.length) {
	      new_value = kb.getValue(kb.peek(this._model), kb.peek(this.key));
	    }
	    return this._value.update(new_value);
	  };

	  return Observable;

	})();

	kb.observable = function(model, key, options, view_model) {
	  return new kb.Observable(model, key, options, view_model);
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _, kb;

	_ = (kb = __webpack_require__(6))._;

	module.exports = kb.Statistics = (function() {
	  function Statistics() {
	    this.model_events_tracker = [];
	    this.registered_tracker = {};
	  }

	  Statistics.prototype.clear = function() {
	    return this.model_events_tracker = [];
	  };

	  Statistics.prototype.addModelEvent = function(event) {
	    return this.model_events_tracker.push(event);
	  };

	  Statistics.prototype.modelEventsStatsString = function() {
	    var event_groups, key, stats_string, value;
	    stats_string = '';
	    stats_string += "Total Count: " + this.model_events_tracker.length;
	    event_groups = _.groupBy(this.model_events_tracker, function(test) {
	      return "event name: '" + test.name + "', attribute name: '" + test.key + "'";
	    });
	    for (key in event_groups) {
	      value = event_groups[key];
	      stats_string += "\n " + key + ", count: " + value.length;
	    }
	    return stats_string;
	  };

	  Statistics.prototype.register = function(key, obj) {
	    return this.registeredTracker(key).push(obj);
	  };

	  Statistics.prototype.unregister = function(key, obj) {
	    var index, type_tracker;
	    type_tracker = this.registeredTracker(key);
	    if ((index = _.indexOf(type_tracker, obj)) < 0) {
	      return typeof console !== "undefined" && console !== null ? console.log("kb.Statistics: failed to unregister type: " + key) : void 0;
	    }
	    return type_tracker.splice(index, 1);
	  };

	  Statistics.prototype.registeredCount = function(type) {
	    var count, ref, type_tracker;
	    if (type) {
	      return this.registeredTracker(type).length;
	    }
	    count = 0;
	    ref = this.registered_tracker[type];
	    for (type in ref) {
	      type_tracker = ref[type];
	      count += type_tracker.length;
	    }
	    return count;
	  };

	  Statistics.prototype.registeredStatsString = function(success_message) {
	    var ref, stats_string, type, type_tracker, written;
	    stats_string = '';
	    ref = this.registered_tracker;
	    for (type in ref) {
	      type_tracker = ref[type];
	      if (!type_tracker.length) {
	        continue;
	      }
	      if (written) {
	        stats_string += '\n ';
	      }
	      stats_string += (type ? type : 'No Name') + ": " + type_tracker.length;
	      written = true;
	    }
	    if (stats_string) {
	      return stats_string;
	    } else {
	      return success_message;
	    }
	  };

	  Statistics.prototype.registeredTracker = function(key) {
	    var type_tracker;
	    if (this.registered_tracker.hasOwnProperty(key)) {
	      return this.registered_tracker[key];
	    }
	    type_tracker = [];
	    this.registered_tracker[key] = type_tracker;
	    return type_tracker;
	  };

	  Statistics.eventsStats = function(obj, key) {
	    var events, i, len, node, ref, stats, tail;
	    stats = {
	      count: 0
	    };
	    events = obj._events || obj._callbacks || {};
	    ref = (key ? [key] : _.keys(events));
	    for (i = 0, len = ref.length; i < len; i++) {
	      key = ref[i];
	      if (!(node = events[key])) {
	        continue;
	      }
	      if (_.isArray(node)) {
	        stats[key] = _.compact(node).length;
	      } else {
	        stats[key] = 0;
	        tail = node.tail;
	        while ((node = node.next) !== tail) {
	          stats[key]++;
	        }
	      }
	      stats.count += stats[key];
	    }
	    return stats;
	  };

	  return Statistics;

	})();


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _, kb, ko, ref;

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko;

	module.exports = kb.Store = (function() {
	  Store.instances = [];

	  Store.useOptionsOrCreate = function(options, obj, observable) {
	    var store;
	    if (!options.store) {
	      kb.utils.wrappedStoreIsOwned(observable, true);
	    }
	    store = kb.utils.wrappedStore(observable, options.store || new kb.Store());
	    store.retain(observable, obj, options.creator);
	    return store;
	  };

	  function Store() {
	    this.observable_records = {};
	    this.replaced_observables = [];
	    kb.Store.instances.push(this);
	  }

	  Store.prototype.destroy = function() {
	    var index;
	    this.__kb_released = true;
	    this.clear();
	    if ((index = _.indexOf(kb.Store.instances, this)) >= 0) {
	      return kb.Store.instances.splice(index, 1);
	    }
	  };

	  Store.prototype.clear = function() {
	    var cid, creator_id, i, len, observable, observable_records, records, ref1, ref2, replaced_observables;
	    ref1 = [this.observable_records, {}], observable_records = ref1[0], this.observable_records = ref1[1];
	    for (creator_id in observable_records) {
	      records = observable_records[creator_id];
	      for (cid in records) {
	        observable = records[cid];
	        this.release(observable, true);
	      }
	    }
	    ref2 = [this.replaced_observables, []], replaced_observables = ref2[0], this.replaced_observables = ref2[1];
	    for (i = 0, len = replaced_observables.length; i < len; i++) {
	      observable = replaced_observables[i];
	      if (!observable.__kb_released) {
	        this.release(observable, true);
	      }
	    }
	  };

	  Store.prototype.compact = function() {
	    var cid, creator_id, observable, records, ref1;
	    ref1 = this.observable_records;
	    for (creator_id in ref1) {
	      records = ref1[creator_id];
	      for (cid in records) {
	        observable = records[cid];
	        if (observable.__kb_released) {
	          delete records[cid];
	        }
	      }
	    }
	  };

	  Store.prototype.retain = function(observable, obj, creator) {
	    var current_observable;
	    if (!this._canRegister(observable)) {
	      return;
	    }
	    creator || (creator = observable.constructor);
	    if (current_observable = this.find(obj, creator)) {
	      if (current_observable === observable) {
	        this._getOrCreateStoreReferences(observable).ref_count++;
	        return observable;
	      }
	      this._retire(current_observable);
	    }
	    this._add(observable, obj, creator);
	    this._getOrCreateStoreReferences(observable).ref_count++;
	    return observable;
	  };

	  Store.prototype.retainOrCreate = function(obj, options) {
	    var creator, observable;
	    if (!(creator = this._creator(obj, options))) {
	      return kb.utils.createFromDefaultCreator(obj, options);
	    }
	    if (creator.models_only) {
	      return obj;
	    }
	    if (observable = this.find(obj, creator)) {
	      return observable;
	    }
	    if (!_.isFunction(creator.create || creator)) {
	      throw new Error("Invalid factory for \"" + options.path + "\"");
	    }
	    observable = kb.ignore((function(_this) {
	      return function() {
	        options = _.defaults({
	          store: _this,
	          creator: creator
	        }, options);
	        observable = creator.create ? creator.create(obj, options) : new creator(obj, options);
	        return observable || ko.observable(null);
	      };
	    })(this));
	    this.retain(observable, obj, creator);
	    return observable;
	  };

	  Store.prototype.reuse = function(observable, obj) {
	    var creator, current_obj, current_observable;
	    if ((current_obj = kb.utils.wrappedObject(observable)) === obj) {
	      return;
	    }
	    if (!this._canRegister(observable)) {
	      throw new Error('Cannot reuse a simple observable');
	    }
	    if (this._refCount(observable) !== 1) {
	      throw new Error("Trying to change a shared view model. Ref count: " + (this._refCount(observable)));
	    }
	    creator = kb.utils.wrappedCreator(observable) || observable.constructor;
	    if (!_.isUndefined(current_obj)) {
	      current_observable = this.find(current_obj, creator);
	    }
	    this.retain(observable, obj, creator);
	    if (current_observable) {
	      this.release(current_observable);
	    }
	  };

	  Store.prototype.release = function(observable, force) {
	    var store_references;
	    if (!this._canRegister(observable)) {
	      return kb.release(observable);
	    }
	    if (store_references = this._storeReferences(observable)) {
	      if (!force && --store_references.ref_count > 0) {
	        return;
	      }
	      this._clearStoreReferences(observable);
	    }
	    this._remove(observable);
	    if (observable.__kb_released) {
	      return;
	    }
	    if (force || this._refCount(observable) <= 1) {
	      return kb.release(observable);
	    }
	  };

	  Store.prototype.find = function(obj, creator) {
	    var observable, records, ref1;
	    if (!(records = this.observable_records[this._creatorId(creator)])) {
	      return null;
	    }
	    if ((ref1 = (observable = records[this._cid(obj)])) != null ? ref1.__kb_released : void 0) {
	      delete records[this._cid(obj)];
	      return null;
	    }
	    return observable;
	  };

	  Store.prototype._refCount = function(observable) {
	    var stores_references;
	    if (observable.__kb_released) {
	      if (typeof console !== "undefined" && console !== null) {
	        console.log('Observable already released');
	      }
	      return 0;
	    }
	    if (!(stores_references = kb.utils.get(observable, 'stores_references'))) {
	      return 1;
	    }
	    return _.reduce(stores_references, (function(memo, store_references) {
	      return memo + store_references.ref_count;
	    }), 0);
	  };

	  Store.prototype._canRegister = function(observable) {
	    return observable && !ko.isObservable(observable) && !observable.__kb_is_co;
	  };

	  Store.prototype._cid = function(obj) {
	    var cid;
	    return cid = obj ? obj.cid || (obj.cid = _.uniqueId('c')) : 'null';
	  };

	  Store.prototype._creatorId = function(creator) {
	    var create, i, item, len, ref1;
	    create = creator.create || creator;
	    create.__kb_cids || (create.__kb_cids = []);
	    ref1 = create.__kb_cids;
	    for (i = 0, len = ref1.length; i < len; i++) {
	      item = ref1[i];
	      if (item.create === create) {
	        return item.cid;
	      }
	    }
	    create.__kb_cids.push(item = {
	      create: create,
	      cid: _.uniqueId('kb')
	    });
	    return item.cid;
	  };

	  Store.prototype._storeReferences = function(observable) {
	    var stores_references;
	    if (!(stores_references = kb.utils.get(observable, 'stores_references'))) {
	      return;
	    }
	    return _.find(stores_references, (function(_this) {
	      return function(store_references) {
	        return store_references.store === _this;
	      };
	    })(this));
	  };

	  Store.prototype._getOrCreateStoreReferences = function(observable) {
	    var store_references, stores_references;
	    stores_references = kb.utils.orSet(observable, 'stores_references', []);
	    if (!(store_references = _.find(stores_references, (function(_this) {
	      return function(store_references) {
	        return store_references.store === _this;
	      };
	    })(this)))) {
	      stores_references.push(store_references = {
	        store: this,
	        ref_count: 0,
	        release: (function(_this) {
	          return function() {
	            return _this.release(observable);
	          };
	        })(this)
	      });
	    }
	    return store_references;
	  };

	  Store.prototype._clearStoreReferences = function(observable) {
	    var index, ref1, store_references, stores_references;
	    if (stores_references = kb.utils.get(observable, 'stores_references')) {
	      ref1 = observable.__kb.stores_references;
	      for (index in ref1) {
	        store_references = ref1[index];
	        if (store_references.store === this) {
	          observable.__kb.stores_references.splice(index, 1);
	          break;
	        }
	      }
	    }
	  };

	  Store.prototype._retire = function(observable) {
	    this._clearStoreReferences(observable);
	    this.replaced_observables.push(observable);
	    return this._remove(observable);
	  };

	  Store.prototype._add = function(observable, obj, creator) {
	    var base, name;
	    creator || (creator = observable.constructor);
	    kb.utils.wrappedObject(observable, obj);
	    kb.utils.wrappedCreator(observable, creator);
	    return ((base = this.observable_records)[name = this._creatorId(creator)] || (base[name] = {}))[this._cid(obj)] = observable;
	  };

	  Store.prototype._remove = function(observable) {
	    var creator, current_observable, obj;
	    creator = kb.utils.wrappedCreator(observable) || observable.constructor;
	    if (current_observable = this.find(obj = kb.utils.wrappedObject(observable), creator)) {
	      if (current_observable === observable) {
	        delete this.observable_records[this._creatorId(creator)][this._cid(obj)];
	      }
	    }
	    kb.utils.wrappedObject(observable, null);
	    return kb.utils.wrappedCreator(observable, null);
	  };

	  Store.prototype._creator = function(obj, options) {
	    var creator;
	    if (options.creator) {
	      return options.creator;
	    }
	    if (creator = kb.utils.inferCreator(obj, options.factory, options.path)) {
	      return creator;
	    }
	    if (kb.isModel(obj)) {
	      return kb.ViewModel;
	    }
	  };

	  return Store;

	})();


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var TypedValue, _, kb, ko, ref;

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko;

	module.exports = TypedValue = (function() {
	  function TypedValue(create_options1) {
	    this.create_options = create_options1;
	    this._vo = ko.observable(null);
	  }

	  TypedValue.prototype.destroy = function() {
	    var previous_value;
	    this.__kb_released = true;
	    if (previous_value = this.__kb_value) {
	      this.__kb_value = null;
	      if (this.create_options.store && kb.utils.wrappedCreator(previous_value)) {
	        this.create_options.store.release(previous_value);
	      } else {
	        kb.release(previous_value);
	      }
	    }
	    return this.create_options = null;
	  };

	  TypedValue.prototype.value = function() {
	    return ko.utils.unwrapObservable(this._vo());
	  };

	  TypedValue.prototype.rawValue = function() {
	    return this.__kb_value;
	  };

	  TypedValue.prototype.valueType = function(model, key) {
	    var new_value;
	    new_value = kb.getValue(model, key);
	    this.value_type || this._updateValueObservable(new_value);
	    return this.value_type;
	  };

	  TypedValue.prototype.update = function(new_value) {
	    var new_type, ref1, value;
	    if (this.__kb_released) {
	      return;
	    }
	    (new_value !== void 0) || (new_value = null);
	    new_type = kb.utils.valueType(new_value);
	    if ((ref1 = this.__kb_value) != null ? ref1.__kb_released : void 0) {
	      this.__kb_value = this.value_type = void 0;
	    }
	    value = this.__kb_value;
	    switch (this.value_type) {
	      case kb.TYPE_COLLECTION:
	        if (this.value_type === kb.TYPE_COLLECTION && new_type === kb.TYPE_ARRAY) {
	          return value(new_value);
	        }
	        if (new_type === kb.TYPE_COLLECTION || _.isNull(new_value)) {
	          if (new_value && new_value instanceof kb.CollectionObservable) {
	            this._updateValueObservable(kb.utils.wrappedObject(new_value), new_value);
	          } else {
	            if (kb.peek(value.collection) !== new_value) {
	              value.collection(new_value);
	            }
	          }
	          return;
	        }
	        break;
	      case kb.TYPE_MODEL:
	        if (new_type === kb.TYPE_MODEL || _.isNull(new_value)) {
	          if (new_value && !kb.isModel(new_value)) {
	            this._updateValueObservable(kb.utils.wrappedObject(new_value), new_value);
	          } else {
	            if (kb.utils.wrappedObject(value) !== kb.utils.resolveModel(new_value)) {
	              this._updateValueObservable(new_value);
	            }
	          }
	          return;
	        }
	    }
	    if (this.value_type === new_type && !_.isUndefined(this.value_type)) {
	      if (kb.peek(value) !== new_value) {
	        return value(new_value);
	      }
	    } else {
	      if (kb.peek(value) !== new_value) {
	        return this._updateValueObservable(new_value);
	      }
	    }
	  };

	  TypedValue.prototype._updateValueObservable = function(new_value, new_observable) {
	    var create_options, creator, previous_value, ref1, value, value_type;
	    create_options = this.create_options;
	    creator = kb.utils.inferCreator(new_value, create_options.factory, create_options.path);
	    if ((new_value === null) && !creator) {
	      if (this.value_type === kb.TYPE_MODEL) {
	        creator = kb.ViewModel;
	      } else if (this.value_type === kb.TYPE_COLLECTION) {
	        creator = kb.CollectionObservable;
	      }
	    }
	    create_options.creator = creator;
	    value_type = kb.TYPE_UNKNOWN;
	    ref1 = [this.__kb_value, void 0], previous_value = ref1[0], this.__kb_value = ref1[1];
	    if (new_observable) {
	      value = new_observable;
	      if (create_options.store) {
	        create_options.store.retain(new_observable, new_value, creator);
	      }
	    } else if (creator) {
	      if (create_options.store) {
	        value = create_options.store.retainOrCreate(new_value, create_options);
	      } else {
	        if (creator.models_only) {
	          value = new_value;
	          value_type = kb.TYPE_SIMPLE;
	        } else if (creator.create) {
	          value = creator.create(new_value, create_options);
	        } else {
	          value = new creator(new_value, create_options);
	        }
	      }
	    } else {
	      if (_.isArray(new_value)) {
	        value_type = kb.TYPE_ARRAY;
	        value = ko.observableArray(new_value);
	      } else {
	        value_type = kb.TYPE_SIMPLE;
	        value = ko.observable(new_value);
	      }
	    }
	    if ((this.value_type = value_type) === kb.TYPE_UNKNOWN) {
	      if (!ko.isObservable(value)) {
	        this.value_type = kb.TYPE_MODEL;
	        kb.utils.wrappedObject(value, kb.utils.resolveModel(new_value));
	      } else if (value.__kb_is_co) {
	        this.value_type = kb.TYPE_COLLECTION;
	        kb.utils.wrappedObject(value, new_value);
	      } else if (!this.value_type) {
	        this.value_type = kb.TYPE_SIMPLE;
	      }
	    }
	    if (previous_value) {
	      if (this.create_options.store) {
	        this.create_options.store.release(previous_value);
	      } else {
	        kb.release(previous_value);
	      }
	    }
	    this.__kb_value = value;
	    return this._vo(value);
	  };

	  TypedValue.prototype._inferType = function(value) {};

	  return TypedValue;

	})();


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _, kb, ko, ref;

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko;

	kb.utils = (function() {
	  function utils() {}

	  utils.get = function(obj, key, default_value) {
	    if (!obj.__kb || !obj.__kb.hasOwnProperty(key)) {
	      return default_value;
	    } else {
	      return obj.__kb[key];
	    }
	  };

	  utils.set = function(obj, key, value) {
	    return (obj.__kb || (obj.__kb = {}))[key] = value;
	  };

	  utils.orSet = function(obj, key, value) {
	    if (!(obj.__kb || (obj.__kb = {})).hasOwnProperty(key)) {
	      obj.__kb[key] = value;
	    }
	    return obj.__kb[key];
	  };

	  utils.has = function(obj, key) {
	    return obj.__kb && obj.__kb.hasOwnProperty(key);
	  };

	  utils.wrappedObservable = function(obj, value) {
	    if (arguments.length === 1) {
	      return kb.utils.get(obj, 'observable');
	    } else {
	      return kb.utils.set(obj, 'observable', value);
	    }
	  };

	  utils.wrappedObject = function(obj, value) {
	    if (arguments.length === 1) {
	      return kb.utils.get(obj, 'object');
	    } else {
	      return kb.utils.set(obj, 'object', value);
	    }
	  };

	  utils.wrappedCreator = function(obj, value) {
	    if (arguments.length === 1) {
	      return kb.utils.get(obj, 'creator');
	    } else {
	      return kb.utils.set(obj, 'creator', value);
	    }
	  };

	  utils.wrappedModel = function(obj, value) {
	    if (arguments.length === 1) {
	      if (_.isUndefined(value = kb.utils.get(obj, 'object'))) {
	        return obj;
	      } else {
	        return value;
	      }
	    } else {
	      return kb.utils.set(obj, 'object', value);
	    }
	  };

	  utils.wrappedStore = function(obj, value) {
	    if (arguments.length === 1) {
	      return kb.utils.get(obj, 'store');
	    } else {
	      return kb.utils.set(obj, 'store', value);
	    }
	  };

	  utils.wrappedStoreIsOwned = function(obj, value) {
	    if (arguments.length === 1) {
	      return kb.utils.get(obj, 'store_is_owned');
	    } else {
	      return kb.utils.set(obj, 'store_is_owned', value);
	    }
	  };

	  utils.wrappedFactory = function(obj, value) {
	    if (arguments.length === 1) {
	      return kb.utils.get(obj, 'factory');
	    } else {
	      return kb.utils.set(obj, 'factory', value);
	    }
	  };

	  utils.wrappedEventWatcher = function(obj, value) {
	    if (arguments.length === 1) {
	      return kb.utils.get(obj, 'event_watcher');
	    } else {
	      return kb.utils.set(obj, 'event_watcher', value);
	    }
	  };

	  utils.wrappedEventWatcherIsOwned = function(obj, value) {
	    if (arguments.length === 1) {
	      return kb.utils.get(obj, 'event_watcher_is_owned');
	    } else {
	      return kb.utils.set(obj, 'event_watcher_is_owned', value);
	    }
	  };

	  utils.wrappedDestroy = __webpack_require__(20);

	  utils.valueType = function(observable) {
	    if (!observable) {
	      return kb.TYPE_UNKNOWN;
	    }
	    if (observable.__kb_is_o) {
	      return observable.valueType();
	    }
	    if (observable.__kb_is_co || (observable instanceof kb.Collection)) {
	      return kb.TYPE_COLLECTION;
	    }
	    if ((observable instanceof kb.ViewModel) || (observable instanceof kb.Model)) {
	      return kb.TYPE_MODEL;
	    }
	    if (_.isArray(observable)) {
	      return kb.TYPE_ARRAY;
	    }
	    return kb.TYPE_SIMPLE;
	  };

	  utils.pathJoin = function(path1, path2) {
	    return (path1 ? (path1[path1.length - 1] !== '.' ? path1 + "." : path1) : '') + path2;
	  };

	  utils.optionsPathJoin = function(options, path) {
	    return _.defaults({
	      path: this.pathJoin(options.path, path)
	    }, options);
	  };

	  utils.inferCreator = function(value, factory, path) {
	    var creator;
	    if (factory && (creator = factory.creatorForPath(value, path))) {
	      return creator;
	    }
	    if (!value) {
	      return null;
	    }
	    if (value instanceof kb.Model) {
	      return kb.ViewModel;
	    }
	    if (value instanceof kb.Collection) {
	      return kb.CollectionObservable;
	    }
	    return null;
	  };

	  utils.createFromDefaultCreator = function(obj, options) {
	    if (kb.isModel(obj)) {
	      return kb.viewModel(obj, options);
	    }
	    if (kb.isCollection(obj)) {
	      return kb.collectionObservable(obj, options);
	    }
	    if (_.isArray(obj)) {
	      return ko.observableArray(obj);
	    }
	    return ko.observable(obj);
	  };

	  utils.collapseOptions = __webpack_require__(21);

	  utils.unwrapModels = __webpack_require__(22);

	  utils.resolveModel = function(model) {
	    if (model && kb.Backbone && kb.Backbone.ModelRef && model instanceof kb.Backbone.ModelRef) {
	      return model.model();
	    } else {
	      return model;
	    }
	  };

	  return utils;

	})();


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var KEYS_OPTIONS, _, assignViewModelKey, createObservable, createStaticObservables, kb, ko, ref;

	ref = kb = __webpack_require__(6), _ = ref._, ko = ref.ko;

	assignViewModelKey = function(vm, key) {
	  var vm_key;
	  vm_key = vm.__kb.internals && _.contains(vm.__kb.internals, key) ? "_" + key : key;
	  if (vm.__kb.view_model.hasOwnProperty(vm_key)) {
	    return;
	  }
	  vm.__kb.view_model[vm_key] = null;
	  return vm_key;
	};

	createObservable = function(vm, model, key, create_options) {
	  var vm_key;
	  if (vm.__kb.excludes && _.contains(vm.__kb.excludes, key)) {
	    return;
	  }
	  if (vm.__kb.statics && _.contains(vm.__kb.statics, key)) {
	    return;
	  }
	  if (!(vm_key = assignViewModelKey(vm, key))) {
	    return;
	  }
	  return vm[vm_key] = vm.__kb.view_model[vm_key] = kb.observable(model, key, create_options, vm);
	};

	createStaticObservables = function(vm, model) {
	  var i, key, len, ref1, vm_key;
	  ref1 = vm.__kb.statics;
	  for (i = 0, len = ref1.length; i < len; i++) {
	    key = ref1[i];
	    if (vm_key = assignViewModelKey(vm, key)) {
	      if (model.has(vm_key)) {
	        vm[vm_key] = vm.__kb.view_model[vm_key] = model.get(vm_key);
	      } else if (vm.__kb.static_defaults && vm_key in vm.__kb.static_defaults) {
	        vm[vm_key] = vm.__kb.view_model[vm_key] = vm.__kb.static_defaults[vm_key];
	      } else {
	        delete vm.__kb.view_model[vm_key];
	      }
	    }
	  }
	};

	KEYS_OPTIONS = ['keys', 'internals', 'excludes', 'statics', 'static_defaults'];

	kb.ViewModel = (function() {
	  ViewModel.extend = kb.extend;

	  function ViewModel(model, options, view_model) {
	    var args;
	    if (options == null) {
	      options = {};
	    }
	    args = Array.prototype.slice.call(_.isArguments(model) ? model : arguments);
	    return kb.ignore((function(_this) {
	      return function() {
	        var _model, arg, event_watcher, i, j, key, len, len1;
	        !(model = args.shift()) || kb.isModel(model) || kb._throwUnexpected(_this, 'not a model');
	        if (_.isArray(args[0])) {
	          args[0] = {
	            keys: args[0]
	          };
	        }
	        _this.__kb || (_this.__kb = {});
	        _this.__kb.view_model = (args.length > 1 ? args.pop() : _this);
	        options = {};
	        for (i = 0, len = args.length; i < len; i++) {
	          arg = args[i];
	          _.extend(options, arg);
	        }
	        options = kb.utils.collapseOptions(options);
	        for (j = 0, len1 = KEYS_OPTIONS.length; j < len1; j++) {
	          key = KEYS_OPTIONS[j];
	          if (options.hasOwnProperty(key)) {
	            _this.__kb[key] = options[key];
	          }
	        }
	        kb.Store.useOptionsOrCreate(options, model, _this);
	        _this.__kb.path = options.path;
	        kb.Factory.useOptionsOrCreate(options, _this, options.path);
	        _model = kb.utils.set(_this, '_model', ko.observable());
	        _this.model = ko.computed({
	          read: function() {
	            return ko.utils.unwrapObservable(_model);
	          },
	          write: function(new_model) {
	            return kb.ignore(function() {
	              if ((kb.utils.wrappedObject(_this) === new_model) || kb.wasReleased(_this) || !event_watcher) {
	                return;
	              }
	              _this.__kb.store.reuse(_this, kb.utils.resolveModel(new_model));
	              event_watcher.emitter(new_model);
	              _model(event_watcher.ee);
	              return !event_watcher.ee || _this.createObservables(event_watcher.ee);
	            });
	          }
	        });
	        event_watcher = kb.utils.wrappedEventWatcher(_this, new kb.EventWatcher(model, _this, {
	          emitter: _this._model,
	          update: (function() {
	            return kb.ignore(function() {
	              return !(event_watcher != null ? event_watcher.ee : void 0) || _this.createObservables(event_watcher != null ? event_watcher.ee : void 0);
	            });
	          })
	        }));
	        kb.utils.wrappedObject(_this, model = event_watcher.ee);
	        _model(event_watcher.ee);
	        _this.__kb.create_options = {
	          store: kb.utils.wrappedStore(_this),
	          factory: kb.utils.wrappedFactory(_this),
	          path: _this.__kb.path,
	          event_watcher: kb.utils.wrappedEventWatcher(_this)
	        };
	        !options.requires || _this.createObservables(model, options.requires);
	        !_this.__kb.internals || _this.createObservables(model, _this.__kb.internals);
	        !options.mappings || _this.createObservables(model, options.mappings);
	        !_this.__kb.statics || createStaticObservables(_this, model);
	        _this.createObservables(model, _this.__kb.keys);
	        !kb.statistics || kb.statistics.register('ViewModel', _this);
	        return _this;
	      };
	    })(this));
	  }

	  ViewModel.prototype.destroy = function() {
	    var vm_key;
	    this.__kb_released = true;
	    if (this.__kb.view_model !== this) {
	      for (vm_key in this.__kb.vm_keys) {
	        this.__kb.view_model[vm_key] = null;
	      }
	    }
	    this.__kb.view_model = this.__kb.create_options = null;
	    kb.releaseKeys(this);
	    kb.utils.wrappedDestroy(this);
	    return !kb.statistics || kb.statistics.unregister('ViewModel', this);
	  };

	  ViewModel.prototype.shareOptions = function() {
	    return {
	      store: kb.utils.wrappedStore(this),
	      factory: kb.utils.wrappedFactory(this)
	    };
	  };

	  ViewModel.prototype.createObservables = function(model, keys) {
	    var i, j, key, len, len1, mapping_info, ref1, rel_keys, vm_key;
	    if (!keys) {
	      if (this.__kb.keys || !model) {
	        return;
	      }
	      for (key in model.attributes) {
	        createObservable(this, model, key, this.__kb.create_options);
	      }
	      if (rel_keys = (ref1 = kb.orm) != null ? typeof ref1.keys === "function" ? ref1.keys(model) : void 0 : void 0) {
	        for (i = 0, len = rel_keys.length; i < len; i++) {
	          key = rel_keys[i];
	          createObservable(this, model, key, this.__kb.create_options);
	        }
	      }
	    } else if (_.isArray(keys)) {
	      for (j = 0, len1 = keys.length; j < len1; j++) {
	        key = keys[j];
	        createObservable(this, model, key, this.__kb.create_options);
	      }
	    } else {
	      for (key in keys) {
	        mapping_info = keys[key];
	        if (!(vm_key = assignViewModelKey(this, key))) {
	          continue;
	        }
	        if (!_.isString(mapping_info)) {
	          mapping_info.key || (mapping_info.key = vm_key);
	        }
	        this[vm_key] = this.__kb.view_model[vm_key] = kb.observable(model, mapping_info, this.__kb.create_options, this);
	      }
	    }
	  };

	  return ViewModel;

	})();

	kb.viewModel = function(model, options, view_model) {
	  return new kb.ViewModel(arguments);
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var i, kb, key, len, ref;

	module.exports = kb = __webpack_require__(6);

	kb.configure = __webpack_require__(2);

	kb.modules = {
	  underscore: kb._,
	  backbone: kb.Parse || kb.Backbone,
	  knockout: kb.ko
	};

	if (typeof window !== "undefined" && window !== null) {
	  ref = ['_', 'Backbone', 'Parse', 'ko', '$'];
	  for (i = 0, len = ref.length; i < len; i++) {
	    key = ref[i];
	    if (kb[key] && !Object.prototype.hasOwnProperty.call(window, key)) {
	      window[key] = kb[key];
	    }
	  }
	}


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_15__;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var AssociatedModel, Backbone, BackboneAssociations, _, kb, ref;

	ref = kb = __webpack_require__(6), _ = ref._, Backbone = ref.Backbone;

	AssociatedModel = null;

	module.exports = BackboneAssociations = (function() {
	  function BackboneAssociations() {}

	  BackboneAssociations.isAvailable = function() {
	    return !!(AssociatedModel = Backbone != null ? Backbone.AssociatedModel : void 0);
	  };

	  BackboneAssociations.keys = function(model) {
	    if (!(model instanceof AssociatedModel)) {
	      return null;
	    }
	    return _.map(model.relations, function(test) {
	      return test.key;
	    });
	  };

	  BackboneAssociations.relationType = function(model, key) {
	    var relation;
	    if (!(model instanceof AssociatedModel)) {
	      return null;
	    }
	    if (!(relation = _.find(model.relations, function(test) {
	      return test.key === key;
	    }))) {
	      return null;
	    }
	    if (relation.type === 'Many') {
	      return kb.TYPE_COLLECTION;
	    } else {
	      return kb.TYPE_MODEL;
	    }
	  };

	  BackboneAssociations.useFunction = function() {
	    return false;
	  };

	  return BackboneAssociations;

	})();


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var Backbone, BackboneRelational, RelationalModel, _, kb, ref;

	ref = kb = __webpack_require__(6), _ = ref._, Backbone = ref.Backbone;

	RelationalModel = null;

	module.exports = BackboneRelational = (function() {
	  function BackboneRelational() {}

	  BackboneRelational.isAvailable = function() {
	    return !!(RelationalModel = Backbone != null ? Backbone.RelationalModel : void 0);
	  };

	  BackboneRelational.relationType = function(model, key) {
	    var relation;
	    if (!(model instanceof RelationalModel)) {
	      return null;
	    }
	    if (!(relation = _.find(model.getRelations(), function(test) {
	      return test.key === key;
	    }))) {
	      return null;
	    }
	    if (relation.collectionType || _.isArray(relation.keyContents)) {
	      return kb.TYPE_COLLECTION;
	    } else {
	      return kb.TYPE_MODEL;
	    }
	  };

	  BackboneRelational.bind = function(model, key, update, path) {
	    var event, events, i, len, rel_fn, type;
	    if (!(type = this.relationType(model, key))) {
	      return null;
	    }
	    rel_fn = function(model) {
	      !kb.statistics || kb.statistics.addModelEvent({
	        name: 'update (relational)',
	        model: model,
	        key: key,
	        path: path
	      });
	      return update();
	    };
	    events = kb.Backbone.Relation.prototype.sanitizeOptions ? ['update', 'add', 'remove'] : ['change', 'add', 'remove'];
	    if (type === kb.TYPE_COLLECTION) {
	      for (i = 0, len = events.length; i < len; i++) {
	        event = events[i];
	        model.bind(event + ":" + key, rel_fn);
	      }
	    } else {
	      model.bind(events[0] + ":" + key, rel_fn);
	    }
	    return function() {
	      var j, len1;
	      if (type === kb.TYPE_COLLECTION) {
	        for (j = 0, len1 = events.length; j < len1; j++) {
	          event = events[j];
	          model.unbind(event + ":" + key, rel_fn);
	        }
	      } else {
	        model.unbind(events[0] + ":" + key, rel_fn);
	      }
	    };
	  };

	  BackboneRelational.useFunction = function() {
	    return false;
	  };

	  return BackboneRelational;

	})();


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var Supermodel, _, kb, root;

	root = typeof window !== "undefined" && window !== null ? window : global;

	_ = (kb = __webpack_require__(6))._;

	Supermodel = null;

	module.exports = Supermodel = (function() {
	  function Supermodel() {}

	  Supermodel.isAvailable = function() {
	    return !!(Supermodel = root.Supermodel);
	  };

	  Supermodel.keys = function(model) {
	    if (!(model instanceof Supermodel.Model)) {
	      return null;
	    }
	    return _.keys(model.constructor.associations());
	  };

	  Supermodel.relationType = function(model, key) {
	    var relation;
	    if (!(model instanceof Supermodel.Model)) {
	      return null;
	    }
	    if (!(relation = model.constructor.associations()[key])) {
	      return null;
	    }
	    if (relation.add) {
	      return kb.TYPE_COLLECTION;
	    } else {
	      return kb.TYPE_MODEL;
	    }
	  };

	  Supermodel.bind = function(model, key, update, path) {
	    var rel_fn, type;
	    if (!(type = this.relationType(model, key))) {
	      return null;
	    }
	    rel_fn = function(model, other) {
	      var previous, relation;
	      !kb.statistics || kb.statistics.addModelEvent({
	        name: 'update (supermodel)',
	        model: model,
	        key: key,
	        path: path
	      });
	      relation = model.constructor.associations()[key];
	      previous = model[relation.store];
	      model[relation.store] = other;
	      update(other);
	      return model[relation.store] = previous;
	    };
	    if (type === kb.TYPE_MODEL) {
	      model.bind("associate:" + key, rel_fn);
	      return function() {
	        return model.unbind("associate:" + key, rel_fn);
	      };
	    }
	  };

	  Supermodel.useFunction = function(model, key) {
	    return !!this.relationType(model, key);
	  };

	  return Supermodel;

	})();

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var copyProps;

	copyProps = function(dest, source) {
	  var key, value;
	  for (key in source) {
	    value = source[key];
	    dest[key] = value;
	  }
	  return dest;
	};

	// Shared empty constructor function to aid in prototype-chain creation.
	var ctor = function(){};

	// Helper function to correctly set up the prototype chain, for subclasses.
	// Similar to 'goog.inherits', but uses a hash of prototype properties and
	// class properties to be extended.
	var inherits = function(parent, protoProps, staticProps) {
	  var child;

	  // The constructor function for the new subclass is either defined by you
	  // (the "constructor" property in your extend definition), or defaulted
	  // by us to simply call the parent's constructor.
	  if (protoProps && protoProps.hasOwnProperty('constructor')) {
	    child = protoProps.constructor;
	  } else {
	    child = function(){ parent.apply(this, arguments); };
	  }

	  // Inherit class (static) properties from parent.
	  copyProps(child, parent);

	  // Set the prototype chain to inherit from parent, without calling
	  // parent's constructor function.
	  ctor.prototype = parent.prototype;
	  child.prototype = new ctor();

	  // Add prototype properties (instance properties) to the subclass,
	  // if supplied.
	  if (protoProps) copyProps(child.prototype, protoProps);

	  // Add static properties to the constructor function, if supplied.
	  if (staticProps) copyProps(child, staticProps);

	  // Correctly set child's 'prototype.constructor'.
	  child.prototype.constructor = child;

	  // Set a convenience property in case the parent's prototype is needed later.
	  child.__super__ = parent.prototype;

	  return child;
	};

	// The self-propagating extend function that BacLCone classes use.
	var extend = function (protoProps, classProps) {
	  var child = inherits(this, protoProps, classProps);
	  child.extend = this.extend;
	  return child;
	};
	;

	module.exports = extend;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _, wrappedDestroy;

	_ = __webpack_require__(6)._;

	module.exports = wrappedDestroy = function(obj) {
	  var __kb, store_references;
	  if (!obj.__kb) {
	    return;
	  }
	  if (obj.__kb.event_watcher) {
	    obj.__kb.event_watcher.releaseCallbacks(obj);
	  }
	  __kb = obj.__kb;
	  obj.__kb = null;
	  if (__kb.observable) {
	    __kb.observable.destroy = __kb.observable.release = null;
	    wrappedDestroy(__kb.observable);
	    __kb.observable = null;
	  }
	  __kb.factory = null;
	  if (__kb.event_watcher_is_owned) {
	    __kb.event_watcher.destroy();
	  }
	  __kb.event_watcher = null;
	  if (__kb.store_is_owned) {
	    __kb.store.destroy();
	  }
	  __kb.store = null;
	  if (__kb.stores_references) {
	    while (store_references = __kb.stores_references.pop()) {
	      if (!store_references.store.__kb_released) {
	        store_references.store.release(obj);
	      }
	    }
	  }
	};


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _, _keyArrayToObject, _mergeArray, _mergeObject, _mergeOptions;

	_ = __webpack_require__(6)._;

	_mergeArray = function(result, key, value) {
	  result[key] || (result[key] = []);
	  if (!_.isArray(value)) {
	    value = [value];
	  }
	  result[key] = result[key].length ? _.union(result[key], value) : value;
	  return result;
	};

	_mergeObject = function(result, key, value) {
	  result[key] || (result[key] = {});
	  return _.extend(result[key], value);
	};

	_keyArrayToObject = function(value) {
	  var i, item, len, result;
	  result = {};
	  for (i = 0, len = value.length; i < len; i++) {
	    item = value[i];
	    result[item] = {
	      key: item
	    };
	  }
	  return result;
	};

	_mergeOptions = function(result, options) {
	  var key, value;
	  if (!options) {
	    return result;
	  }
	  for (key in options) {
	    value = options[key];
	    switch (key) {
	      case 'internals':
	      case 'requires':
	      case 'excludes':
	      case 'statics':
	        _mergeArray(result, key, value);
	        break;
	      case 'keys':
	        if ((_.isObject(value) && !_.isArray(value)) || (_.isObject(result[key]) && !_.isArray(result[key]))) {
	          if (!_.isObject(value)) {
	            value = [value];
	          }
	          if (_.isArray(value)) {
	            value = _keyArrayToObject(value);
	          }
	          if (_.isArray(result[key])) {
	            result[key] = _keyArrayToObject(result[key]);
	          }
	          _mergeObject(result, key, value);
	        } else {
	          _mergeArray(result, key, value);
	        }
	        break;
	      case 'factories':
	        if (_.isFunction(value)) {
	          result[key] = value;
	        } else {
	          _mergeObject(result, key, value);
	        }
	        break;
	      case 'static_defaults':
	        _mergeObject(result, key, value);
	        break;
	      case 'options':
	        break;
	      default:
	        result[key] = value;
	    }
	  }
	  return _mergeOptions(result, options.options);
	};

	module.exports = function(options) {
	  return _mergeOptions({}, options);
	};


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	
	/*
	  knockback.js 0.20.5
	  Copyright (c)  2011-2014 Kevin Malakoff.
	  License: MIT (http://www.opensource.org/licenses/mit-license.php)
	  Source: https://github.com/kmalakoff/knockback
	  Dependencies: Knockout.js, Backbone.js, and Underscore.js (or LoDash.js).
	  Optional dependencies: Backbone.ModelRef.js and BackboneORM.
	 */
	var _, unwrapModels;

	_ = __webpack_require__(6)._;

	module.exports = unwrapModels = function(obj) {
	  var key, result, value;
	  if (!obj) {
	    return obj;
	  }
	  if (obj.__kb) {
	    return (obj.__kb.hasOwnProperty('object') ? obj.__kb.object : obj);
	  }
	  if (_.isArray(obj)) {
	    return _.map(obj, function(test) {
	      return unwrapModels(test);
	    });
	  }
	  if (_.isObject(obj) && (obj.constructor === {}.constructor)) {
	    result = {};
	    for (key in obj) {
	      value = obj[key];
	      result[key] = unwrapModels(value);
	    }
	    return result;
	  }
	  return obj;
	};


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Backbone.js 1.1.2

	//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Backbone may be freely distributed under the MIT license.
	//     For all details and documentation:
	//     http://backbonejs.org

	(function(root, factory) {

	  // Set up Backbone appropriately for the environment. Start with AMD.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(24), __webpack_require__(15), exports], __WEBPACK_AMD_DEFINE_RESULT__ = function(_, $, exports) {
	      // Export global even in AMD case in case this script is loaded with
	      // others that may still expect a global Backbone.
	      root.Backbone = factory(root, exports, _, $);
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

	  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
	  } else if (typeof exports !== 'undefined') {
	    var _ = require('underscore');
	    factory(root, exports, _);

	  // Finally, as a browser global.
	  } else {
	    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
	  }

	}(this, function(root, Backbone, _, $) {

	  // Initial Setup
	  // -------------

	  // Save the previous value of the `Backbone` variable, so that it can be
	  // restored later on, if `noConflict` is used.
	  var previousBackbone = root.Backbone;

	  // Create local references to array methods we'll want to use later.
	  var array = [];
	  var push = array.push;
	  var slice = array.slice;
	  var splice = array.splice;

	  // Current version of the library. Keep in sync with `package.json`.
	  Backbone.VERSION = '1.1.2';

	  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
	  // the `$` variable.
	  Backbone.$ = $;

	  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
	  // to its previous owner. Returns a reference to this Backbone object.
	  Backbone.noConflict = function() {
	    root.Backbone = previousBackbone;
	    return this;
	  };

	  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
	  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
	  // set a `X-Http-Method-Override` header.
	  Backbone.emulateHTTP = false;

	  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
	  // `application/json` requests ... will encode the body as
	  // `application/x-www-form-urlencoded` instead and will send the model in a
	  // form param named `model`.
	  Backbone.emulateJSON = false;

	  // Backbone.Events
	  // ---------------

	  // A module that can be mixed in to *any object* in order to provide it with
	  // custom events. You may bind with `on` or remove with `off` callback
	  // functions to an event; `trigger`-ing an event fires all callbacks in
	  // succession.
	  //
	  //     var object = {};
	  //     _.extend(object, Backbone.Events);
	  //     object.on('expand', function(){ alert('expanded'); });
	  //     object.trigger('expand');
	  //
	  var Events = Backbone.Events = {

	    // Bind an event to a `callback` function. Passing `"all"` will bind
	    // the callback to all events fired.
	    on: function(name, callback, context) {
	      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
	      this._events || (this._events = {});
	      var events = this._events[name] || (this._events[name] = []);
	      events.push({callback: callback, context: context, ctx: context || this});
	      return this;
	    },

	    // Bind an event to only be triggered a single time. After the first time
	    // the callback is invoked, it will be removed.
	    once: function(name, callback, context) {
	      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
	      var self = this;
	      var once = _.once(function() {
	        self.off(name, once);
	        callback.apply(this, arguments);
	      });
	      once._callback = callback;
	      return this.on(name, once, context);
	    },

	    // Remove one or many callbacks. If `context` is null, removes all
	    // callbacks with that function. If `callback` is null, removes all
	    // callbacks for the event. If `name` is null, removes all bound
	    // callbacks for all events.
	    off: function(name, callback, context) {
	      var retain, ev, events, names, i, l, j, k;
	      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
	      if (!name && !callback && !context) {
	        this._events = void 0;
	        return this;
	      }
	      names = name ? [name] : _.keys(this._events);
	      for (i = 0, l = names.length; i < l; i++) {
	        name = names[i];
	        if (events = this._events[name]) {
	          this._events[name] = retain = [];
	          if (callback || context) {
	            for (j = 0, k = events.length; j < k; j++) {
	              ev = events[j];
	              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
	                  (context && context !== ev.context)) {
	                retain.push(ev);
	              }
	            }
	          }
	          if (!retain.length) delete this._events[name];
	        }
	      }

	      return this;
	    },

	    // Trigger one or many events, firing all bound callbacks. Callbacks are
	    // passed the same arguments as `trigger` is, apart from the event name
	    // (unless you're listening on `"all"`, which will cause your callback to
	    // receive the true name of the event as the first argument).
	    trigger: function(name) {
	      if (!this._events) return this;
	      var args = slice.call(arguments, 1);
	      if (!eventsApi(this, 'trigger', name, args)) return this;
	      var events = this._events[name];
	      var allEvents = this._events.all;
	      if (events) triggerEvents(events, args);
	      if (allEvents) triggerEvents(allEvents, arguments);
	      return this;
	    },

	    // Tell this object to stop listening to either specific events ... or
	    // to every object it's currently listening to.
	    stopListening: function(obj, name, callback) {
	      var listeningTo = this._listeningTo;
	      if (!listeningTo) return this;
	      var remove = !name && !callback;
	      if (!callback && typeof name === 'object') callback = this;
	      if (obj) (listeningTo = {})[obj._listenId] = obj;
	      for (var id in listeningTo) {
	        obj = listeningTo[id];
	        obj.off(name, callback, this);
	        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
	      }
	      return this;
	    }

	  };

	  // Regular expression used to split event strings.
	  var eventSplitter = /\s+/;

	  // Implement fancy features of the Events API such as multiple event
	  // names `"change blur"` and jQuery-style event maps `{change: action}`
	  // in terms of the existing API.
	  var eventsApi = function(obj, action, name, rest) {
	    if (!name) return true;

	    // Handle event maps.
	    if (typeof name === 'object') {
	      for (var key in name) {
	        obj[action].apply(obj, [key, name[key]].concat(rest));
	      }
	      return false;
	    }

	    // Handle space separated event names.
	    if (eventSplitter.test(name)) {
	      var names = name.split(eventSplitter);
	      for (var i = 0, l = names.length; i < l; i++) {
	        obj[action].apply(obj, [names[i]].concat(rest));
	      }
	      return false;
	    }

	    return true;
	  };

	  // A difficult-to-believe, but optimized internal dispatch function for
	  // triggering events. Tries to keep the usual cases speedy (most internal
	  // Backbone events have 3 arguments).
	  var triggerEvents = function(events, args) {
	    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
	    switch (args.length) {
	      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
	      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
	      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
	      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
	      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
	    }
	  };

	  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

	  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
	  // listen to an event in another object ... keeping track of what it's
	  // listening to.
	  _.each(listenMethods, function(implementation, method) {
	    Events[method] = function(obj, name, callback) {
	      var listeningTo = this._listeningTo || (this._listeningTo = {});
	      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
	      listeningTo[id] = obj;
	      if (!callback && typeof name === 'object') callback = this;
	      obj[implementation](name, callback, this);
	      return this;
	    };
	  });

	  // Aliases for backwards compatibility.
	  Events.bind   = Events.on;
	  Events.unbind = Events.off;

	  // Allow the `Backbone` object to serve as a global event bus, for folks who
	  // want global "pubsub" in a convenient place.
	  _.extend(Backbone, Events);

	  // Backbone.Model
	  // --------------

	  // Backbone **Models** are the basic data object in the framework --
	  // frequently representing a row in a table in a database on your server.
	  // A discrete chunk of data and a bunch of useful, related methods for
	  // performing computations and transformations on that data.

	  // Create a new model with the specified attributes. A client id (`cid`)
	  // is automatically generated and assigned for you.
	  var Model = Backbone.Model = function(attributes, options) {
	    var attrs = attributes || {};
	    options || (options = {});
	    this.cid = _.uniqueId('c');
	    this.attributes = {};
	    if (options.collection) this.collection = options.collection;
	    if (options.parse) attrs = this.parse(attrs, options) || {};
	    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
	    this.set(attrs, options);
	    this.changed = {};
	    this.initialize.apply(this, arguments);
	  };

	  // Attach all inheritable methods to the Model prototype.
	  _.extend(Model.prototype, Events, {

	    // A hash of attributes whose current and previous value differ.
	    changed: null,

	    // The value returned during the last failed validation.
	    validationError: null,

	    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
	    // CouchDB users may want to set this to `"_id"`.
	    idAttribute: 'id',

	    // Initialize is an empty function by default. Override it with your own
	    // initialization logic.
	    initialize: function(){},

	    // Return a copy of the model's `attributes` object.
	    toJSON: function(options) {
	      return _.clone(this.attributes);
	    },

	    // Proxy `Backbone.sync` by default -- but override this if you need
	    // custom syncing semantics for *this* particular model.
	    sync: function() {
	      return Backbone.sync.apply(this, arguments);
	    },

	    // Get the value of an attribute.
	    get: function(attr) {
	      return this.attributes[attr];
	    },

	    // Get the HTML-escaped value of an attribute.
	    escape: function(attr) {
	      return _.escape(this.get(attr));
	    },

	    // Returns `true` if the attribute contains a value that is not null
	    // or undefined.
	    has: function(attr) {
	      return this.get(attr) != null;
	    },

	    // Set a hash of model attributes on the object, firing `"change"`. This is
	    // the core primitive operation of a model, updating the data and notifying
	    // anyone who needs to know about the change in state. The heart of the beast.
	    set: function(key, val, options) {
	      var attr, attrs, unset, changes, silent, changing, prev, current;
	      if (key == null) return this;

	      // Handle both `"key", value` and `{key: value}` -style arguments.
	      if (typeof key === 'object') {
	        attrs = key;
	        options = val;
	      } else {
	        (attrs = {})[key] = val;
	      }

	      options || (options = {});

	      // Run validation.
	      if (!this._validate(attrs, options)) return false;

	      // Extract attributes and options.
	      unset           = options.unset;
	      silent          = options.silent;
	      changes         = [];
	      changing        = this._changing;
	      this._changing  = true;

	      if (!changing) {
	        this._previousAttributes = _.clone(this.attributes);
	        this.changed = {};
	      }
	      current = this.attributes, prev = this._previousAttributes;

	      // Check for changes of `id`.
	      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

	      // For each `set` attribute, update or delete the current value.
	      for (attr in attrs) {
	        val = attrs[attr];
	        if (!_.isEqual(current[attr], val)) changes.push(attr);
	        if (!_.isEqual(prev[attr], val)) {
	          this.changed[attr] = val;
	        } else {
	          delete this.changed[attr];
	        }
	        unset ? delete current[attr] : current[attr] = val;
	      }

	      // Trigger all relevant attribute changes.
	      if (!silent) {
	        if (changes.length) this._pending = options;
	        for (var i = 0, l = changes.length; i < l; i++) {
	          this.trigger('change:' + changes[i], this, current[changes[i]], options);
	        }
	      }

	      // You might be wondering why there's a `while` loop here. Changes can
	      // be recursively nested within `"change"` events.
	      if (changing) return this;
	      if (!silent) {
	        while (this._pending) {
	          options = this._pending;
	          this._pending = false;
	          this.trigger('change', this, options);
	        }
	      }
	      this._pending = false;
	      this._changing = false;
	      return this;
	    },

	    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
	    // if the attribute doesn't exist.
	    unset: function(attr, options) {
	      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
	    },

	    // Clear all attributes on the model, firing `"change"`.
	    clear: function(options) {
	      var attrs = {};
	      for (var key in this.attributes) attrs[key] = void 0;
	      return this.set(attrs, _.extend({}, options, {unset: true}));
	    },

	    // Determine if the model has changed since the last `"change"` event.
	    // If you specify an attribute name, determine if that attribute has changed.
	    hasChanged: function(attr) {
	      if (attr == null) return !_.isEmpty(this.changed);
	      return _.has(this.changed, attr);
	    },

	    // Return an object containing all the attributes that have changed, or
	    // false if there are no changed attributes. Useful for determining what
	    // parts of a view need to be updated and/or what attributes need to be
	    // persisted to the server. Unset attributes will be set to undefined.
	    // You can also pass an attributes object to diff against the model,
	    // determining if there *would be* a change.
	    changedAttributes: function(diff) {
	      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
	      var val, changed = false;
	      var old = this._changing ? this._previousAttributes : this.attributes;
	      for (var attr in diff) {
	        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
	        (changed || (changed = {}))[attr] = val;
	      }
	      return changed;
	    },

	    // Get the previous value of an attribute, recorded at the time the last
	    // `"change"` event was fired.
	    previous: function(attr) {
	      if (attr == null || !this._previousAttributes) return null;
	      return this._previousAttributes[attr];
	    },

	    // Get all of the attributes of the model at the time of the previous
	    // `"change"` event.
	    previousAttributes: function() {
	      return _.clone(this._previousAttributes);
	    },

	    // Fetch the model from the server. If the server's representation of the
	    // model differs from its current attributes, they will be overridden,
	    // triggering a `"change"` event.
	    fetch: function(options) {
	      options = options ? _.clone(options) : {};
	      if (options.parse === void 0) options.parse = true;
	      var model = this;
	      var success = options.success;
	      options.success = function(resp) {
	        if (!model.set(model.parse(resp, options), options)) return false;
	        if (success) success(model, resp, options);
	        model.trigger('sync', model, resp, options);
	      };
	      wrapError(this, options);
	      return this.sync('read', this, options);
	    },

	    // Set a hash of model attributes, and sync the model to the server.
	    // If the server returns an attributes hash that differs, the model's
	    // state will be `set` again.
	    save: function(key, val, options) {
	      var attrs, method, xhr, attributes = this.attributes;

	      // Handle both `"key", value` and `{key: value}` -style arguments.
	      if (key == null || typeof key === 'object') {
	        attrs = key;
	        options = val;
	      } else {
	        (attrs = {})[key] = val;
	      }

	      options = _.extend({validate: true}, options);

	      // If we're not waiting and attributes exist, save acts as
	      // `set(attr).save(null, opts)` with validation. Otherwise, check if
	      // the model will be valid when the attributes, if any, are set.
	      if (attrs && !options.wait) {
	        if (!this.set(attrs, options)) return false;
	      } else {
	        if (!this._validate(attrs, options)) return false;
	      }

	      // Set temporary attributes if `{wait: true}`.
	      if (attrs && options.wait) {
	        this.attributes = _.extend({}, attributes, attrs);
	      }

	      // After a successful server-side save, the client is (optionally)
	      // updated with the server-side state.
	      if (options.parse === void 0) options.parse = true;
	      var model = this;
	      var success = options.success;
	      options.success = function(resp) {
	        // Ensure attributes are restored during synchronous saves.
	        model.attributes = attributes;
	        var serverAttrs = model.parse(resp, options);
	        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
	        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
	          return false;
	        }
	        if (success) success(model, resp, options);
	        model.trigger('sync', model, resp, options);
	      };
	      wrapError(this, options);

	      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
	      if (method === 'patch') options.attrs = attrs;
	      xhr = this.sync(method, this, options);

	      // Restore attributes.
	      if (attrs && options.wait) this.attributes = attributes;

	      return xhr;
	    },

	    // Destroy this model on the server if it was already persisted.
	    // Optimistically removes the model from its collection, if it has one.
	    // If `wait: true` is passed, waits for the server to respond before removal.
	    destroy: function(options) {
	      options = options ? _.clone(options) : {};
	      var model = this;
	      var success = options.success;

	      var destroy = function() {
	        model.trigger('destroy', model, model.collection, options);
	      };

	      options.success = function(resp) {
	        if (options.wait || model.isNew()) destroy();
	        if (success) success(model, resp, options);
	        if (!model.isNew()) model.trigger('sync', model, resp, options);
	      };

	      if (this.isNew()) {
	        options.success();
	        return false;
	      }
	      wrapError(this, options);

	      var xhr = this.sync('delete', this, options);
	      if (!options.wait) destroy();
	      return xhr;
	    },

	    // Default URL for the model's representation on the server -- if you're
	    // using Backbone's restful methods, override this to change the endpoint
	    // that will be called.
	    url: function() {
	      var base =
	        _.result(this, 'urlRoot') ||
	        _.result(this.collection, 'url') ||
	        urlError();
	      if (this.isNew()) return base;
	      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
	    },

	    // **parse** converts a response into the hash of attributes to be `set` on
	    // the model. The default implementation is just to pass the response along.
	    parse: function(resp, options) {
	      return resp;
	    },

	    // Create a new model with identical attributes to this one.
	    clone: function() {
	      return new this.constructor(this.attributes);
	    },

	    // A model is new if it has never been saved to the server, and lacks an id.
	    isNew: function() {
	      return !this.has(this.idAttribute);
	    },

	    // Check if the model is currently in a valid state.
	    isValid: function(options) {
	      return this._validate({}, _.extend(options || {}, { validate: true }));
	    },

	    // Run validation against the next complete set of model attributes,
	    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
	    _validate: function(attrs, options) {
	      if (!options.validate || !this.validate) return true;
	      attrs = _.extend({}, this.attributes, attrs);
	      var error = this.validationError = this.validate(attrs, options) || null;
	      if (!error) return true;
	      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
	      return false;
	    }

	  });

	  // Underscore methods that we want to implement on the Model.
	  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

	  // Mix in each Underscore method as a proxy to `Model#attributes`.
	  _.each(modelMethods, function(method) {
	    Model.prototype[method] = function() {
	      var args = slice.call(arguments);
	      args.unshift(this.attributes);
	      return _[method].apply(_, args);
	    };
	  });

	  // Backbone.Collection
	  // -------------------

	  // If models tend to represent a single row of data, a Backbone Collection is
	  // more analagous to a table full of data ... or a small slice or page of that
	  // table, or a collection of rows that belong together for a particular reason
	  // -- all of the messages in this particular folder, all of the documents
	  // belonging to this particular author, and so on. Collections maintain
	  // indexes of their models, both in order, and for lookup by `id`.

	  // Create a new **Collection**, perhaps to contain a specific type of `model`.
	  // If a `comparator` is specified, the Collection will maintain
	  // its models in sort order, as they're added and removed.
	  var Collection = Backbone.Collection = function(models, options) {
	    options || (options = {});
	    if (options.model) this.model = options.model;
	    if (options.comparator !== void 0) this.comparator = options.comparator;
	    this._reset();
	    this.initialize.apply(this, arguments);
	    if (models) this.reset(models, _.extend({silent: true}, options));
	  };

	  // Default options for `Collection#set`.
	  var setOptions = {add: true, remove: true, merge: true};
	  var addOptions = {add: true, remove: false};

	  // Define the Collection's inheritable methods.
	  _.extend(Collection.prototype, Events, {

	    // The default model for a collection is just a **Backbone.Model**.
	    // This should be overridden in most cases.
	    model: Model,

	    // Initialize is an empty function by default. Override it with your own
	    // initialization logic.
	    initialize: function(){},

	    // The JSON representation of a Collection is an array of the
	    // models' attributes.
	    toJSON: function(options) {
	      return this.map(function(model){ return model.toJSON(options); });
	    },

	    // Proxy `Backbone.sync` by default.
	    sync: function() {
	      return Backbone.sync.apply(this, arguments);
	    },

	    // Add a model, or list of models to the set.
	    add: function(models, options) {
	      return this.set(models, _.extend({merge: false}, options, addOptions));
	    },

	    // Remove a model, or a list of models from the set.
	    remove: function(models, options) {
	      var singular = !_.isArray(models);
	      models = singular ? [models] : _.clone(models);
	      options || (options = {});
	      var i, l, index, model;
	      for (i = 0, l = models.length; i < l; i++) {
	        model = models[i] = this.get(models[i]);
	        if (!model) continue;
	        delete this._byId[model.id];
	        delete this._byId[model.cid];
	        index = this.indexOf(model);
	        this.models.splice(index, 1);
	        this.length--;
	        if (!options.silent) {
	          options.index = index;
	          model.trigger('remove', model, this, options);
	        }
	        this._removeReference(model, options);
	      }
	      return singular ? models[0] : models;
	    },

	    // Update a collection by `set`-ing a new list of models, adding new ones,
	    // removing models that are no longer present, and merging models that
	    // already exist in the collection, as necessary. Similar to **Model#set**,
	    // the core operation for updating the data contained by the collection.
	    set: function(models, options) {
	      options = _.defaults({}, options, setOptions);
	      if (options.parse) models = this.parse(models, options);
	      var singular = !_.isArray(models);
	      models = singular ? (models ? [models] : []) : _.clone(models);
	      var i, l, id, model, attrs, existing, sort;
	      var at = options.at;
	      var targetModel = this.model;
	      var sortable = this.comparator && (at == null) && options.sort !== false;
	      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
	      var toAdd = [], toRemove = [], modelMap = {};
	      var add = options.add, merge = options.merge, remove = options.remove;
	      var order = !sortable && add && remove ? [] : false;

	      // Turn bare objects into model references, and prevent invalid models
	      // from being added.
	      for (i = 0, l = models.length; i < l; i++) {
	        attrs = models[i] || {};
	        if (attrs instanceof Model) {
	          id = model = attrs;
	        } else {
	          id = attrs[targetModel.prototype.idAttribute || 'id'];
	        }

	        // If a duplicate is found, prevent it from being added and
	        // optionally merge it into the existing model.
	        if (existing = this.get(id)) {
	          if (remove) modelMap[existing.cid] = true;
	          if (merge) {
	            attrs = attrs === model ? model.attributes : attrs;
	            if (options.parse) attrs = existing.parse(attrs, options);
	            existing.set(attrs, options);
	            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
	          }
	          models[i] = existing;

	        // If this is a new, valid model, push it to the `toAdd` list.
	        } else if (add) {
	          model = models[i] = this._prepareModel(attrs, options);
	          if (!model) continue;
	          toAdd.push(model);
	          this._addReference(model, options);
	        }

	        // Do not add multiple models with the same `id`.
	        model = existing || model;
	        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
	        modelMap[model.id] = true;
	      }

	      // Remove nonexistent models if appropriate.
	      if (remove) {
	        for (i = 0, l = this.length; i < l; ++i) {
	          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
	        }
	        if (toRemove.length) this.remove(toRemove, options);
	      }

	      // See if sorting is needed, update `length` and splice in new models.
	      if (toAdd.length || (order && order.length)) {
	        if (sortable) sort = true;
	        this.length += toAdd.length;
	        if (at != null) {
	          for (i = 0, l = toAdd.length; i < l; i++) {
	            this.models.splice(at + i, 0, toAdd[i]);
	          }
	        } else {
	          if (order) this.models.length = 0;
	          var orderedModels = order || toAdd;
	          for (i = 0, l = orderedModels.length; i < l; i++) {
	            this.models.push(orderedModels[i]);
	          }
	        }
	      }

	      // Silently sort the collection if appropriate.
	      if (sort) this.sort({silent: true});

	      // Unless silenced, it's time to fire all appropriate add/sort events.
	      if (!options.silent) {
	        for (i = 0, l = toAdd.length; i < l; i++) {
	          (model = toAdd[i]).trigger('add', model, this, options);
	        }
	        if (sort || (order && order.length)) this.trigger('sort', this, options);
	      }

	      // Return the added (or merged) model (or models).
	      return singular ? models[0] : models;
	    },

	    // When you have more items than you want to add or remove individually,
	    // you can reset the entire set with a new list of models, without firing
	    // any granular `add` or `remove` events. Fires `reset` when finished.
	    // Useful for bulk operations and optimizations.
	    reset: function(models, options) {
	      options || (options = {});
	      for (var i = 0, l = this.models.length; i < l; i++) {
	        this._removeReference(this.models[i], options);
	      }
	      options.previousModels = this.models;
	      this._reset();
	      models = this.add(models, _.extend({silent: true}, options));
	      if (!options.silent) this.trigger('reset', this, options);
	      return models;
	    },

	    // Add a model to the end of the collection.
	    push: function(model, options) {
	      return this.add(model, _.extend({at: this.length}, options));
	    },

	    // Remove a model from the end of the collection.
	    pop: function(options) {
	      var model = this.at(this.length - 1);
	      this.remove(model, options);
	      return model;
	    },

	    // Add a model to the beginning of the collection.
	    unshift: function(model, options) {
	      return this.add(model, _.extend({at: 0}, options));
	    },

	    // Remove a model from the beginning of the collection.
	    shift: function(options) {
	      var model = this.at(0);
	      this.remove(model, options);
	      return model;
	    },

	    // Slice out a sub-array of models from the collection.
	    slice: function() {
	      return slice.apply(this.models, arguments);
	    },

	    // Get a model from the set by id.
	    get: function(obj) {
	      if (obj == null) return void 0;
	      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
	    },

	    // Get the model at the given index.
	    at: function(index) {
	      return this.models[index];
	    },

	    // Return models with matching attributes. Useful for simple cases of
	    // `filter`.
	    where: function(attrs, first) {
	      if (_.isEmpty(attrs)) return first ? void 0 : [];
	      return this[first ? 'find' : 'filter'](function(model) {
	        for (var key in attrs) {
	          if (attrs[key] !== model.get(key)) return false;
	        }
	        return true;
	      });
	    },

	    // Return the first model with matching attributes. Useful for simple cases
	    // of `find`.
	    findWhere: function(attrs) {
	      return this.where(attrs, true);
	    },

	    // Force the collection to re-sort itself. You don't need to call this under
	    // normal circumstances, as the set will maintain sort order as each item
	    // is added.
	    sort: function(options) {
	      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
	      options || (options = {});

	      // Run sort based on type of `comparator`.
	      if (_.isString(this.comparator) || this.comparator.length === 1) {
	        this.models = this.sortBy(this.comparator, this);
	      } else {
	        this.models.sort(_.bind(this.comparator, this));
	      }

	      if (!options.silent) this.trigger('sort', this, options);
	      return this;
	    },

	    // Pluck an attribute from each model in the collection.
	    pluck: function(attr) {
	      return _.invoke(this.models, 'get', attr);
	    },

	    // Fetch the default set of models for this collection, resetting the
	    // collection when they arrive. If `reset: true` is passed, the response
	    // data will be passed through the `reset` method instead of `set`.
	    fetch: function(options) {
	      options = options ? _.clone(options) : {};
	      if (options.parse === void 0) options.parse = true;
	      var success = options.success;
	      var collection = this;
	      options.success = function(resp) {
	        var method = options.reset ? 'reset' : 'set';
	        collection[method](resp, options);
	        if (success) success(collection, resp, options);
	        collection.trigger('sync', collection, resp, options);
	      };
	      wrapError(this, options);
	      return this.sync('read', this, options);
	    },

	    // Create a new instance of a model in this collection. Add the model to the
	    // collection immediately, unless `wait: true` is passed, in which case we
	    // wait for the server to agree.
	    create: function(model, options) {
	      options = options ? _.clone(options) : {};
	      if (!(model = this._prepareModel(model, options))) return false;
	      if (!options.wait) this.add(model, options);
	      var collection = this;
	      var success = options.success;
	      options.success = function(model, resp) {
	        if (options.wait) collection.add(model, options);
	        if (success) success(model, resp, options);
	      };
	      model.save(null, options);
	      return model;
	    },

	    // **parse** converts a response into a list of models to be added to the
	    // collection. The default implementation is just to pass it through.
	    parse: function(resp, options) {
	      return resp;
	    },

	    // Create a new collection with an identical list of models as this one.
	    clone: function() {
	      return new this.constructor(this.models);
	    },

	    // Private method to reset all internal state. Called when the collection
	    // is first initialized or reset.
	    _reset: function() {
	      this.length = 0;
	      this.models = [];
	      this._byId  = {};
	    },

	    // Prepare a hash of attributes (or other model) to be added to this
	    // collection.
	    _prepareModel: function(attrs, options) {
	      if (attrs instanceof Model) return attrs;
	      options = options ? _.clone(options) : {};
	      options.collection = this;
	      var model = new this.model(attrs, options);
	      if (!model.validationError) return model;
	      this.trigger('invalid', this, model.validationError, options);
	      return false;
	    },

	    // Internal method to create a model's ties to a collection.
	    _addReference: function(model, options) {
	      this._byId[model.cid] = model;
	      if (model.id != null) this._byId[model.id] = model;
	      if (!model.collection) model.collection = this;
	      model.on('all', this._onModelEvent, this);
	    },

	    // Internal method to sever a model's ties to a collection.
	    _removeReference: function(model, options) {
	      if (this === model.collection) delete model.collection;
	      model.off('all', this._onModelEvent, this);
	    },

	    // Internal method called every time a model in the set fires an event.
	    // Sets need to update their indexes when models change ids. All other
	    // events simply proxy through. "add" and "remove" events that originate
	    // in other collections are ignored.
	    _onModelEvent: function(event, model, collection, options) {
	      if ((event === 'add' || event === 'remove') && collection !== this) return;
	      if (event === 'destroy') this.remove(model, options);
	      if (model && event === 'change:' + model.idAttribute) {
	        delete this._byId[model.previous(model.idAttribute)];
	        if (model.id != null) this._byId[model.id] = model;
	      }
	      this.trigger.apply(this, arguments);
	    }

	  });

	  // Underscore methods that we want to implement on the Collection.
	  // 90% of the core usefulness of Backbone Collections is actually implemented
	  // right here:
	  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
	    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
	    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
	    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
	    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
	    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

	  // Mix in each Underscore method as a proxy to `Collection#models`.
	  _.each(methods, function(method) {
	    Collection.prototype[method] = function() {
	      var args = slice.call(arguments);
	      args.unshift(this.models);
	      return _[method].apply(_, args);
	    };
	  });

	  // Underscore methods that take a property name as an argument.
	  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

	  // Use attributes instead of properties.
	  _.each(attributeMethods, function(method) {
	    Collection.prototype[method] = function(value, context) {
	      var iterator = _.isFunction(value) ? value : function(model) {
	        return model.get(value);
	      };
	      return _[method](this.models, iterator, context);
	    };
	  });

	  // Backbone.View
	  // -------------

	  // Backbone Views are almost more convention than they are actual code. A View
	  // is simply a JavaScript object that represents a logical chunk of UI in the
	  // DOM. This might be a single item, an entire list, a sidebar or panel, or
	  // even the surrounding frame which wraps your whole app. Defining a chunk of
	  // UI as a **View** allows you to define your DOM events declaratively, without
	  // having to worry about render order ... and makes it easy for the view to
	  // react to specific changes in the state of your models.

	  // Creating a Backbone.View creates its initial element outside of the DOM,
	  // if an existing element is not provided...
	  var View = Backbone.View = function(options) {
	    this.cid = _.uniqueId('view');
	    options || (options = {});
	    _.extend(this, _.pick(options, viewOptions));
	    this._ensureElement();
	    this.initialize.apply(this, arguments);
	    this.delegateEvents();
	  };

	  // Cached regex to split keys for `delegate`.
	  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

	  // List of view options to be merged as properties.
	  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

	  // Set up all inheritable **Backbone.View** properties and methods.
	  _.extend(View.prototype, Events, {

	    // The default `tagName` of a View's element is `"div"`.
	    tagName: 'div',

	    // jQuery delegate for element lookup, scoped to DOM elements within the
	    // current view. This should be preferred to global lookups where possible.
	    $: function(selector) {
	      return this.$el.find(selector);
	    },

	    // Initialize is an empty function by default. Override it with your own
	    // initialization logic.
	    initialize: function(){},

	    // **render** is the core function that your view should override, in order
	    // to populate its element (`this.el`), with the appropriate HTML. The
	    // convention is for **render** to always return `this`.
	    render: function() {
	      return this;
	    },

	    // Remove this view by taking the element out of the DOM, and removing any
	    // applicable Backbone.Events listeners.
	    remove: function() {
	      this.$el.remove();
	      this.stopListening();
	      return this;
	    },

	    // Change the view's element (`this.el` property), including event
	    // re-delegation.
	    setElement: function(element, delegate) {
	      if (this.$el) this.undelegateEvents();
	      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
	      this.el = this.$el[0];
	      if (delegate !== false) this.delegateEvents();
	      return this;
	    },

	    // Set callbacks, where `this.events` is a hash of
	    //
	    // *{"event selector": "callback"}*
	    //
	    //     {
	    //       'mousedown .title':  'edit',
	    //       'click .button':     'save',
	    //       'click .open':       function(e) { ... }
	    //     }
	    //
	    // pairs. Callbacks will be bound to the view, with `this` set properly.
	    // Uses event delegation for efficiency.
	    // Omitting the selector binds the event to `this.el`.
	    // This only works for delegate-able events: not `focus`, `blur`, and
	    // not `change`, `submit`, and `reset` in Internet Explorer.
	    delegateEvents: function(events) {
	      if (!(events || (events = _.result(this, 'events')))) return this;
	      this.undelegateEvents();
	      for (var key in events) {
	        var method = events[key];
	        if (!_.isFunction(method)) method = this[events[key]];
	        if (!method) continue;

	        var match = key.match(delegateEventSplitter);
	        var eventName = match[1], selector = match[2];
	        method = _.bind(method, this);
	        eventName += '.delegateEvents' + this.cid;
	        if (selector === '') {
	          this.$el.on(eventName, method);
	        } else {
	          this.$el.on(eventName, selector, method);
	        }
	      }
	      return this;
	    },

	    // Clears all callbacks previously bound to the view with `delegateEvents`.
	    // You usually don't need to use this, but may wish to if you have multiple
	    // Backbone views attached to the same DOM element.
	    undelegateEvents: function() {
	      this.$el.off('.delegateEvents' + this.cid);
	      return this;
	    },

	    // Ensure that the View has a DOM element to render into.
	    // If `this.el` is a string, pass it through `$()`, take the first
	    // matching element, and re-assign it to `el`. Otherwise, create
	    // an element from the `id`, `className` and `tagName` properties.
	    _ensureElement: function() {
	      if (!this.el) {
	        var attrs = _.extend({}, _.result(this, 'attributes'));
	        if (this.id) attrs.id = _.result(this, 'id');
	        if (this.className) attrs['class'] = _.result(this, 'className');
	        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
	        this.setElement($el, false);
	      } else {
	        this.setElement(_.result(this, 'el'), false);
	      }
	    }

	  });

	  // Backbone.sync
	  // -------------

	  // Override this function to change the manner in which Backbone persists
	  // models to the server. You will be passed the type of request, and the
	  // model in question. By default, makes a RESTful Ajax request
	  // to the model's `url()`. Some possible customizations could be:
	  //
	  // * Use `setTimeout` to batch rapid-fire updates into a single request.
	  // * Send up the models as XML instead of JSON.
	  // * Persist models via WebSockets instead of Ajax.
	  //
	  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
	  // as `POST`, with a `_method` parameter containing the true HTTP method,
	  // as well as all requests with the body as `application/x-www-form-urlencoded`
	  // instead of `application/json` with the model in a param named `model`.
	  // Useful when interfacing with server-side languages like **PHP** that make
	  // it difficult to read the body of `PUT` requests.
	  Backbone.sync = function(method, model, options) {
	    var type = methodMap[method];

	    // Default options, unless specified.
	    _.defaults(options || (options = {}), {
	      emulateHTTP: Backbone.emulateHTTP,
	      emulateJSON: Backbone.emulateJSON
	    });

	    // Default JSON-request options.
	    var params = {type: type, dataType: 'json'};

	    // Ensure that we have a URL.
	    if (!options.url) {
	      params.url = _.result(model, 'url') || urlError();
	    }

	    // Ensure that we have the appropriate request data.
	    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
	      params.contentType = 'application/json';
	      params.data = JSON.stringify(options.attrs || model.toJSON(options));
	    }

	    // For older servers, emulate JSON by encoding the request into an HTML-form.
	    if (options.emulateJSON) {
	      params.contentType = 'application/x-www-form-urlencoded';
	      params.data = params.data ? {model: params.data} : {};
	    }

	    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
	    // And an `X-HTTP-Method-Override` header.
	    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
	      params.type = 'POST';
	      if (options.emulateJSON) params.data._method = type;
	      var beforeSend = options.beforeSend;
	      options.beforeSend = function(xhr) {
	        xhr.setRequestHeader('X-HTTP-Method-Override', type);
	        if (beforeSend) return beforeSend.apply(this, arguments);
	      };
	    }

	    // Don't process data on a non-GET request.
	    if (params.type !== 'GET' && !options.emulateJSON) {
	      params.processData = false;
	    }

	    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
	    // that still has ActiveX enabled by default, override jQuery to use that
	    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
	    if (params.type === 'PATCH' && noXhrPatch) {
	      params.xhr = function() {
	        return new ActiveXObject("Microsoft.XMLHTTP");
	      };
	    }

	    // Make the request, allowing the user to override any Ajax options.
	    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
	    model.trigger('request', model, xhr, options);
	    return xhr;
	  };

	  var noXhrPatch =
	    typeof window !== 'undefined' && !!window.ActiveXObject &&
	      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

	  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	  var methodMap = {
	    'create': 'POST',
	    'update': 'PUT',
	    'patch':  'PATCH',
	    'delete': 'DELETE',
	    'read':   'GET'
	  };

	  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
	  // Override this if you'd like to use a different library.
	  Backbone.ajax = function() {
	    return Backbone.$.ajax.apply(Backbone.$, arguments);
	  };

	  // Backbone.Router
	  // ---------------

	  // Routers map faux-URLs to actions, and fire events when routes are
	  // matched. Creating a new one sets its `routes` hash, if not set statically.
	  var Router = Backbone.Router = function(options) {
	    options || (options = {});
	    if (options.routes) this.routes = options.routes;
	    this._bindRoutes();
	    this.initialize.apply(this, arguments);
	  };

	  // Cached regular expressions for matching named param parts and splatted
	  // parts of route strings.
	  var optionalParam = /\((.*?)\)/g;
	  var namedParam    = /(\(\?)?:\w+/g;
	  var splatParam    = /\*\w+/g;
	  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

	  // Set up all inheritable **Backbone.Router** properties and methods.
	  _.extend(Router.prototype, Events, {

	    // Initialize is an empty function by default. Override it with your own
	    // initialization logic.
	    initialize: function(){},

	    // Manually bind a single named route to a callback. For example:
	    //
	    //     this.route('search/:query/p:num', 'search', function(query, num) {
	    //       ...
	    //     });
	    //
	    route: function(route, name, callback) {
	      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
	      if (_.isFunction(name)) {
	        callback = name;
	        name = '';
	      }
	      if (!callback) callback = this[name];
	      var router = this;
	      Backbone.history.route(route, function(fragment) {
	        var args = router._extractParameters(route, fragment);
	        router.execute(callback, args);
	        router.trigger.apply(router, ['route:' + name].concat(args));
	        router.trigger('route', name, args);
	        Backbone.history.trigger('route', router, name, args);
	      });
	      return this;
	    },

	    // Execute a route handler with the provided parameters.  This is an
	    // excellent place to do pre-route setup or post-route cleanup.
	    execute: function(callback, args) {
	      if (callback) callback.apply(this, args);
	    },

	    // Simple proxy to `Backbone.history` to save a fragment into the history.
	    navigate: function(fragment, options) {
	      Backbone.history.navigate(fragment, options);
	      return this;
	    },

	    // Bind all defined routes to `Backbone.history`. We have to reverse the
	    // order of the routes here to support behavior where the most general
	    // routes can be defined at the bottom of the route map.
	    _bindRoutes: function() {
	      if (!this.routes) return;
	      this.routes = _.result(this, 'routes');
	      var route, routes = _.keys(this.routes);
	      while ((route = routes.pop()) != null) {
	        this.route(route, this.routes[route]);
	      }
	    },

	    // Convert a route string into a regular expression, suitable for matching
	    // against the current location hash.
	    _routeToRegExp: function(route) {
	      route = route.replace(escapeRegExp, '\\$&')
	                   .replace(optionalParam, '(?:$1)?')
	                   .replace(namedParam, function(match, optional) {
	                     return optional ? match : '([^/?]+)';
	                   })
	                   .replace(splatParam, '([^?]*?)');
	      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
	    },

	    // Given a route, and a URL fragment that it matches, return the array of
	    // extracted decoded parameters. Empty or unmatched parameters will be
	    // treated as `null` to normalize cross-browser behavior.
	    _extractParameters: function(route, fragment) {
	      var params = route.exec(fragment).slice(1);
	      return _.map(params, function(param, i) {
	        // Don't decode the search params.
	        if (i === params.length - 1) return param || null;
	        return param ? decodeURIComponent(param) : null;
	      });
	    }

	  });

	  // Backbone.History
	  // ----------------

	  // Handles cross-browser history management, based on either
	  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
	  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
	  // and URL fragments. If the browser supports neither (old IE, natch),
	  // falls back to polling.
	  var History = Backbone.History = function() {
	    this.handlers = [];
	    _.bindAll(this, 'checkUrl');

	    // Ensure that `History` can be used outside of the browser.
	    if (typeof window !== 'undefined') {
	      this.location = window.location;
	      this.history = window.history;
	    }
	  };

	  // Cached regex for stripping a leading hash/slash and trailing space.
	  var routeStripper = /^[#\/]|\s+$/g;

	  // Cached regex for stripping leading and trailing slashes.
	  var rootStripper = /^\/+|\/+$/g;

	  // Cached regex for detecting MSIE.
	  var isExplorer = /msie [\w.]+/;

	  // Cached regex for removing a trailing slash.
	  var trailingSlash = /\/$/;

	  // Cached regex for stripping urls of hash.
	  var pathStripper = /#.*$/;

	  // Has the history handling already been started?
	  History.started = false;

	  // Set up all inheritable **Backbone.History** properties and methods.
	  _.extend(History.prototype, Events, {

	    // The default interval to poll for hash changes, if necessary, is
	    // twenty times a second.
	    interval: 50,

	    // Are we at the app root?
	    atRoot: function() {
	      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
	    },

	    // Gets the true hash value. Cannot use location.hash directly due to bug
	    // in Firefox where location.hash will always be decoded.
	    getHash: function(window) {
	      var match = (window || this).location.href.match(/#(.*)$/);
	      return match ? match[1] : '';
	    },

	    // Get the cross-browser normalized URL fragment, either from the URL,
	    // the hash, or the override.
	    getFragment: function(fragment, forcePushState) {
	      if (fragment == null) {
	        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
	          fragment = decodeURI(this.location.pathname + this.location.search);
	          var root = this.root.replace(trailingSlash, '');
	          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
	        } else {
	          fragment = this.getHash();
	        }
	      }
	      return fragment.replace(routeStripper, '');
	    },

	    // Start the hash change handling, returning `true` if the current URL matches
	    // an existing route, and `false` otherwise.
	    start: function(options) {
	      if (History.started) throw new Error("Backbone.history has already been started");
	      History.started = true;

	      // Figure out the initial configuration. Do we need an iframe?
	      // Is pushState desired ... is it available?
	      this.options          = _.extend({root: '/'}, this.options, options);
	      this.root             = this.options.root;
	      this._wantsHashChange = this.options.hashChange !== false;
	      this._wantsPushState  = !!this.options.pushState;
	      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
	      var fragment          = this.getFragment();
	      var docMode           = document.documentMode;
	      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

	      // Normalize root to always include a leading and trailing slash.
	      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

	      if (oldIE && this._wantsHashChange) {
	        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
	        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
	        this.navigate(fragment);
	      }

	      // Depending on whether we're using pushState or hashes, and whether
	      // 'onhashchange' is supported, determine how we check the URL state.
	      if (this._hasPushState) {
	        Backbone.$(window).on('popstate', this.checkUrl);
	      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
	        Backbone.$(window).on('hashchange', this.checkUrl);
	      } else if (this._wantsHashChange) {
	        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
	      }

	      // Determine if we need to change the base url, for a pushState link
	      // opened by a non-pushState browser.
	      this.fragment = fragment;
	      var loc = this.location;

	      // Transition from hashChange to pushState or vice versa if both are
	      // requested.
	      if (this._wantsHashChange && this._wantsPushState) {

	        // If we've started off with a route from a `pushState`-enabled
	        // browser, but we're currently in a browser that doesn't support it...
	        if (!this._hasPushState && !this.atRoot()) {
	          this.fragment = this.getFragment(null, true);
	          this.location.replace(this.root + '#' + this.fragment);
	          // Return immediately as browser will do redirect to new url
	          return true;

	        // Or if we've started out with a hash-based route, but we're currently
	        // in a browser where it could be `pushState`-based instead...
	        } else if (this._hasPushState && this.atRoot() && loc.hash) {
	          this.fragment = this.getHash().replace(routeStripper, '');
	          this.history.replaceState({}, document.title, this.root + this.fragment);
	        }

	      }

	      if (!this.options.silent) return this.loadUrl();
	    },

	    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
	    // but possibly useful for unit testing Routers.
	    stop: function() {
	      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
	      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
	      History.started = false;
	    },

	    // Add a route to be tested when the fragment changes. Routes added later
	    // may override previous routes.
	    route: function(route, callback) {
	      this.handlers.unshift({route: route, callback: callback});
	    },

	    // Checks the current URL to see if it has changed, and if it has,
	    // calls `loadUrl`, normalizing across the hidden iframe.
	    checkUrl: function(e) {
	      var current = this.getFragment();
	      if (current === this.fragment && this.iframe) {
	        current = this.getFragment(this.getHash(this.iframe));
	      }
	      if (current === this.fragment) return false;
	      if (this.iframe) this.navigate(current);
	      this.loadUrl();
	    },

	    // Attempt to load the current URL fragment. If a route succeeds with a
	    // match, returns `true`. If no defined routes matches the fragment,
	    // returns `false`.
	    loadUrl: function(fragment) {
	      fragment = this.fragment = this.getFragment(fragment);
	      return _.any(this.handlers, function(handler) {
	        if (handler.route.test(fragment)) {
	          handler.callback(fragment);
	          return true;
	        }
	      });
	    },

	    // Save a fragment into the hash history, or replace the URL state if the
	    // 'replace' option is passed. You are responsible for properly URL-encoding
	    // the fragment in advance.
	    //
	    // The options object can contain `trigger: true` if you wish to have the
	    // route callback be fired (not usually desirable), or `replace: true`, if
	    // you wish to modify the current URL without adding an entry to the history.
	    navigate: function(fragment, options) {
	      if (!History.started) return false;
	      if (!options || options === true) options = {trigger: !!options};

	      var url = this.root + (fragment = this.getFragment(fragment || ''));

	      // Strip the hash for matching.
	      fragment = fragment.replace(pathStripper, '');

	      if (this.fragment === fragment) return;
	      this.fragment = fragment;

	      // Don't include a trailing slash on the root.
	      if (fragment === '' && url !== '/') url = url.slice(0, -1);

	      // If pushState is available, we use it to set the fragment as a real URL.
	      if (this._hasPushState) {
	        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

	      // If hash changes haven't been explicitly disabled, update the hash
	      // fragment to store history.
	      } else if (this._wantsHashChange) {
	        this._updateHash(this.location, fragment, options.replace);
	        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
	          // Opening and closing the iframe tricks IE7 and earlier to push a
	          // history entry on hash-tag change.  When replace is true, we don't
	          // want this.
	          if(!options.replace) this.iframe.document.open().close();
	          this._updateHash(this.iframe.location, fragment, options.replace);
	        }

	      // If you've told us that you explicitly don't want fallback hashchange-
	      // based history, then `navigate` becomes a page refresh.
	      } else {
	        return this.location.assign(url);
	      }
	      if (options.trigger) return this.loadUrl(fragment);
	    },

	    // Update the hash location, either replacing the current entry, or adding
	    // a new one to the browser history.
	    _updateHash: function(location, fragment, replace) {
	      if (replace) {
	        var href = location.href.replace(/(javascript:|#).*$/, '');
	        location.replace(href + '#' + fragment);
	      } else {
	        // Some browsers require that `hash` contains a leading #.
	        location.hash = '#' + fragment;
	      }
	    }

	  });

	  // Create the default Backbone.history.
	  Backbone.history = new History;

	  // Helpers
	  // -------

	  // Helper function to correctly set up the prototype chain, for subclasses.
	  // Similar to `goog.inherits`, but uses a hash of prototype properties and
	  // class properties to be extended.
	  var extend = function(protoProps, staticProps) {
	    var parent = this;
	    var child;

	    // The constructor function for the new subclass is either defined by you
	    // (the "constructor" property in your `extend` definition), or defaulted
	    // by us to simply call the parent's constructor.
	    if (protoProps && _.has(protoProps, 'constructor')) {
	      child = protoProps.constructor;
	    } else {
	      child = function(){ return parent.apply(this, arguments); };
	    }

	    // Add static properties to the constructor function, if supplied.
	    _.extend(child, parent, staticProps);

	    // Set the prototype chain to inherit from `parent`, without calling
	    // `parent`'s constructor function.
	    var Surrogate = function(){ this.constructor = child; };
	    Surrogate.prototype = parent.prototype;
	    child.prototype = new Surrogate;

	    // Add prototype properties (instance properties) to the subclass,
	    // if supplied.
	    if (protoProps) _.extend(child.prototype, protoProps);

	    // Set a convenience property in case the parent's prototype is needed
	    // later.
	    child.__super__ = parent.prototype;

	    return child;
	  };

	  // Set up inheritance for the model, collection, router, view and history.
	  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

	  // Throw an error when a URL is needed, and none is supplied.
	  var urlError = function() {
	    throw new Error('A "url" property or function must be specified');
	  };

	  // Wrap an optional error callback with a fallback error event.
	  var wrapError = function(model, options) {
	    var error = options.error;
	    options.error = function(resp) {
	      if (error) error(model, resp, options);
	      model.trigger('error', model, resp, options);
	    };
	  };

	  return Backbone;

	}));


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.2
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function() {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function(){};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function(obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.2';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function(func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1: return function(value) {
	        return func.call(context, value);
	      };
	      case 2: return function(value, other) {
	        return func.call(context, value, other);
	      };
	      case 3: return function(value, index, collection) {
	        return func.call(context, value, index, collection);
	      };
	      case 4: return function(accumulator, value, index, collection) {
	        return func.call(context, accumulator, value, index, collection);
	      };
	    }
	    return function() {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function(value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function(value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function(keysFunc, undefinedOnly) {
	    return function(obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function(prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor;
	    Ctor.prototype = null;
	    return result;
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var isArrayLike = function(collection) {
	    var length = collection && collection.length;
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function(obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function(obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function(obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function(obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function(value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function(obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given value (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function(obj, target, fromIndex) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    return _.indexOf(obj, target, typeof fromIndex == 'number' && fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function(obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function(value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function(obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function(obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function(obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function(obj, iteratee, context) {
	    var result = -Infinity, lastComputed = -Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function(obj, iteratee, context) {
	    var result = Infinity, lastComputed = Infinity,
	        value, computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function(obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function(obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function(value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function(left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function(behavior) {
	    return function(obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function(value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function(result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function(result, value, key) {
	    if (_.has(result, key)) result[key]++; else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function(obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function(obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [], fail = [];
	    _.each(obj, function(value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function(array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function(array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function(array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function(array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function(input, shallow, strict, startIndex) {
	    var output = [], idx = 0;
	    for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0, len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function(array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function(array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
	    if (array == null) return [];
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = array.length; i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function() {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function(array) {
	    if (array == null) return [];
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = array.length; i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function(array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function(value){
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function() {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function(array) {
	    var length = array && _.max(array, 'length').length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function(list, values) {
	    var result = {};
	    for (var i = 0, length = list && list.length; i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = function(array, item, isSorted) {
	    var i = 0, length = array && array.length;
	    if (typeof isSorted == 'number') {
	      i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
	    } else if (isSorted && length) {
	      i = _.sortedIndex(array, item);
	      return array[i] === item ? i : -1;
	    }
	    if (item !== item) {
	      return _.findIndex(slice.call(array, i), _.isNaN);
	    }
	    for (; i < length; i++) if (array[i] === item) return i;
	    return -1;
	  };

	  _.lastIndexOf = function(array, item, from) {
	    var idx = array ? array.length : 0;
	    if (typeof from == 'number') {
	      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
	    }
	    if (item !== item) {
	      return _.findLastIndex(slice.call(array, 0, idx), _.isNaN);
	    }
	    while (--idx >= 0) if (array[idx] === item) return idx;
	    return -1;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createIndexFinder(dir) {
	    return function(array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = array != null && array.length;
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createIndexFinder(1);

	  _.findLastIndex = createIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function(array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0, high = array.length;
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
	    }
	    return low;
	  };

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function(start, stop, step) {
	    if (arguments.length <= 1) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function(func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function() {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function(func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function() {
	      var position = 0, length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function(obj) {
	    var i, length = arguments.length, key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function(func, hasher) {
	    var memoize = function(key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function(func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function(){
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function(func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function() {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function() {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function(func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function() {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function() {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function(func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function() {
	    var args = arguments;
	    var start = args.length - 1;
	    return function() {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function(times, func) {
	    return function() {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function(times, func) {
	    var memo;
	    return function() {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
	                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function(obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function(obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys =  _.keys(obj),
	          length = keys.length,
	          results = {},
	          currentKey;
	      for (var index = 0; index < length; index++) {
	        currentKey = keys[index];
	        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	      }
	      return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function(obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function(obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function(obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function(obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj), key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function(object, oiteratee, context) {
	    var result = {}, obj = object, iteratee, keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function(value, key, obj) { return key in obj; };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	   // Return a copy of the object without the blacklisted properties.
	  _.omit = function(obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function(value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function(obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function(obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function(object, attrs) {
	    var keys = _.keys(attrs), length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };


	  // Internal recursive comparison function for `isEqual`.
	  var eq = function(a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor, bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
	                               _.isFunction(bCtor) && bCtor instanceof bCtor)
	                          && ('constructor' in a && 'constructor' in b)) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
	    
	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a), key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function(a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function(obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function(obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function(obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function(obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
	    _['is' + name] = function(obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function(obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function(obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function(obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function(obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function(obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function(obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function(obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function() {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function(value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function(value) {
	    return function() {
	      return value;
	    };
	  };

	  _.noop = function(){};

	  _.property = function(key) {
	    return function(obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function(obj) {
	    return obj == null ? function(){} : function(key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of 
	  // `key:value` pairs.
	  _.matcher = _.matches = function(attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function(obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function(n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function(min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function() {
	    return new Date().getTime();
	  };

	   // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function(map) {
	    var escaper = function(match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function(string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function(object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function(prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate    : /<%([\s\S]+?)%>/g,
	    interpolate : /<%=([\s\S]+?)%>/g,
	    escape      : /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'":      "'",
	    '\\':     '\\',
	    '\r':     'r',
	    '\n':     'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function(match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function(text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([
	      (settings.escape || noMatch).source,
	      (settings.interpolate || noMatch).source,
	      (settings.evaluate || noMatch).source
	    ].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," +
	      "print=function(){__p+=__j.call(arguments,'');};\n" +
	      source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function(data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function(obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function(instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function(obj) {
	    _.each(_.functions(obj), function(name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function() {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function(name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function() {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function() {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
	  
	  _.prototype.toString = function() {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}.call(this));


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {/*!
	 * Knockout JavaScript library v3.3.0
	 * (c) Steven Sanderson - http://knockoutjs.com/
	 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
	 */

	(function(){
	var DEBUG=true;
	(function(undefined){
	    // (0, eval)('this') is a robust way of getting a reference to the global object
	    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
	    var window = this || (0, eval)('this'),
	        document = window['document'],
	        navigator = window['navigator'],
	        jQueryInstance = window["jQuery"],
	        JSON = window["JSON"];
	(function(factory) {
	    // Support three module loading scenarios
	    if ("function" === 'function' && __webpack_require__(26)['amd']) {
	        // [1] AMD anonymous module
	        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, __webpack_require__], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	    } else if (true) {
	        // [2] CommonJS/Node.js
	        factory(module['exports'] || exports);  // module.exports is for Node.js
	    } else {
	        // [3] No module loader (plain <script> tag) - put directly in global namespace
	        factory(window['ko'] = {});
	    }
	}(function(koExports, amdRequire){
	// Internally, all KO objects are attached to koExports (even the non-exported ones whose names will be minified by the closure compiler).
	// In the future, the following "ko" variable may be made distinct from "koExports" so that private objects are not externally reachable.
	var ko = typeof koExports !== 'undefined' ? koExports : {};
	// Google Closure Compiler helpers (used only to make the minified file smaller)
	ko.exportSymbol = function(koPath, object) {
	    var tokens = koPath.split(".");

	    // In the future, "ko" may become distinct from "koExports" (so that non-exported objects are not reachable)
	    // At that point, "target" would be set to: (typeof koExports !== "undefined" ? koExports : ko)
	    var target = ko;

	    for (var i = 0; i < tokens.length - 1; i++)
	        target = target[tokens[i]];
	    target[tokens[tokens.length - 1]] = object;
	};
	ko.exportProperty = function(owner, publicName, object) {
	    owner[publicName] = object;
	};
	ko.version = "3.3.0";

	ko.exportSymbol('version', ko.version);
	ko.utils = (function () {
	    function objectForEach(obj, action) {
	        for (var prop in obj) {
	            if (obj.hasOwnProperty(prop)) {
	                action(prop, obj[prop]);
	            }
	        }
	    }

	    function extend(target, source) {
	        if (source) {
	            for(var prop in source) {
	                if(source.hasOwnProperty(prop)) {
	                    target[prop] = source[prop];
	                }
	            }
	        }
	        return target;
	    }

	    function setPrototypeOf(obj, proto) {
	        obj.__proto__ = proto;
	        return obj;
	    }

	    var canSetPrototype = ({ __proto__: [] } instanceof Array);

	    // Represent the known event types in a compact way, then at runtime transform it into a hash with event name as key (for fast lookup)
	    var knownEvents = {}, knownEventTypesByEventName = {};
	    var keyEventTypeName = (navigator && /Firefox\/2/i.test(navigator.userAgent)) ? 'KeyboardEvent' : 'UIEvents';
	    knownEvents[keyEventTypeName] = ['keyup', 'keydown', 'keypress'];
	    knownEvents['MouseEvents'] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
	    objectForEach(knownEvents, function(eventType, knownEventsForType) {
	        if (knownEventsForType.length) {
	            for (var i = 0, j = knownEventsForType.length; i < j; i++)
	                knownEventTypesByEventName[knownEventsForType[i]] = eventType;
	        }
	    });
	    var eventsThatMustBeRegisteredUsingAttachEvent = { 'propertychange': true }; // Workaround for an IE9 issue - https://github.com/SteveSanderson/knockout/issues/406

	    // Detect IE versions for bug workarounds (uses IE conditionals, not UA string, for robustness)
	    // Note that, since IE 10 does not support conditional comments, the following logic only detects IE < 10.
	    // Currently this is by design, since IE 10+ behaves correctly when treated as a standard browser.
	    // If there is a future need to detect specific versions of IE10+, we will amend this.
	    var ieVersion = document && (function() {
	        var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

	        // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
	        while (
	            div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
	            iElems[0]
	        ) {}
	        return version > 4 ? version : undefined;
	    }());
	    var isIe6 = ieVersion === 6,
	        isIe7 = ieVersion === 7;

	    function isClickOnCheckableElement(element, eventType) {
	        if ((ko.utils.tagNameLower(element) !== "input") || !element.type) return false;
	        if (eventType.toLowerCase() != "click") return false;
	        var inputType = element.type;
	        return (inputType == "checkbox") || (inputType == "radio");
	    }

	    // For details on the pattern for changing node classes
	    // see: https://github.com/knockout/knockout/issues/1597
	    var cssClassNameRegex = /\S+/g;

	    function toggleDomNodeCssClass(node, classNames, shouldHaveClass) {
	        var addOrRemoveFn;
	        if (classNames) {
	            if (typeof node.classList === 'object') {
	                addOrRemoveFn = node.classList[shouldHaveClass ? 'add' : 'remove'];
	                ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
	                    addOrRemoveFn.call(node.classList, className);
	                });
	            } else if (typeof node.className['baseVal'] === 'string') {
	                // SVG tag .classNames is an SVGAnimatedString instance
	                toggleObjectClassPropertyString(node.className, 'baseVal', classNames, shouldHaveClass);
	            } else {
	                // node.className ought to be a string.
	                toggleObjectClassPropertyString(node, 'className', classNames, shouldHaveClass);
	            }
	        }
	    }

	    function toggleObjectClassPropertyString(obj, prop, classNames, shouldHaveClass) {
	        // obj/prop is either a node/'className' or a SVGAnimatedString/'baseVal'.
	        var currentClassNames = obj[prop].match(cssClassNameRegex) || [];
	        ko.utils.arrayForEach(classNames.match(cssClassNameRegex), function(className) {
	            ko.utils.addOrRemoveItem(currentClassNames, className, shouldHaveClass);
	        });
	        obj[prop] = currentClassNames.join(" ");
	    }

	    return {
	        fieldsIncludedWithJsonPost: ['authenticity_token', /^__RequestVerificationToken(_.*)?$/],

	        arrayForEach: function (array, action) {
	            for (var i = 0, j = array.length; i < j; i++)
	                action(array[i], i);
	        },

	        arrayIndexOf: function (array, item) {
	            if (typeof Array.prototype.indexOf == "function")
	                return Array.prototype.indexOf.call(array, item);
	            for (var i = 0, j = array.length; i < j; i++)
	                if (array[i] === item)
	                    return i;
	            return -1;
	        },

	        arrayFirst: function (array, predicate, predicateOwner) {
	            for (var i = 0, j = array.length; i < j; i++)
	                if (predicate.call(predicateOwner, array[i], i))
	                    return array[i];
	            return null;
	        },

	        arrayRemoveItem: function (array, itemToRemove) {
	            var index = ko.utils.arrayIndexOf(array, itemToRemove);
	            if (index > 0) {
	                array.splice(index, 1);
	            }
	            else if (index === 0) {
	                array.shift();
	            }
	        },

	        arrayGetDistinctValues: function (array) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++) {
	                if (ko.utils.arrayIndexOf(result, array[i]) < 0)
	                    result.push(array[i]);
	            }
	            return result;
	        },

	        arrayMap: function (array, mapping) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++)
	                result.push(mapping(array[i], i));
	            return result;
	        },

	        arrayFilter: function (array, predicate) {
	            array = array || [];
	            var result = [];
	            for (var i = 0, j = array.length; i < j; i++)
	                if (predicate(array[i], i))
	                    result.push(array[i]);
	            return result;
	        },

	        arrayPushAll: function (array, valuesToPush) {
	            if (valuesToPush instanceof Array)
	                array.push.apply(array, valuesToPush);
	            else
	                for (var i = 0, j = valuesToPush.length; i < j; i++)
	                    array.push(valuesToPush[i]);
	            return array;
	        },

	        addOrRemoveItem: function(array, value, included) {
	            var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.peekObservable(array), value);
	            if (existingEntryIndex < 0) {
	                if (included)
	                    array.push(value);
	            } else {
	                if (!included)
	                    array.splice(existingEntryIndex, 1);
	            }
	        },

	        canSetPrototype: canSetPrototype,

	        extend: extend,

	        setPrototypeOf: setPrototypeOf,

	        setPrototypeOfOrExtend: canSetPrototype ? setPrototypeOf : extend,

	        objectForEach: objectForEach,

	        objectMap: function(source, mapping) {
	            if (!source)
	                return source;
	            var target = {};
	            for (var prop in source) {
	                if (source.hasOwnProperty(prop)) {
	                    target[prop] = mapping(source[prop], prop, source);
	                }
	            }
	            return target;
	        },

	        emptyDomNode: function (domNode) {
	            while (domNode.firstChild) {
	                ko.removeNode(domNode.firstChild);
	            }
	        },

	        moveCleanedNodesToContainerElement: function(nodes) {
	            // Ensure it's a real array, as we're about to reparent the nodes and
	            // we don't want the underlying collection to change while we're doing that.
	            var nodesArray = ko.utils.makeArray(nodes);
	            var templateDocument = (nodesArray[0] && nodesArray[0].ownerDocument) || document;

	            var container = templateDocument.createElement('div');
	            for (var i = 0, j = nodesArray.length; i < j; i++) {
	                container.appendChild(ko.cleanNode(nodesArray[i]));
	            }
	            return container;
	        },

	        cloneNodes: function (nodesArray, shouldCleanNodes) {
	            for (var i = 0, j = nodesArray.length, newNodesArray = []; i < j; i++) {
	                var clonedNode = nodesArray[i].cloneNode(true);
	                newNodesArray.push(shouldCleanNodes ? ko.cleanNode(clonedNode) : clonedNode);
	            }
	            return newNodesArray;
	        },

	        setDomNodeChildren: function (domNode, childNodes) {
	            ko.utils.emptyDomNode(domNode);
	            if (childNodes) {
	                for (var i = 0, j = childNodes.length; i < j; i++)
	                    domNode.appendChild(childNodes[i]);
	            }
	        },

	        replaceDomNodes: function (nodeToReplaceOrNodeArray, newNodesArray) {
	            var nodesToReplaceArray = nodeToReplaceOrNodeArray.nodeType ? [nodeToReplaceOrNodeArray] : nodeToReplaceOrNodeArray;
	            if (nodesToReplaceArray.length > 0) {
	                var insertionPoint = nodesToReplaceArray[0];
	                var parent = insertionPoint.parentNode;
	                for (var i = 0, j = newNodesArray.length; i < j; i++)
	                    parent.insertBefore(newNodesArray[i], insertionPoint);
	                for (var i = 0, j = nodesToReplaceArray.length; i < j; i++) {
	                    ko.removeNode(nodesToReplaceArray[i]);
	                }
	            }
	        },

	        fixUpContinuousNodeArray: function(continuousNodeArray, parentNode) {
	            // Before acting on a set of nodes that were previously outputted by a template function, we have to reconcile
	            // them against what is in the DOM right now. It may be that some of the nodes have already been removed, or that
	            // new nodes might have been inserted in the middle, for example by a binding. Also, there may previously have been
	            // leading comment nodes (created by rewritten string-based templates) that have since been removed during binding.
	            // So, this function translates the old "map" output array into its best guess of the set of current DOM nodes.
	            //
	            // Rules:
	            //   [A] Any leading nodes that have been removed should be ignored
	            //       These most likely correspond to memoization nodes that were already removed during binding
	            //       See https://github.com/SteveSanderson/knockout/pull/440
	            //   [B] We want to output a continuous series of nodes. So, ignore any nodes that have already been removed,
	            //       and include any nodes that have been inserted among the previous collection

	            if (continuousNodeArray.length) {
	                // The parent node can be a virtual element; so get the real parent node
	                parentNode = (parentNode.nodeType === 8 && parentNode.parentNode) || parentNode;

	                // Rule [A]
	                while (continuousNodeArray.length && continuousNodeArray[0].parentNode !== parentNode)
	                    continuousNodeArray.splice(0, 1);

	                // Rule [B]
	                if (continuousNodeArray.length > 1) {
	                    var current = continuousNodeArray[0], last = continuousNodeArray[continuousNodeArray.length - 1];
	                    // Replace with the actual new continuous node set
	                    continuousNodeArray.length = 0;
	                    while (current !== last) {
	                        continuousNodeArray.push(current);
	                        current = current.nextSibling;
	                        if (!current) // Won't happen, except if the developer has manually removed some DOM elements (then we're in an undefined scenario)
	                            return;
	                    }
	                    continuousNodeArray.push(last);
	                }
	            }
	            return continuousNodeArray;
	        },

	        setOptionNodeSelectionState: function (optionNode, isSelected) {
	            // IE6 sometimes throws "unknown error" if you try to write to .selected directly, whereas Firefox struggles with setAttribute. Pick one based on browser.
	            if (ieVersion < 7)
	                optionNode.setAttribute("selected", isSelected);
	            else
	                optionNode.selected = isSelected;
	        },

	        stringTrim: function (string) {
	            return string === null || string === undefined ? '' :
	                string.trim ?
	                    string.trim() :
	                    string.toString().replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
	        },

	        stringStartsWith: function (string, startsWith) {
	            string = string || "";
	            if (startsWith.length > string.length)
	                return false;
	            return string.substring(0, startsWith.length) === startsWith;
	        },

	        domNodeIsContainedBy: function (node, containedByNode) {
	            if (node === containedByNode)
	                return true;
	            if (node.nodeType === 11)
	                return false; // Fixes issue #1162 - can't use node.contains for document fragments on IE8
	            if (containedByNode.contains)
	                return containedByNode.contains(node.nodeType === 3 ? node.parentNode : node);
	            if (containedByNode.compareDocumentPosition)
	                return (containedByNode.compareDocumentPosition(node) & 16) == 16;
	            while (node && node != containedByNode) {
	                node = node.parentNode;
	            }
	            return !!node;
	        },

	        domNodeIsAttachedToDocument: function (node) {
	            return ko.utils.domNodeIsContainedBy(node, node.ownerDocument.documentElement);
	        },

	        anyDomNodeIsAttachedToDocument: function(nodes) {
	            return !!ko.utils.arrayFirst(nodes, ko.utils.domNodeIsAttachedToDocument);
	        },

	        tagNameLower: function(element) {
	            // For HTML elements, tagName will always be upper case; for XHTML elements, it'll be lower case.
	            // Possible future optimization: If we know it's an element from an XHTML document (not HTML),
	            // we don't need to do the .toLowerCase() as it will always be lower case anyway.
	            return element && element.tagName && element.tagName.toLowerCase();
	        },

	        registerEventHandler: function (element, eventType, handler) {
	            var mustUseAttachEvent = ieVersion && eventsThatMustBeRegisteredUsingAttachEvent[eventType];
	            if (!mustUseAttachEvent && jQueryInstance) {
	                jQueryInstance(element)['bind'](eventType, handler);
	            } else if (!mustUseAttachEvent && typeof element.addEventListener == "function")
	                element.addEventListener(eventType, handler, false);
	            else if (typeof element.attachEvent != "undefined") {
	                var attachEventHandler = function (event) { handler.call(element, event); },
	                    attachEventName = "on" + eventType;
	                element.attachEvent(attachEventName, attachEventHandler);

	                // IE does not dispose attachEvent handlers automatically (unlike with addEventListener)
	                // so to avoid leaks, we have to remove them manually. See bug #856
	                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
	                    element.detachEvent(attachEventName, attachEventHandler);
	                });
	            } else
	                throw new Error("Browser doesn't support addEventListener or attachEvent");
	        },

	        triggerEvent: function (element, eventType) {
	            if (!(element && element.nodeType))
	                throw new Error("element must be a DOM node when calling triggerEvent");

	            // For click events on checkboxes and radio buttons, jQuery toggles the element checked state *after* the
	            // event handler runs instead of *before*. (This was fixed in 1.9 for checkboxes but not for radio buttons.)
	            // IE doesn't change the checked state when you trigger the click event using "fireEvent".
	            // In both cases, we'll use the click method instead.
	            var useClickWorkaround = isClickOnCheckableElement(element, eventType);

	            if (jQueryInstance && !useClickWorkaround) {
	                jQueryInstance(element)['trigger'](eventType);
	            } else if (typeof document.createEvent == "function") {
	                if (typeof element.dispatchEvent == "function") {
	                    var eventCategory = knownEventTypesByEventName[eventType] || "HTMLEvents";
	                    var event = document.createEvent(eventCategory);
	                    event.initEvent(eventType, true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, element);
	                    element.dispatchEvent(event);
	                }
	                else
	                    throw new Error("The supplied element doesn't support dispatchEvent");
	            } else if (useClickWorkaround && element.click) {
	                element.click();
	            } else if (typeof element.fireEvent != "undefined") {
	                element.fireEvent("on" + eventType);
	            } else {
	                throw new Error("Browser doesn't support triggering events");
	            }
	        },

	        unwrapObservable: function (value) {
	            return ko.isObservable(value) ? value() : value;
	        },

	        peekObservable: function (value) {
	            return ko.isObservable(value) ? value.peek() : value;
	        },

	        toggleDomNodeCssClass: toggleDomNodeCssClass,

	        setTextContent: function(element, textContent) {
	            var value = ko.utils.unwrapObservable(textContent);
	            if ((value === null) || (value === undefined))
	                value = "";

	            // We need there to be exactly one child: a text node.
	            // If there are no children, more than one, or if it's not a text node,
	            // we'll clear everything and create a single text node.
	            var innerTextNode = ko.virtualElements.firstChild(element);
	            if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
	                ko.virtualElements.setDomNodeChildren(element, [element.ownerDocument.createTextNode(value)]);
	            } else {
	                innerTextNode.data = value;
	            }

	            ko.utils.forceRefresh(element);
	        },

	        setElementName: function(element, name) {
	            element.name = name;

	            // Workaround IE 6/7 issue
	            // - https://github.com/SteveSanderson/knockout/issues/197
	            // - http://www.matts411.com/post/setting_the_name_attribute_in_ie_dom/
	            if (ieVersion <= 7) {
	                try {
	                    element.mergeAttributes(document.createElement("<input name='" + element.name + "'/>"), false);
	                }
	                catch(e) {} // For IE9 with doc mode "IE9 Standards" and browser mode "IE9 Compatibility View"
	            }
	        },

	        forceRefresh: function(node) {
	            // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
	            if (ieVersion >= 9) {
	                // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
	                var elem = node.nodeType == 1 ? node : node.parentNode;
	                if (elem.style)
	                    elem.style.zoom = elem.style.zoom;
	            }
	        },

	        ensureSelectElementIsRenderedCorrectly: function(selectElement) {
	            // Workaround for IE9 rendering bug - it doesn't reliably display all the text in dynamically-added select boxes unless you force it to re-render by updating the width.
	            // (See https://github.com/SteveSanderson/knockout/issues/312, http://stackoverflow.com/questions/5908494/select-only-shows-first-char-of-selected-option)
	            // Also fixes IE7 and IE8 bug that causes selects to be zero width if enclosed by 'if' or 'with'. (See issue #839)
	            if (ieVersion) {
	                var originalWidth = selectElement.style.width;
	                selectElement.style.width = 0;
	                selectElement.style.width = originalWidth;
	            }
	        },

	        range: function (min, max) {
	            min = ko.utils.unwrapObservable(min);
	            max = ko.utils.unwrapObservable(max);
	            var result = [];
	            for (var i = min; i <= max; i++)
	                result.push(i);
	            return result;
	        },

	        makeArray: function(arrayLikeObject) {
	            var result = [];
	            for (var i = 0, j = arrayLikeObject.length; i < j; i++) {
	                result.push(arrayLikeObject[i]);
	            };
	            return result;
	        },

	        isIe6 : isIe6,
	        isIe7 : isIe7,
	        ieVersion : ieVersion,

	        getFormFields: function(form, fieldName) {
	            var fields = ko.utils.makeArray(form.getElementsByTagName("input")).concat(ko.utils.makeArray(form.getElementsByTagName("textarea")));
	            var isMatchingField = (typeof fieldName == 'string')
	                ? function(field) { return field.name === fieldName }
	                : function(field) { return fieldName.test(field.name) }; // Treat fieldName as regex or object containing predicate
	            var matches = [];
	            for (var i = fields.length - 1; i >= 0; i--) {
	                if (isMatchingField(fields[i]))
	                    matches.push(fields[i]);
	            };
	            return matches;
	        },

	        parseJson: function (jsonString) {
	            if (typeof jsonString == "string") {
	                jsonString = ko.utils.stringTrim(jsonString);
	                if (jsonString) {
	                    if (JSON && JSON.parse) // Use native parsing where available
	                        return JSON.parse(jsonString);
	                    return (new Function("return " + jsonString))(); // Fallback on less safe parsing for older browsers
	                }
	            }
	            return null;
	        },

	        stringifyJson: function (data, replacer, space) {   // replacer and space are optional
	            if (!JSON || !JSON.stringify)
	                throw new Error("Cannot find JSON.stringify(). Some browsers (e.g., IE < 8) don't support it natively, but you can overcome this by adding a script reference to json2.js, downloadable from http://www.json.org/json2.js");
	            return JSON.stringify(ko.utils.unwrapObservable(data), replacer, space);
	        },

	        postJson: function (urlOrForm, data, options) {
	            options = options || {};
	            var params = options['params'] || {};
	            var includeFields = options['includeFields'] || this.fieldsIncludedWithJsonPost;
	            var url = urlOrForm;

	            // If we were given a form, use its 'action' URL and pick out any requested field values
	            if((typeof urlOrForm == 'object') && (ko.utils.tagNameLower(urlOrForm) === "form")) {
	                var originalForm = urlOrForm;
	                url = originalForm.action;
	                for (var i = includeFields.length - 1; i >= 0; i--) {
	                    var fields = ko.utils.getFormFields(originalForm, includeFields[i]);
	                    for (var j = fields.length - 1; j >= 0; j--)
	                        params[fields[j].name] = fields[j].value;
	                }
	            }

	            data = ko.utils.unwrapObservable(data);
	            var form = document.createElement("form");
	            form.style.display = "none";
	            form.action = url;
	            form.method = "post";
	            for (var key in data) {
	                // Since 'data' this is a model object, we include all properties including those inherited from its prototype
	                var input = document.createElement("input");
	                input.type = "hidden";
	                input.name = key;
	                input.value = ko.utils.stringifyJson(ko.utils.unwrapObservable(data[key]));
	                form.appendChild(input);
	            }
	            objectForEach(params, function(key, value) {
	                var input = document.createElement("input");
	                input.type = "hidden";
	                input.name = key;
	                input.value = value;
	                form.appendChild(input);
	            });
	            document.body.appendChild(form);
	            options['submitter'] ? options['submitter'](form) : form.submit();
	            setTimeout(function () { form.parentNode.removeChild(form); }, 0);
	        }
	    }
	}());

	ko.exportSymbol('utils', ko.utils);
	ko.exportSymbol('utils.arrayForEach', ko.utils.arrayForEach);
	ko.exportSymbol('utils.arrayFirst', ko.utils.arrayFirst);
	ko.exportSymbol('utils.arrayFilter', ko.utils.arrayFilter);
	ko.exportSymbol('utils.arrayGetDistinctValues', ko.utils.arrayGetDistinctValues);
	ko.exportSymbol('utils.arrayIndexOf', ko.utils.arrayIndexOf);
	ko.exportSymbol('utils.arrayMap', ko.utils.arrayMap);
	ko.exportSymbol('utils.arrayPushAll', ko.utils.arrayPushAll);
	ko.exportSymbol('utils.arrayRemoveItem', ko.utils.arrayRemoveItem);
	ko.exportSymbol('utils.extend', ko.utils.extend);
	ko.exportSymbol('utils.fieldsIncludedWithJsonPost', ko.utils.fieldsIncludedWithJsonPost);
	ko.exportSymbol('utils.getFormFields', ko.utils.getFormFields);
	ko.exportSymbol('utils.peekObservable', ko.utils.peekObservable);
	ko.exportSymbol('utils.postJson', ko.utils.postJson);
	ko.exportSymbol('utils.parseJson', ko.utils.parseJson);
	ko.exportSymbol('utils.registerEventHandler', ko.utils.registerEventHandler);
	ko.exportSymbol('utils.stringifyJson', ko.utils.stringifyJson);
	ko.exportSymbol('utils.range', ko.utils.range);
	ko.exportSymbol('utils.toggleDomNodeCssClass', ko.utils.toggleDomNodeCssClass);
	ko.exportSymbol('utils.triggerEvent', ko.utils.triggerEvent);
	ko.exportSymbol('utils.unwrapObservable', ko.utils.unwrapObservable);
	ko.exportSymbol('utils.objectForEach', ko.utils.objectForEach);
	ko.exportSymbol('utils.addOrRemoveItem', ko.utils.addOrRemoveItem);
	ko.exportSymbol('utils.setTextContent', ko.utils.setTextContent);
	ko.exportSymbol('unwrap', ko.utils.unwrapObservable); // Convenient shorthand, because this is used so commonly

	if (!Function.prototype['bind']) {
	    // Function.prototype.bind is a standard part of ECMAScript 5th Edition (December 2009, http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf)
	    // In case the browser doesn't implement it natively, provide a JavaScript implementation. This implementation is based on the one in prototype.js
	    Function.prototype['bind'] = function (object) {
	        var originalFunction = this;
	        if (arguments.length === 1) {
	            return function () {
	                return originalFunction.apply(object, arguments);
	            };
	        } else {
	            var partialArgs = Array.prototype.slice.call(arguments, 1);
	            return function () {
	                var args = partialArgs.slice(0);
	                args.push.apply(args, arguments);
	                return originalFunction.apply(object, args);
	            };
	        }
	    };
	}

	ko.utils.domData = new (function () {
	    var uniqueId = 0;
	    var dataStoreKeyExpandoPropertyName = "__ko__" + (new Date).getTime();
	    var dataStore = {};

	    function getAll(node, createIfNotFound) {
	        var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
	        var hasExistingDataStore = dataStoreKey && (dataStoreKey !== "null") && dataStore[dataStoreKey];
	        if (!hasExistingDataStore) {
	            if (!createIfNotFound)
	                return undefined;
	            dataStoreKey = node[dataStoreKeyExpandoPropertyName] = "ko" + uniqueId++;
	            dataStore[dataStoreKey] = {};
	        }
	        return dataStore[dataStoreKey];
	    }

	    return {
	        get: function (node, key) {
	            var allDataForNode = getAll(node, false);
	            return allDataForNode === undefined ? undefined : allDataForNode[key];
	        },
	        set: function (node, key, value) {
	            if (value === undefined) {
	                // Make sure we don't actually create a new domData key if we are actually deleting a value
	                if (getAll(node, false) === undefined)
	                    return;
	            }
	            var allDataForNode = getAll(node, true);
	            allDataForNode[key] = value;
	        },
	        clear: function (node) {
	            var dataStoreKey = node[dataStoreKeyExpandoPropertyName];
	            if (dataStoreKey) {
	                delete dataStore[dataStoreKey];
	                node[dataStoreKeyExpandoPropertyName] = null;
	                return true; // Exposing "did clean" flag purely so specs can infer whether things have been cleaned up as intended
	            }
	            return false;
	        },

	        nextKey: function () {
	            return (uniqueId++) + dataStoreKeyExpandoPropertyName;
	        }
	    };
	})();

	ko.exportSymbol('utils.domData', ko.utils.domData);
	ko.exportSymbol('utils.domData.clear', ko.utils.domData.clear); // Exporting only so specs can clear up after themselves fully

	ko.utils.domNodeDisposal = new (function () {
	    var domDataKey = ko.utils.domData.nextKey();
	    var cleanableNodeTypes = { 1: true, 8: true, 9: true };       // Element, Comment, Document
	    var cleanableNodeTypesWithDescendants = { 1: true, 9: true }; // Element, Document

	    function getDisposeCallbacksCollection(node, createIfNotFound) {
	        var allDisposeCallbacks = ko.utils.domData.get(node, domDataKey);
	        if ((allDisposeCallbacks === undefined) && createIfNotFound) {
	            allDisposeCallbacks = [];
	            ko.utils.domData.set(node, domDataKey, allDisposeCallbacks);
	        }
	        return allDisposeCallbacks;
	    }
	    function destroyCallbacksCollection(node) {
	        ko.utils.domData.set(node, domDataKey, undefined);
	    }

	    function cleanSingleNode(node) {
	        // Run all the dispose callbacks
	        var callbacks = getDisposeCallbacksCollection(node, false);
	        if (callbacks) {
	            callbacks = callbacks.slice(0); // Clone, as the array may be modified during iteration (typically, callbacks will remove themselves)
	            for (var i = 0; i < callbacks.length; i++)
	                callbacks[i](node);
	        }

	        // Erase the DOM data
	        ko.utils.domData.clear(node);

	        // Perform cleanup needed by external libraries (currently only jQuery, but can be extended)
	        ko.utils.domNodeDisposal["cleanExternalData"](node);

	        // Clear any immediate-child comment nodes, as these wouldn't have been found by
	        // node.getElementsByTagName("*") in cleanNode() (comment nodes aren't elements)
	        if (cleanableNodeTypesWithDescendants[node.nodeType])
	            cleanImmediateCommentTypeChildren(node);
	    }

	    function cleanImmediateCommentTypeChildren(nodeWithChildren) {
	        var child, nextChild = nodeWithChildren.firstChild;
	        while (child = nextChild) {
	            nextChild = child.nextSibling;
	            if (child.nodeType === 8)
	                cleanSingleNode(child);
	        }
	    }

	    return {
	        addDisposeCallback : function(node, callback) {
	            if (typeof callback != "function")
	                throw new Error("Callback must be a function");
	            getDisposeCallbacksCollection(node, true).push(callback);
	        },

	        removeDisposeCallback : function(node, callback) {
	            var callbacksCollection = getDisposeCallbacksCollection(node, false);
	            if (callbacksCollection) {
	                ko.utils.arrayRemoveItem(callbacksCollection, callback);
	                if (callbacksCollection.length == 0)
	                    destroyCallbacksCollection(node);
	            }
	        },

	        cleanNode : function(node) {
	            // First clean this node, where applicable
	            if (cleanableNodeTypes[node.nodeType]) {
	                cleanSingleNode(node);

	                // ... then its descendants, where applicable
	                if (cleanableNodeTypesWithDescendants[node.nodeType]) {
	                    // Clone the descendants list in case it changes during iteration
	                    var descendants = [];
	                    ko.utils.arrayPushAll(descendants, node.getElementsByTagName("*"));
	                    for (var i = 0, j = descendants.length; i < j; i++)
	                        cleanSingleNode(descendants[i]);
	                }
	            }
	            return node;
	        },

	        removeNode : function(node) {
	            ko.cleanNode(node);
	            if (node.parentNode)
	                node.parentNode.removeChild(node);
	        },

	        "cleanExternalData" : function (node) {
	            // Special support for jQuery here because it's so commonly used.
	            // Many jQuery plugins (including jquery.tmpl) store data using jQuery's equivalent of domData
	            // so notify it to tear down any resources associated with the node & descendants here.
	            if (jQueryInstance && (typeof jQueryInstance['cleanData'] == "function"))
	                jQueryInstance['cleanData']([node]);
	        }
	    };
	})();
	ko.cleanNode = ko.utils.domNodeDisposal.cleanNode; // Shorthand name for convenience
	ko.removeNode = ko.utils.domNodeDisposal.removeNode; // Shorthand name for convenience
	ko.exportSymbol('cleanNode', ko.cleanNode);
	ko.exportSymbol('removeNode', ko.removeNode);
	ko.exportSymbol('utils.domNodeDisposal', ko.utils.domNodeDisposal);
	ko.exportSymbol('utils.domNodeDisposal.addDisposeCallback', ko.utils.domNodeDisposal.addDisposeCallback);
	ko.exportSymbol('utils.domNodeDisposal.removeDisposeCallback', ko.utils.domNodeDisposal.removeDisposeCallback);
	(function () {
	    var leadingCommentRegex = /^(\s*)<!--(.*?)-->/;

	    function simpleHtmlParse(html, documentContext) {
	        documentContext || (documentContext = document);
	        var windowContext = documentContext['parentWindow'] || documentContext['defaultView'] || window;

	        // Based on jQuery's "clean" function, but only accounting for table-related elements.
	        // If you have referenced jQuery, this won't be used anyway - KO will use jQuery's "clean" function directly

	        // Note that there's still an issue in IE < 9 whereby it will discard comment nodes that are the first child of
	        // a descendant node. For example: "<div><!-- mycomment -->abc</div>" will get parsed as "<div>abc</div>"
	        // This won't affect anyone who has referenced jQuery, and there's always the workaround of inserting a dummy node
	        // (possibly a text node) in front of the comment. So, KO does not attempt to workaround this IE issue automatically at present.

	        // Trim whitespace, otherwise indexOf won't work as expected
	        var tags = ko.utils.stringTrim(html).toLowerCase(), div = documentContext.createElement("div");

	        // Finds the first match from the left column, and returns the corresponding "wrap" data from the right column
	        var wrap = tags.match(/^<(thead|tbody|tfoot)/)              && [1, "<table>", "</table>"] ||
	                   !tags.indexOf("<tr")                             && [2, "<table><tbody>", "</tbody></table>"] ||
	                   (!tags.indexOf("<td") || !tags.indexOf("<th"))   && [3, "<table><tbody><tr>", "</tr></tbody></table>"] ||
	                   /* anything else */                                 [0, "", ""];

	        // Go to html and back, then peel off extra wrappers
	        // Note that we always prefix with some dummy text, because otherwise, IE<9 will strip out leading comment nodes in descendants. Total madness.
	        var markup = "ignored<div>" + wrap[1] + html + wrap[2] + "</div>";
	        if (typeof windowContext['innerShiv'] == "function") {
	            div.appendChild(windowContext['innerShiv'](markup));
	        } else {
	            div.innerHTML = markup;
	        }

	        // Move to the right depth
	        while (wrap[0]--)
	            div = div.lastChild;

	        return ko.utils.makeArray(div.lastChild.childNodes);
	    }

	    function jQueryHtmlParse(html, documentContext) {
	        // jQuery's "parseHTML" function was introduced in jQuery 1.8.0 and is a documented public API.
	        if (jQueryInstance['parseHTML']) {
	            return jQueryInstance['parseHTML'](html, documentContext) || []; // Ensure we always return an array and never null
	        } else {
	            // For jQuery < 1.8.0, we fall back on the undocumented internal "clean" function.
	            var elems = jQueryInstance['clean']([html], documentContext);

	            // As of jQuery 1.7.1, jQuery parses the HTML by appending it to some dummy parent nodes held in an in-memory document fragment.
	            // Unfortunately, it never clears the dummy parent nodes from the document fragment, so it leaks memory over time.
	            // Fix this by finding the top-most dummy parent element, and detaching it from its owner fragment.
	            if (elems && elems[0]) {
	                // Find the top-most parent element that's a direct child of a document fragment
	                var elem = elems[0];
	                while (elem.parentNode && elem.parentNode.nodeType !== 11 /* i.e., DocumentFragment */)
	                    elem = elem.parentNode;
	                // ... then detach it
	                if (elem.parentNode)
	                    elem.parentNode.removeChild(elem);
	            }

	            return elems;
	        }
	    }

	    ko.utils.parseHtmlFragment = function(html, documentContext) {
	        return jQueryInstance ? jQueryHtmlParse(html, documentContext)   // As below, benefit from jQuery's optimisations where possible
	                              : simpleHtmlParse(html, documentContext);  // ... otherwise, this simple logic will do in most common cases.
	    };

	    ko.utils.setHtml = function(node, html) {
	        ko.utils.emptyDomNode(node);

	        // There's no legitimate reason to display a stringified observable without unwrapping it, so we'll unwrap it
	        html = ko.utils.unwrapObservable(html);

	        if ((html !== null) && (html !== undefined)) {
	            if (typeof html != 'string')
	                html = html.toString();

	            // jQuery contains a lot of sophisticated code to parse arbitrary HTML fragments,
	            // for example <tr> elements which are not normally allowed to exist on their own.
	            // If you've referenced jQuery we'll use that rather than duplicating its code.
	            if (jQueryInstance) {
	                jQueryInstance(node)['html'](html);
	            } else {
	                // ... otherwise, use KO's own parsing logic.
	                var parsedNodes = ko.utils.parseHtmlFragment(html, node.ownerDocument);
	                for (var i = 0; i < parsedNodes.length; i++)
	                    node.appendChild(parsedNodes[i]);
	            }
	        }
	    };
	})();

	ko.exportSymbol('utils.parseHtmlFragment', ko.utils.parseHtmlFragment);
	ko.exportSymbol('utils.setHtml', ko.utils.setHtml);

	ko.memoization = (function () {
	    var memos = {};

	    function randomMax8HexChars() {
	        return (((1 + Math.random()) * 0x100000000) | 0).toString(16).substring(1);
	    }
	    function generateRandomId() {
	        return randomMax8HexChars() + randomMax8HexChars();
	    }
	    function findMemoNodes(rootNode, appendToArray) {
	        if (!rootNode)
	            return;
	        if (rootNode.nodeType == 8) {
	            var memoId = ko.memoization.parseMemoText(rootNode.nodeValue);
	            if (memoId != null)
	                appendToArray.push({ domNode: rootNode, memoId: memoId });
	        } else if (rootNode.nodeType == 1) {
	            for (var i = 0, childNodes = rootNode.childNodes, j = childNodes.length; i < j; i++)
	                findMemoNodes(childNodes[i], appendToArray);
	        }
	    }

	    return {
	        memoize: function (callback) {
	            if (typeof callback != "function")
	                throw new Error("You can only pass a function to ko.memoization.memoize()");
	            var memoId = generateRandomId();
	            memos[memoId] = callback;
	            return "<!--[ko_memo:" + memoId + "]-->";
	        },

	        unmemoize: function (memoId, callbackParams) {
	            var callback = memos[memoId];
	            if (callback === undefined)
	                throw new Error("Couldn't find any memo with ID " + memoId + ". Perhaps it's already been unmemoized.");
	            try {
	                callback.apply(null, callbackParams || []);
	                return true;
	            }
	            finally { delete memos[memoId]; }
	        },

	        unmemoizeDomNodeAndDescendants: function (domNode, extraCallbackParamsArray) {
	            var memos = [];
	            findMemoNodes(domNode, memos);
	            for (var i = 0, j = memos.length; i < j; i++) {
	                var node = memos[i].domNode;
	                var combinedParams = [node];
	                if (extraCallbackParamsArray)
	                    ko.utils.arrayPushAll(combinedParams, extraCallbackParamsArray);
	                ko.memoization.unmemoize(memos[i].memoId, combinedParams);
	                node.nodeValue = ""; // Neuter this node so we don't try to unmemoize it again
	                if (node.parentNode)
	                    node.parentNode.removeChild(node); // If possible, erase it totally (not always possible - someone else might just hold a reference to it then call unmemoizeDomNodeAndDescendants again)
	            }
	        },

	        parseMemoText: function (memoText) {
	            var match = memoText.match(/^\[ko_memo\:(.*?)\]$/);
	            return match ? match[1] : null;
	        }
	    };
	})();

	ko.exportSymbol('memoization', ko.memoization);
	ko.exportSymbol('memoization.memoize', ko.memoization.memoize);
	ko.exportSymbol('memoization.unmemoize', ko.memoization.unmemoize);
	ko.exportSymbol('memoization.parseMemoText', ko.memoization.parseMemoText);
	ko.exportSymbol('memoization.unmemoizeDomNodeAndDescendants', ko.memoization.unmemoizeDomNodeAndDescendants);
	ko.extenders = {
	    'throttle': function(target, timeout) {
	        // Throttling means two things:

	        // (1) For dependent observables, we throttle *evaluations* so that, no matter how fast its dependencies
	        //     notify updates, the target doesn't re-evaluate (and hence doesn't notify) faster than a certain rate
	        target['throttleEvaluation'] = timeout;

	        // (2) For writable targets (observables, or writable dependent observables), we throttle *writes*
	        //     so the target cannot change value synchronously or faster than a certain rate
	        var writeTimeoutInstance = null;
	        return ko.dependentObservable({
	            'read': target,
	            'write': function(value) {
	                clearTimeout(writeTimeoutInstance);
	                writeTimeoutInstance = setTimeout(function() {
	                    target(value);
	                }, timeout);
	            }
	        });
	    },

	    'rateLimit': function(target, options) {
	        var timeout, method, limitFunction;

	        if (typeof options == 'number') {
	            timeout = options;
	        } else {
	            timeout = options['timeout'];
	            method = options['method'];
	        }

	        limitFunction = method == 'notifyWhenChangesStop' ?  debounce : throttle;
	        target.limit(function(callback) {
	            return limitFunction(callback, timeout);
	        });
	    },

	    'notify': function(target, notifyWhen) {
	        target["equalityComparer"] = notifyWhen == "always" ?
	            null :  // null equalityComparer means to always notify
	            valuesArePrimitiveAndEqual;
	    }
	};

	var primitiveTypes = { 'undefined':1, 'boolean':1, 'number':1, 'string':1 };
	function valuesArePrimitiveAndEqual(a, b) {
	    var oldValueIsPrimitive = (a === null) || (typeof(a) in primitiveTypes);
	    return oldValueIsPrimitive ? (a === b) : false;
	}

	function throttle(callback, timeout) {
	    var timeoutInstance;
	    return function () {
	        if (!timeoutInstance) {
	            timeoutInstance = setTimeout(function() {
	                timeoutInstance = undefined;
	                callback();
	            }, timeout);
	        }
	    };
	}

	function debounce(callback, timeout) {
	    var timeoutInstance;
	    return function () {
	        clearTimeout(timeoutInstance);
	        timeoutInstance = setTimeout(callback, timeout);
	    };
	}

	function applyExtenders(requestedExtenders) {
	    var target = this;
	    if (requestedExtenders) {
	        ko.utils.objectForEach(requestedExtenders, function(key, value) {
	            var extenderHandler = ko.extenders[key];
	            if (typeof extenderHandler == 'function') {
	                target = extenderHandler(target, value) || target;
	            }
	        });
	    }
	    return target;
	}

	ko.exportSymbol('extenders', ko.extenders);

	ko.subscription = function (target, callback, disposeCallback) {
	    this._target = target;
	    this.callback = callback;
	    this.disposeCallback = disposeCallback;
	    this.isDisposed = false;
	    ko.exportProperty(this, 'dispose', this.dispose);
	};
	ko.subscription.prototype.dispose = function () {
	    this.isDisposed = true;
	    this.disposeCallback();
	};

	ko.subscribable = function () {
	    ko.utils.setPrototypeOfOrExtend(this, ko.subscribable['fn']);
	    this._subscriptions = {};
	    this._versionNumber = 1;
	}

	var defaultEvent = "change";

	var ko_subscribable_fn = {
	    subscribe: function (callback, callbackTarget, event) {
	        var self = this;

	        event = event || defaultEvent;
	        var boundCallback = callbackTarget ? callback.bind(callbackTarget) : callback;

	        var subscription = new ko.subscription(self, boundCallback, function () {
	            ko.utils.arrayRemoveItem(self._subscriptions[event], subscription);
	            if (self.afterSubscriptionRemove)
	                self.afterSubscriptionRemove(event);
	        });

	        if (self.beforeSubscriptionAdd)
	            self.beforeSubscriptionAdd(event);

	        if (!self._subscriptions[event])
	            self._subscriptions[event] = [];
	        self._subscriptions[event].push(subscription);

	        return subscription;
	    },

	    "notifySubscribers": function (valueToNotify, event) {
	        event = event || defaultEvent;
	        if (event === defaultEvent) {
	            this.updateVersion();
	        }
	        if (this.hasSubscriptionsForEvent(event)) {
	            try {
	                ko.dependencyDetection.begin(); // Begin suppressing dependency detection (by setting the top frame to undefined)
	                for (var a = this._subscriptions[event].slice(0), i = 0, subscription; subscription = a[i]; ++i) {
	                    // In case a subscription was disposed during the arrayForEach cycle, check
	                    // for isDisposed on each subscription before invoking its callback
	                    if (!subscription.isDisposed)
	                        subscription.callback(valueToNotify);
	                }
	            } finally {
	                ko.dependencyDetection.end(); // End suppressing dependency detection
	            }
	        }
	    },

	    getVersion: function () {
	        return this._versionNumber;
	    },

	    hasChanged: function (versionToCheck) {
	        return this.getVersion() !== versionToCheck;
	    },

	    updateVersion: function () {
	        ++this._versionNumber;
	    },

	    limit: function(limitFunction) {
	        var self = this, selfIsObservable = ko.isObservable(self),
	            isPending, previousValue, pendingValue, beforeChange = 'beforeChange';

	        if (!self._origNotifySubscribers) {
	            self._origNotifySubscribers = self["notifySubscribers"];
	            self["notifySubscribers"] = function(value, event) {
	                if (!event || event === defaultEvent) {
	                    self._rateLimitedChange(value);
	                } else if (event === beforeChange) {
	                    self._rateLimitedBeforeChange(value);
	                } else {
	                    self._origNotifySubscribers(value, event);
	                }
	            };
	        }

	        var finish = limitFunction(function() {
	            // If an observable provided a reference to itself, access it to get the latest value.
	            // This allows computed observables to delay calculating their value until needed.
	            if (selfIsObservable && pendingValue === self) {
	                pendingValue = self();
	            }
	            isPending = false;
	            if (self.isDifferent(previousValue, pendingValue)) {
	                self._origNotifySubscribers(previousValue = pendingValue);
	            }
	        });

	        self._rateLimitedChange = function(value) {
	            isPending = true;
	            pendingValue = value;
	            finish();
	        };
	        self._rateLimitedBeforeChange = function(value) {
	            if (!isPending) {
	                previousValue = value;
	                self._origNotifySubscribers(value, beforeChange);
	            }
	        };
	    },

	    hasSubscriptionsForEvent: function(event) {
	        return this._subscriptions[event] && this._subscriptions[event].length;
	    },

	    getSubscriptionsCount: function (event) {
	        if (event) {
	            return this._subscriptions[event] && this._subscriptions[event].length || 0;
	        } else {
	            var total = 0;
	            ko.utils.objectForEach(this._subscriptions, function(eventName, subscriptions) {
	                total += subscriptions.length;
	            });
	            return total;
	        }
	    },

	    isDifferent: function(oldValue, newValue) {
	        return !this['equalityComparer'] || !this['equalityComparer'](oldValue, newValue);
	    },

	    extend: applyExtenders
	};

	ko.exportProperty(ko_subscribable_fn, 'subscribe', ko_subscribable_fn.subscribe);
	ko.exportProperty(ko_subscribable_fn, 'extend', ko_subscribable_fn.extend);
	ko.exportProperty(ko_subscribable_fn, 'getSubscriptionsCount', ko_subscribable_fn.getSubscriptionsCount);

	// For browsers that support proto assignment, we overwrite the prototype of each
	// observable instance. Since observables are functions, we need Function.prototype
	// to still be in the prototype chain.
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(ko_subscribable_fn, Function.prototype);
	}

	ko.subscribable['fn'] = ko_subscribable_fn;


	ko.isSubscribable = function (instance) {
	    return instance != null && typeof instance.subscribe == "function" && typeof instance["notifySubscribers"] == "function";
	};

	ko.exportSymbol('subscribable', ko.subscribable);
	ko.exportSymbol('isSubscribable', ko.isSubscribable);

	ko.computedContext = ko.dependencyDetection = (function () {
	    var outerFrames = [],
	        currentFrame,
	        lastId = 0;

	    // Return a unique ID that can be assigned to an observable for dependency tracking.
	    // Theoretically, you could eventually overflow the number storage size, resulting
	    // in duplicate IDs. But in JavaScript, the largest exact integral value is 2^53
	    // or 9,007,199,254,740,992. If you created 1,000,000 IDs per second, it would
	    // take over 285 years to reach that number.
	    // Reference http://blog.vjeux.com/2010/javascript/javascript-max_int-number-limits.html
	    function getId() {
	        return ++lastId;
	    }

	    function begin(options) {
	        outerFrames.push(currentFrame);
	        currentFrame = options;
	    }

	    function end() {
	        currentFrame = outerFrames.pop();
	    }

	    return {
	        begin: begin,

	        end: end,

	        registerDependency: function (subscribable) {
	            if (currentFrame) {
	                if (!ko.isSubscribable(subscribable))
	                    throw new Error("Only subscribable things can act as dependencies");
	                currentFrame.callback(subscribable, subscribable._id || (subscribable._id = getId()));
	            }
	        },

	        ignore: function (callback, callbackTarget, callbackArgs) {
	            try {
	                begin();
	                return callback.apply(callbackTarget, callbackArgs || []);
	            } finally {
	                end();
	            }
	        },

	        getDependenciesCount: function () {
	            if (currentFrame)
	                return currentFrame.computed.getDependenciesCount();
	        },

	        isInitial: function() {
	            if (currentFrame)
	                return currentFrame.isInitial;
	        }
	    };
	})();

	ko.exportSymbol('computedContext', ko.computedContext);
	ko.exportSymbol('computedContext.getDependenciesCount', ko.computedContext.getDependenciesCount);
	ko.exportSymbol('computedContext.isInitial', ko.computedContext.isInitial);
	ko.exportSymbol('computedContext.isSleeping', ko.computedContext.isSleeping);

	ko.exportSymbol('ignoreDependencies', ko.ignoreDependencies = ko.dependencyDetection.ignore);
	ko.observable = function (initialValue) {
	    var _latestValue = initialValue;

	    function observable() {
	        if (arguments.length > 0) {
	            // Write

	            // Ignore writes if the value hasn't changed
	            if (observable.isDifferent(_latestValue, arguments[0])) {
	                observable.valueWillMutate();
	                _latestValue = arguments[0];
	                if (DEBUG) observable._latestValue = _latestValue;
	                observable.valueHasMutated();
	            }
	            return this; // Permits chained assignments
	        }
	        else {
	            // Read
	            ko.dependencyDetection.registerDependency(observable); // The caller only needs to be notified of changes if they did a "read" operation
	            return _latestValue;
	        }
	    }
	    ko.subscribable.call(observable);
	    ko.utils.setPrototypeOfOrExtend(observable, ko.observable['fn']);

	    if (DEBUG) observable._latestValue = _latestValue;
	    observable.peek = function() { return _latestValue };
	    observable.valueHasMutated = function () { observable["notifySubscribers"](_latestValue); }
	    observable.valueWillMutate = function () { observable["notifySubscribers"](_latestValue, "beforeChange"); }

	    ko.exportProperty(observable, 'peek', observable.peek);
	    ko.exportProperty(observable, "valueHasMutated", observable.valueHasMutated);
	    ko.exportProperty(observable, "valueWillMutate", observable.valueWillMutate);

	    return observable;
	}

	ko.observable['fn'] = {
	    "equalityComparer": valuesArePrimitiveAndEqual
	};

	var protoProperty = ko.observable.protoProperty = "__ko_proto__";
	ko.observable['fn'][protoProperty] = ko.observable;

	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.observable constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(ko.observable['fn'], ko.subscribable['fn']);
	}

	ko.hasPrototype = function(instance, prototype) {
	    if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
	    if (instance[protoProperty] === prototype) return true;
	    return ko.hasPrototype(instance[protoProperty], prototype); // Walk the prototype chain
	};

	ko.isObservable = function (instance) {
	    return ko.hasPrototype(instance, ko.observable);
	}
	ko.isWriteableObservable = function (instance) {
	    // Observable
	    if ((typeof instance == "function") && instance[protoProperty] === ko.observable)
	        return true;
	    // Writeable dependent observable
	    if ((typeof instance == "function") && (instance[protoProperty] === ko.dependentObservable) && (instance.hasWriteFunction))
	        return true;
	    // Anything else
	    return false;
	}


	ko.exportSymbol('observable', ko.observable);
	ko.exportSymbol('isObservable', ko.isObservable);
	ko.exportSymbol('isWriteableObservable', ko.isWriteableObservable);
	ko.exportSymbol('isWritableObservable', ko.isWriteableObservable);
	ko.observableArray = function (initialValues) {
	    initialValues = initialValues || [];

	    if (typeof initialValues != 'object' || !('length' in initialValues))
	        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

	    var result = ko.observable(initialValues);
	    ko.utils.setPrototypeOfOrExtend(result, ko.observableArray['fn']);
	    return result.extend({'trackArrayChanges':true});
	};

	ko.observableArray['fn'] = {
	    'remove': function (valueOrPredicate) {
	        var underlyingArray = this.peek();
	        var removedValues = [];
	        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
	        for (var i = 0; i < underlyingArray.length; i++) {
	            var value = underlyingArray[i];
	            if (predicate(value)) {
	                if (removedValues.length === 0) {
	                    this.valueWillMutate();
	                }
	                removedValues.push(value);
	                underlyingArray.splice(i, 1);
	                i--;
	            }
	        }
	        if (removedValues.length) {
	            this.valueHasMutated();
	        }
	        return removedValues;
	    },

	    'removeAll': function (arrayOfValues) {
	        // If you passed zero args, we remove everything
	        if (arrayOfValues === undefined) {
	            var underlyingArray = this.peek();
	            var allValues = underlyingArray.slice(0);
	            this.valueWillMutate();
	            underlyingArray.splice(0, underlyingArray.length);
	            this.valueHasMutated();
	            return allValues;
	        }
	        // If you passed an arg, we interpret it as an array of entries to remove
	        if (!arrayOfValues)
	            return [];
	        return this['remove'](function (value) {
	            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
	        });
	    },

	    'destroy': function (valueOrPredicate) {
	        var underlyingArray = this.peek();
	        var predicate = typeof valueOrPredicate == "function" && !ko.isObservable(valueOrPredicate) ? valueOrPredicate : function (value) { return value === valueOrPredicate; };
	        this.valueWillMutate();
	        for (var i = underlyingArray.length - 1; i >= 0; i--) {
	            var value = underlyingArray[i];
	            if (predicate(value))
	                underlyingArray[i]["_destroy"] = true;
	        }
	        this.valueHasMutated();
	    },

	    'destroyAll': function (arrayOfValues) {
	        // If you passed zero args, we destroy everything
	        if (arrayOfValues === undefined)
	            return this['destroy'](function() { return true });

	        // If you passed an arg, we interpret it as an array of entries to destroy
	        if (!arrayOfValues)
	            return [];
	        return this['destroy'](function (value) {
	            return ko.utils.arrayIndexOf(arrayOfValues, value) >= 0;
	        });
	    },

	    'indexOf': function (item) {
	        var underlyingArray = this();
	        return ko.utils.arrayIndexOf(underlyingArray, item);
	    },

	    'replace': function(oldItem, newItem) {
	        var index = this['indexOf'](oldItem);
	        if (index >= 0) {
	            this.valueWillMutate();
	            this.peek()[index] = newItem;
	            this.valueHasMutated();
	        }
	    }
	};

	// Populate ko.observableArray.fn with read/write functions from native arrays
	// Important: Do not add any additional functions here that may reasonably be used to *read* data from the array
	// because we'll eval them without causing subscriptions, so ko.computed output could end up getting stale
	ko.utils.arrayForEach(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (methodName) {
	    ko.observableArray['fn'][methodName] = function () {
	        // Use "peek" to avoid creating a subscription in any computed that we're executing in the context of
	        // (for consistency with mutating regular observables)
	        var underlyingArray = this.peek();
	        this.valueWillMutate();
	        this.cacheDiffForKnownOperation(underlyingArray, methodName, arguments);
	        var methodCallResult = underlyingArray[methodName].apply(underlyingArray, arguments);
	        this.valueHasMutated();
	        return methodCallResult;
	    };
	});

	// Populate ko.observableArray.fn with read-only functions from native arrays
	ko.utils.arrayForEach(["slice"], function (methodName) {
	    ko.observableArray['fn'][methodName] = function () {
	        var underlyingArray = this();
	        return underlyingArray[methodName].apply(underlyingArray, arguments);
	    };
	});

	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.observableArray constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(ko.observableArray['fn'], ko.observable['fn']);
	}

	ko.exportSymbol('observableArray', ko.observableArray);
	var arrayChangeEventName = 'arrayChange';
	ko.extenders['trackArrayChanges'] = function(target) {
	    // Only modify the target observable once
	    if (target.cacheDiffForKnownOperation) {
	        return;
	    }
	    var trackingChanges = false,
	        cachedDiff = null,
	        arrayChangeSubscription,
	        pendingNotifications = 0,
	        underlyingBeforeSubscriptionAddFunction = target.beforeSubscriptionAdd,
	        underlyingAfterSubscriptionRemoveFunction = target.afterSubscriptionRemove;

	    // Watch "subscribe" calls, and for array change events, ensure change tracking is enabled
	    target.beforeSubscriptionAdd = function (event) {
	        if (underlyingBeforeSubscriptionAddFunction)
	            underlyingBeforeSubscriptionAddFunction.call(target, event);
	        if (event === arrayChangeEventName) {
	            trackChanges();
	        }
	    };
	    // Watch "dispose" calls, and for array change events, ensure change tracking is disabled when all are disposed
	    target.afterSubscriptionRemove = function (event) {
	        if (underlyingAfterSubscriptionRemoveFunction)
	            underlyingAfterSubscriptionRemoveFunction.call(target, event);
	        if (event === arrayChangeEventName && !target.hasSubscriptionsForEvent(arrayChangeEventName)) {
	            arrayChangeSubscription.dispose();
	            trackingChanges = false;
	        }
	    };

	    function trackChanges() {
	        // Calling 'trackChanges' multiple times is the same as calling it once
	        if (trackingChanges) {
	            return;
	        }

	        trackingChanges = true;

	        // Intercept "notifySubscribers" to track how many times it was called.
	        var underlyingNotifySubscribersFunction = target['notifySubscribers'];
	        target['notifySubscribers'] = function(valueToNotify, event) {
	            if (!event || event === defaultEvent) {
	                ++pendingNotifications;
	            }
	            return underlyingNotifySubscribersFunction.apply(this, arguments);
	        };

	        // Each time the array changes value, capture a clone so that on the next
	        // change it's possible to produce a diff
	        var previousContents = [].concat(target.peek() || []);
	        cachedDiff = null;
	        arrayChangeSubscription = target.subscribe(function(currentContents) {
	            // Make a copy of the current contents and ensure it's an array
	            currentContents = [].concat(currentContents || []);

	            // Compute the diff and issue notifications, but only if someone is listening
	            if (target.hasSubscriptionsForEvent(arrayChangeEventName)) {
	                var changes = getChanges(previousContents, currentContents);
	            }

	            // Eliminate references to the old, removed items, so they can be GCed
	            previousContents = currentContents;
	            cachedDiff = null;
	            pendingNotifications = 0;

	            if (changes && changes.length) {
	                target['notifySubscribers'](changes, arrayChangeEventName);
	            }
	        });
	    }

	    function getChanges(previousContents, currentContents) {
	        // We try to re-use cached diffs.
	        // The scenarios where pendingNotifications > 1 are when using rate-limiting or the Deferred Updates
	        // plugin, which without this check would not be compatible with arrayChange notifications. Normally,
	        // notifications are issued immediately so we wouldn't be queueing up more than one.
	        if (!cachedDiff || pendingNotifications > 1) {
	            cachedDiff = ko.utils.compareArrays(previousContents, currentContents, { 'sparse': true });
	        }

	        return cachedDiff;
	    }

	    target.cacheDiffForKnownOperation = function(rawArray, operationName, args) {
	        // Only run if we're currently tracking changes for this observable array
	        // and there aren't any pending deferred notifications.
	        if (!trackingChanges || pendingNotifications) {
	            return;
	        }
	        var diff = [],
	            arrayLength = rawArray.length,
	            argsLength = args.length,
	            offset = 0;

	        function pushDiff(status, value, index) {
	            return diff[diff.length] = { 'status': status, 'value': value, 'index': index };
	        }
	        switch (operationName) {
	            case 'push':
	                offset = arrayLength;
	            case 'unshift':
	                for (var index = 0; index < argsLength; index++) {
	                    pushDiff('added', args[index], offset + index);
	                }
	                break;

	            case 'pop':
	                offset = arrayLength - 1;
	            case 'shift':
	                if (arrayLength) {
	                    pushDiff('deleted', rawArray[offset], offset);
	                }
	                break;

	            case 'splice':
	                // Negative start index means 'from end of array'. After that we clamp to [0...arrayLength].
	                // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
	                var startIndex = Math.min(Math.max(0, args[0] < 0 ? arrayLength + args[0] : args[0]), arrayLength),
	                    endDeleteIndex = argsLength === 1 ? arrayLength : Math.min(startIndex + (args[1] || 0), arrayLength),
	                    endAddIndex = startIndex + argsLength - 2,
	                    endIndex = Math.max(endDeleteIndex, endAddIndex),
	                    additions = [], deletions = [];
	                for (var index = startIndex, argsIndex = 2; index < endIndex; ++index, ++argsIndex) {
	                    if (index < endDeleteIndex)
	                        deletions.push(pushDiff('deleted', rawArray[index], index));
	                    if (index < endAddIndex)
	                        additions.push(pushDiff('added', args[argsIndex], index));
	                }
	                ko.utils.findMovesInArrayComparison(deletions, additions);
	                break;

	            default:
	                return;
	        }
	        cachedDiff = diff;
	    };
	};
	ko.computed = ko.dependentObservable = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget, options) {
	    var _latestValue,
	        _needsEvaluation = true,
	        _isBeingEvaluated = false,
	        _suppressDisposalUntilDisposeWhenReturnsFalse = false,
	        _isDisposed = false,
	        readFunction = evaluatorFunctionOrOptions,
	        pure = false,
	        isSleeping = false;

	    if (readFunction && typeof readFunction == "object") {
	        // Single-parameter syntax - everything is on this "options" param
	        options = readFunction;
	        readFunction = options["read"];
	    } else {
	        // Multi-parameter syntax - construct the options according to the params passed
	        options = options || {};
	        if (!readFunction)
	            readFunction = options["read"];
	    }
	    if (typeof readFunction != "function")
	        throw new Error("Pass a function that returns the value of the ko.computed");

	    function addDependencyTracking(id, target, trackingObj) {
	        if (pure && target === dependentObservable) {
	            throw Error("A 'pure' computed must not be called recursively");
	        }

	        dependencyTracking[id] = trackingObj;
	        trackingObj._order = _dependenciesCount++;
	        trackingObj._version = target.getVersion();
	    }

	    function haveDependenciesChanged() {
	        var id, dependency;
	        for (id in dependencyTracking) {
	            if (dependencyTracking.hasOwnProperty(id)) {
	                dependency = dependencyTracking[id];
	                if (dependency._target.hasChanged(dependency._version)) {
	                    return true;
	                }
	            }
	        }
	    }

	    function disposeComputed() {
	        if (!isSleeping && dependencyTracking) {
	            ko.utils.objectForEach(dependencyTracking, function (id, dependency) {
	                if (dependency.dispose)
	                    dependency.dispose();
	            });
	        }
	        dependencyTracking = null;
	        _dependenciesCount = 0;
	        _isDisposed = true;
	        _needsEvaluation = false;
	        isSleeping = false;
	    }

	    function evaluatePossiblyAsync() {
	        var throttleEvaluationTimeout = dependentObservable['throttleEvaluation'];
	        if (throttleEvaluationTimeout && throttleEvaluationTimeout >= 0) {
	            clearTimeout(evaluationTimeoutInstance);
	            evaluationTimeoutInstance = setTimeout(function () {
	                evaluateImmediate(true /*notifyChange*/);
	            }, throttleEvaluationTimeout);
	        } else if (dependentObservable._evalRateLimited) {
	            dependentObservable._evalRateLimited();
	        } else {
	            evaluateImmediate(true /*notifyChange*/);
	        }
	    }

	    function evaluateImmediate(notifyChange) {
	        if (_isBeingEvaluated) {
	            // If the evaluation of a ko.computed causes side effects, it's possible that it will trigger its own re-evaluation.
	            // This is not desirable (it's hard for a developer to realise a chain of dependencies might cause this, and they almost
	            // certainly didn't intend infinite re-evaluations). So, for predictability, we simply prevent ko.computeds from causing
	            // their own re-evaluation. Further discussion at https://github.com/SteveSanderson/knockout/pull/387
	            return;
	        }

	        // Do not evaluate (and possibly capture new dependencies) if disposed
	        if (_isDisposed) {
	            return;
	        }

	        if (disposeWhen && disposeWhen()) {
	            // See comment below about _suppressDisposalUntilDisposeWhenReturnsFalse
	            if (!_suppressDisposalUntilDisposeWhenReturnsFalse) {
	                dispose();
	                return;
	            }
	        } else {
	            // It just did return false, so we can stop suppressing now
	            _suppressDisposalUntilDisposeWhenReturnsFalse = false;
	        }

	        _isBeingEvaluated = true;

	        try {
	            // Initially, we assume that none of the subscriptions are still being used (i.e., all are candidates for disposal).
	            // Then, during evaluation, we cross off any that are in fact still being used.
	            var disposalCandidates = dependencyTracking,
	                disposalCount = _dependenciesCount,
	                isInitial = pure ? undefined : !_dependenciesCount;   // If we're evaluating when there are no previous dependencies, it must be the first time

	            ko.dependencyDetection.begin({
	                callback: function(subscribable, id) {
	                    if (!_isDisposed) {
	                        if (disposalCount && disposalCandidates[id]) {
	                            // Don't want to dispose this subscription, as it's still being used
	                            addDependencyTracking(id, subscribable, disposalCandidates[id]);
	                            delete disposalCandidates[id];
	                            --disposalCount;
	                        } else if (!dependencyTracking[id]) {
	                            // Brand new subscription - add it
	                            addDependencyTracking(id, subscribable, isSleeping ? { _target: subscribable } : subscribable.subscribe(evaluatePossiblyAsync));
	                        }
	                    }
	                },
	                computed: dependentObservable,
	                isInitial: isInitial
	            });

	            dependencyTracking = {};
	            _dependenciesCount = 0;

	            try {
	                var newValue = evaluatorFunctionTarget ? readFunction.call(evaluatorFunctionTarget) : readFunction();

	            } finally {
	                ko.dependencyDetection.end();

	                // For each subscription no longer being used, remove it from the active subscriptions list and dispose it
	                if (disposalCount && !isSleeping) {
	                    ko.utils.objectForEach(disposalCandidates, function(id, toDispose) {
	                        if (toDispose.dispose)
	                            toDispose.dispose();
	                    });
	                }

	                _needsEvaluation = false;
	            }

	            if (dependentObservable.isDifferent(_latestValue, newValue)) {
	                if (!isSleeping) {
	                    notify(_latestValue, "beforeChange");
	                }

	                _latestValue = newValue;
	                if (DEBUG) dependentObservable._latestValue = _latestValue;

	                if (isSleeping) {
	                    dependentObservable.updateVersion();
	                } else if (notifyChange) {
	                    notify(_latestValue);
	                }
	            }

	            if (isInitial) {
	                notify(_latestValue, "awake");
	            }
	        } finally {
	            _isBeingEvaluated = false;
	        }

	        if (!_dependenciesCount)
	            dispose();
	    }

	    function dependentObservable() {
	        if (arguments.length > 0) {
	            if (typeof writeFunction === "function") {
	                // Writing a value
	                writeFunction.apply(evaluatorFunctionTarget, arguments);
	            } else {
	                throw new Error("Cannot write a value to a ko.computed unless you specify a 'write' option. If you wish to read the current value, don't pass any parameters.");
	            }
	            return this; // Permits chained assignments
	        } else {
	            // Reading the value
	            ko.dependencyDetection.registerDependency(dependentObservable);
	            if (_needsEvaluation || (isSleeping && haveDependenciesChanged())) {
	                evaluateImmediate();
	            }
	            return _latestValue;
	        }
	    }

	    function peek() {
	        // Peek won't re-evaluate, except while the computed is sleeping or to get the initial value when "deferEvaluation" is set.
	        if ((_needsEvaluation && !_dependenciesCount) || (isSleeping && haveDependenciesChanged())) {
	            evaluateImmediate();
	        }
	        return _latestValue;
	    }

	    function isActive() {
	        return _needsEvaluation || _dependenciesCount > 0;
	    }

	    function notify(value, event) {
	        dependentObservable["notifySubscribers"](value, event);
	    }

	    // By here, "options" is always non-null
	    var writeFunction = options["write"],
	        disposeWhenNodeIsRemoved = options["disposeWhenNodeIsRemoved"] || options.disposeWhenNodeIsRemoved || null,
	        disposeWhenOption = options["disposeWhen"] || options.disposeWhen,
	        disposeWhen = disposeWhenOption,
	        dispose = disposeComputed,
	        dependencyTracking = {},
	        _dependenciesCount = 0,
	        evaluationTimeoutInstance = null;

	    if (!evaluatorFunctionTarget)
	        evaluatorFunctionTarget = options["owner"];

	    ko.subscribable.call(dependentObservable);
	    ko.utils.setPrototypeOfOrExtend(dependentObservable, ko.dependentObservable['fn']);

	    dependentObservable.peek = peek;
	    dependentObservable.getDependenciesCount = function () { return _dependenciesCount; };
	    dependentObservable.hasWriteFunction = typeof writeFunction === "function";
	    dependentObservable.dispose = function () { dispose(); };
	    dependentObservable.isActive = isActive;

	    // Replace the limit function with one that delays evaluation as well.
	    var originalLimit = dependentObservable.limit;
	    dependentObservable.limit = function(limitFunction) {
	        originalLimit.call(dependentObservable, limitFunction);
	        dependentObservable._evalRateLimited = function() {
	            dependentObservable._rateLimitedBeforeChange(_latestValue);

	            _needsEvaluation = true;    // Mark as dirty

	            // Pass the observable to the rate-limit code, which will access it when
	            // it's time to do the notification.
	            dependentObservable._rateLimitedChange(dependentObservable);
	        }
	    };

	    if (options['pure']) {
	        pure = true;
	        isSleeping = true;     // Starts off sleeping; will awake on the first subscription
	        dependentObservable.beforeSubscriptionAdd = function (event) {
	            // If asleep, wake up the computed by subscribing to any dependencies.
	            if (!_isDisposed && isSleeping && event == 'change') {
	                isSleeping = false;
	                if (_needsEvaluation || haveDependenciesChanged()) {
	                    dependencyTracking = null;
	                    _dependenciesCount = 0;
	                    _needsEvaluation = true;
	                    evaluateImmediate();
	                } else {
	                    // First put the dependencies in order
	                    var dependeciesOrder = [];
	                    ko.utils.objectForEach(dependencyTracking, function (id, dependency) {
	                        dependeciesOrder[dependency._order] = id;
	                    });
	                    // Next, subscribe to each one
	                    ko.utils.arrayForEach(dependeciesOrder, function(id, order) {
	                        var dependency = dependencyTracking[id],
	                            subscription = dependency._target.subscribe(evaluatePossiblyAsync);
	                        subscription._order = order;
	                        subscription._version = dependency._version;
	                        dependencyTracking[id] = subscription;
	                    });
	                }
	                if (!_isDisposed) {     // test since evaluating could trigger disposal
	                    notify(_latestValue, "awake");
	                }
	            }
	        };

	        dependentObservable.afterSubscriptionRemove = function (event) {
	            if (!_isDisposed && event == 'change' && !dependentObservable.hasSubscriptionsForEvent('change')) {
	                ko.utils.objectForEach(dependencyTracking, function (id, dependency) {
	                    if (dependency.dispose) {
	                        dependencyTracking[id] = {
	                            _target: dependency._target,
	                            _order: dependency._order,
	                            _version: dependency._version
	                        };
	                        dependency.dispose();
	                    }
	                });
	                isSleeping = true;
	                notify(undefined, "asleep");
	            }
	        };

	        // Because a pure computed is not automatically updated while it is sleeping, we can't
	        // simply return the version number. Instead, we check if any of the dependencies have
	        // changed and conditionally re-evaluate the computed observable.
	        dependentObservable._originalGetVersion = dependentObservable.getVersion;
	        dependentObservable.getVersion = function () {
	            if (isSleeping && (_needsEvaluation || haveDependenciesChanged())) {
	                evaluateImmediate();
	            }
	            return dependentObservable._originalGetVersion();
	        };
	    } else if (options['deferEvaluation']) {
	        // This will force a computed with deferEvaluation to evaluate when the first subscriptions is registered.
	        dependentObservable.beforeSubscriptionAdd = function (event) {
	            if (event == 'change' || event == 'beforeChange') {
	                peek();
	            }
	        }
	    }

	    ko.exportProperty(dependentObservable, 'peek', dependentObservable.peek);
	    ko.exportProperty(dependentObservable, 'dispose', dependentObservable.dispose);
	    ko.exportProperty(dependentObservable, 'isActive', dependentObservable.isActive);
	    ko.exportProperty(dependentObservable, 'getDependenciesCount', dependentObservable.getDependenciesCount);

	    // Add a "disposeWhen" callback that, on each evaluation, disposes if the node was removed without using ko.removeNode.
	    if (disposeWhenNodeIsRemoved) {
	        // Since this computed is associated with a DOM node, and we don't want to dispose the computed
	        // until the DOM node is *removed* from the document (as opposed to never having been in the document),
	        // we'll prevent disposal until "disposeWhen" first returns false.
	        _suppressDisposalUntilDisposeWhenReturnsFalse = true;

	        // Only watch for the node's disposal if the value really is a node. It might not be,
	        // e.g., { disposeWhenNodeIsRemoved: true } can be used to opt into the "only dispose
	        // after first false result" behaviour even if there's no specific node to watch. This
	        // technique is intended for KO's internal use only and shouldn't be documented or used
	        // by application code, as it's likely to change in a future version of KO.
	        if (disposeWhenNodeIsRemoved.nodeType) {
	            disposeWhen = function () {
	                return !ko.utils.domNodeIsAttachedToDocument(disposeWhenNodeIsRemoved) || (disposeWhenOption && disposeWhenOption());
	            };
	        }
	    }

	    // Evaluate, unless sleeping or deferEvaluation is true
	    if (!isSleeping && !options['deferEvaluation'])
	        evaluateImmediate();

	    // Attach a DOM node disposal callback so that the computed will be proactively disposed as soon as the node is
	    // removed using ko.removeNode. But skip if isActive is false (there will never be any dependencies to dispose).
	    if (disposeWhenNodeIsRemoved && isActive() && disposeWhenNodeIsRemoved.nodeType) {
	        dispose = function() {
	            ko.utils.domNodeDisposal.removeDisposeCallback(disposeWhenNodeIsRemoved, dispose);
	            disposeComputed();
	        };
	        ko.utils.domNodeDisposal.addDisposeCallback(disposeWhenNodeIsRemoved, dispose);
	    }

	    return dependentObservable;
	};

	ko.isComputed = function(instance) {
	    return ko.hasPrototype(instance, ko.dependentObservable);
	};

	var protoProp = ko.observable.protoProperty; // == "__ko_proto__"
	ko.dependentObservable[protoProp] = ko.observable;

	ko.dependentObservable['fn'] = {
	    "equalityComparer": valuesArePrimitiveAndEqual
	};
	ko.dependentObservable['fn'][protoProp] = ko.dependentObservable;

	// Note that for browsers that don't support proto assignment, the
	// inheritance chain is created manually in the ko.dependentObservable constructor
	if (ko.utils.canSetPrototype) {
	    ko.utils.setPrototypeOf(ko.dependentObservable['fn'], ko.subscribable['fn']);
	}

	ko.exportSymbol('dependentObservable', ko.dependentObservable);
	ko.exportSymbol('computed', ko.dependentObservable); // Make "ko.computed" an alias for "ko.dependentObservable"
	ko.exportSymbol('isComputed', ko.isComputed);

	ko.pureComputed = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget) {
	    if (typeof evaluatorFunctionOrOptions === 'function') {
	        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget, {'pure':true});
	    } else {
	        evaluatorFunctionOrOptions = ko.utils.extend({}, evaluatorFunctionOrOptions);   // make a copy of the parameter object
	        evaluatorFunctionOrOptions['pure'] = true;
	        return ko.computed(evaluatorFunctionOrOptions, evaluatorFunctionTarget);
	    }
	}
	ko.exportSymbol('pureComputed', ko.pureComputed);

	(function() {
	    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)

	    ko.toJS = function(rootObject) {
	        if (arguments.length == 0)
	            throw new Error("When calling ko.toJS, pass the object you want to convert.");

	        // We just unwrap everything at every level in the object graph
	        return mapJsObjectGraph(rootObject, function(valueToMap) {
	            // Loop because an observable's value might in turn be another observable wrapper
	            for (var i = 0; ko.isObservable(valueToMap) && (i < maxNestedObservableDepth); i++)
	                valueToMap = valueToMap();
	            return valueToMap;
	        });
	    };

	    ko.toJSON = function(rootObject, replacer, space) {     // replacer and space are optional
	        var plainJavaScriptObject = ko.toJS(rootObject);
	        return ko.utils.stringifyJson(plainJavaScriptObject, replacer, space);
	    };

	    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
	        visitedObjects = visitedObjects || new objectLookup();

	        rootObject = mapInputCallback(rootObject);
	        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
	        if (!canHaveProperties)
	            return rootObject;

	        var outputProperties = rootObject instanceof Array ? [] : {};
	        visitedObjects.save(rootObject, outputProperties);

	        visitPropertiesOrArrayEntries(rootObject, function(indexer) {
	            var propertyValue = mapInputCallback(rootObject[indexer]);

	            switch (typeof propertyValue) {
	                case "boolean":
	                case "number":
	                case "string":
	                case "function":
	                    outputProperties[indexer] = propertyValue;
	                    break;
	                case "object":
	                case "undefined":
	                    var previouslyMappedValue = visitedObjects.get(propertyValue);
	                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
	                        ? previouslyMappedValue
	                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
	                    break;
	            }
	        });

	        return outputProperties;
	    }

	    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
	        if (rootObject instanceof Array) {
	            for (var i = 0; i < rootObject.length; i++)
	                visitorCallback(i);

	            // For arrays, also respect toJSON property for custom mappings (fixes #278)
	            if (typeof rootObject['toJSON'] == 'function')
	                visitorCallback('toJSON');
	        } else {
	            for (var propertyName in rootObject) {
	                visitorCallback(propertyName);
	            }
	        }
	    };

	    function objectLookup() {
	        this.keys = [];
	        this.values = [];
	    };

	    objectLookup.prototype = {
	        constructor: objectLookup,
	        save: function(key, value) {
	            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
	            if (existingIndex >= 0)
	                this.values[existingIndex] = value;
	            else {
	                this.keys.push(key);
	                this.values.push(value);
	            }
	        },
	        get: function(key) {
	            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
	            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
	        }
	    };
	})();

	ko.exportSymbol('toJS', ko.toJS);
	ko.exportSymbol('toJSON', ko.toJSON);
	(function () {
	    var hasDomDataExpandoProperty = '__ko__hasDomDataOptionValue__';

	    // Normally, SELECT elements and their OPTIONs can only take value of type 'string' (because the values
	    // are stored on DOM attributes). ko.selectExtensions provides a way for SELECTs/OPTIONs to have values
	    // that are arbitrary objects. This is very convenient when implementing things like cascading dropdowns.
	    ko.selectExtensions = {
	        readValue : function(element) {
	            switch (ko.utils.tagNameLower(element)) {
	                case 'option':
	                    if (element[hasDomDataExpandoProperty] === true)
	                        return ko.utils.domData.get(element, ko.bindingHandlers.options.optionValueDomDataKey);
	                    return ko.utils.ieVersion <= 7
	                        ? (element.getAttributeNode('value') && element.getAttributeNode('value').specified ? element.value : element.text)
	                        : element.value;
	                case 'select':
	                    return element.selectedIndex >= 0 ? ko.selectExtensions.readValue(element.options[element.selectedIndex]) : undefined;
	                default:
	                    return element.value;
	            }
	        },

	        writeValue: function(element, value, allowUnset) {
	            switch (ko.utils.tagNameLower(element)) {
	                case 'option':
	                    switch(typeof value) {
	                        case "string":
	                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, undefined);
	                            if (hasDomDataExpandoProperty in element) { // IE <= 8 throws errors if you delete non-existent properties from a DOM node
	                                delete element[hasDomDataExpandoProperty];
	                            }
	                            element.value = value;
	                            break;
	                        default:
	                            // Store arbitrary object using DomData
	                            ko.utils.domData.set(element, ko.bindingHandlers.options.optionValueDomDataKey, value);
	                            element[hasDomDataExpandoProperty] = true;

	                            // Special treatment of numbers is just for backward compatibility. KO 1.2.1 wrote numerical values to element.value.
	                            element.value = typeof value === "number" ? value : "";
	                            break;
	                    }
	                    break;
	                case 'select':
	                    if (value === "" || value === null)       // A blank string or null value will select the caption
	                        value = undefined;
	                    var selection = -1;
	                    for (var i = 0, n = element.options.length, optionValue; i < n; ++i) {
	                        optionValue = ko.selectExtensions.readValue(element.options[i]);
	                        // Include special check to handle selecting a caption with a blank string value
	                        if (optionValue == value || (optionValue == "" && value === undefined)) {
	                            selection = i;
	                            break;
	                        }
	                    }
	                    if (allowUnset || selection >= 0 || (value === undefined && element.size > 1)) {
	                        element.selectedIndex = selection;
	                    }
	                    break;
	                default:
	                    if ((value === null) || (value === undefined))
	                        value = "";
	                    element.value = value;
	                    break;
	            }
	        }
	    };
	})();

	ko.exportSymbol('selectExtensions', ko.selectExtensions);
	ko.exportSymbol('selectExtensions.readValue', ko.selectExtensions.readValue);
	ko.exportSymbol('selectExtensions.writeValue', ko.selectExtensions.writeValue);
	ko.expressionRewriting = (function () {
	    var javaScriptReservedWords = ["true", "false", "null", "undefined"];

	    // Matches something that can be assigned to--either an isolated identifier or something ending with a property accessor
	    // This is designed to be simple and avoid false negatives, but could produce false positives (e.g., a+b.c).
	    // This also will not properly handle nested brackets (e.g., obj1[obj2['prop']]; see #911).
	    var javaScriptAssignmentTarget = /^(?:[$_a-z][$\w]*|(.+)(\.\s*[$_a-z][$\w]*|\[.+\]))$/i;

	    function getWriteableValue(expression) {
	        if (ko.utils.arrayIndexOf(javaScriptReservedWords, expression) >= 0)
	            return false;
	        var match = expression.match(javaScriptAssignmentTarget);
	        return match === null ? false : match[1] ? ('Object(' + match[1] + ')' + match[2]) : expression;
	    }

	    // The following regular expressions will be used to split an object-literal string into tokens

	        // These two match strings, either with double quotes or single quotes
	    var stringDouble = '"(?:[^"\\\\]|\\\\.)*"',
	        stringSingle = "'(?:[^'\\\\]|\\\\.)*'",
	        // Matches a regular expression (text enclosed by slashes), but will also match sets of divisions
	        // as a regular expression (this is handled by the parsing loop below).
	        stringRegexp = '/(?:[^/\\\\]|\\\\.)*/\w*',
	        // These characters have special meaning to the parser and must not appear in the middle of a
	        // token, except as part of a string.
	        specials = ',"\'{}()/:[\\]',
	        // Match text (at least two characters) that does not contain any of the above special characters,
	        // although some of the special characters are allowed to start it (all but the colon and comma).
	        // The text can contain spaces, but leading or trailing spaces are skipped.
	        everyThingElse = '[^\\s:,/][^' + specials + ']*[^\\s' + specials + ']',
	        // Match any non-space character not matched already. This will match colons and commas, since they're
	        // not matched by "everyThingElse", but will also match any other single character that wasn't already
	        // matched (for example: in "a: 1, b: 2", each of the non-space characters will be matched by oneNotSpace).
	        oneNotSpace = '[^\\s]',

	        // Create the actual regular expression by or-ing the above strings. The order is important.
	        bindingToken = RegExp(stringDouble + '|' + stringSingle + '|' + stringRegexp + '|' + everyThingElse + '|' + oneNotSpace, 'g'),

	        // Match end of previous token to determine whether a slash is a division or regex.
	        divisionLookBehind = /[\])"'A-Za-z0-9_$]+$/,
	        keywordRegexLookBehind = {'in':1,'return':1,'typeof':1};

	    function parseObjectLiteral(objectLiteralString) {
	        // Trim leading and trailing spaces from the string
	        var str = ko.utils.stringTrim(objectLiteralString);

	        // Trim braces '{' surrounding the whole object literal
	        if (str.charCodeAt(0) === 123) str = str.slice(1, -1);

	        // Split into tokens
	        var result = [], toks = str.match(bindingToken), key, values = [], depth = 0;

	        if (toks) {
	            // Append a comma so that we don't need a separate code block to deal with the last item
	            toks.push(',');

	            for (var i = 0, tok; tok = toks[i]; ++i) {
	                var c = tok.charCodeAt(0);
	                // A comma signals the end of a key/value pair if depth is zero
	                if (c === 44) { // ","
	                    if (depth <= 0) {
	                        result.push((key && values.length) ? {key: key, value: values.join('')} : {'unknown': key || values.join('')});
	                        key = depth = 0;
	                        values = [];
	                        continue;
	                    }
	                // Simply skip the colon that separates the name and value
	                } else if (c === 58) { // ":"
	                    if (!depth && !key && values.length === 1) {
	                        key = values.pop();
	                        continue;
	                    }
	                // A set of slashes is initially matched as a regular expression, but could be division
	                } else if (c === 47 && i && tok.length > 1) {  // "/"
	                    // Look at the end of the previous token to determine if the slash is actually division
	                    var match = toks[i-1].match(divisionLookBehind);
	                    if (match && !keywordRegexLookBehind[match[0]]) {
	                        // The slash is actually a division punctuator; re-parse the remainder of the string (not including the slash)
	                        str = str.substr(str.indexOf(tok) + 1);
	                        toks = str.match(bindingToken);
	                        toks.push(',');
	                        i = -1;
	                        // Continue with just the slash
	                        tok = '/';
	                    }
	                // Increment depth for parentheses, braces, and brackets so that interior commas are ignored
	                } else if (c === 40 || c === 123 || c === 91) { // '(', '{', '['
	                    ++depth;
	                } else if (c === 41 || c === 125 || c === 93) { // ')', '}', ']'
	                    --depth;
	                // The key will be the first token; if it's a string, trim the quotes
	                } else if (!key && !values.length && (c === 34 || c === 39)) { // '"', "'"
	                    tok = tok.slice(1, -1);
	                }
	                values.push(tok);
	            }
	        }
	        return result;
	    }

	    // Two-way bindings include a write function that allow the handler to update the value even if it's not an observable.
	    var twoWayBindings = {};

	    function preProcessBindings(bindingsStringOrKeyValueArray, bindingOptions) {
	        bindingOptions = bindingOptions || {};

	        function processKeyValue(key, val) {
	            var writableVal;
	            function callPreprocessHook(obj) {
	                return (obj && obj['preprocess']) ? (val = obj['preprocess'](val, key, processKeyValue)) : true;
	            }
	            if (!bindingParams) {
	                if (!callPreprocessHook(ko['getBindingHandler'](key)))
	                    return;

	                if (twoWayBindings[key] && (writableVal = getWriteableValue(val))) {
	                    // For two-way bindings, provide a write method in case the value
	                    // isn't a writable observable.
	                    propertyAccessorResultStrings.push("'" + key + "':function(_z){" + writableVal + "=_z}");
	                }
	            }
	            // Values are wrapped in a function so that each value can be accessed independently
	            if (makeValueAccessors) {
	                val = 'function(){return ' + val + ' }';
	            }
	            resultStrings.push("'" + key + "':" + val);
	        }

	        var resultStrings = [],
	            propertyAccessorResultStrings = [],
	            makeValueAccessors = bindingOptions['valueAccessors'],
	            bindingParams = bindingOptions['bindingParams'],
	            keyValueArray = typeof bindingsStringOrKeyValueArray === "string" ?
	                parseObjectLiteral(bindingsStringOrKeyValueArray) : bindingsStringOrKeyValueArray;

	        ko.utils.arrayForEach(keyValueArray, function(keyValue) {
	            processKeyValue(keyValue.key || keyValue['unknown'], keyValue.value);
	        });

	        if (propertyAccessorResultStrings.length)
	            processKeyValue('_ko_property_writers', "{" + propertyAccessorResultStrings.join(",") + " }");

	        return resultStrings.join(",");
	    }

	    return {
	        bindingRewriteValidators: [],

	        twoWayBindings: twoWayBindings,

	        parseObjectLiteral: parseObjectLiteral,

	        preProcessBindings: preProcessBindings,

	        keyValueArrayContainsKey: function(keyValueArray, key) {
	            for (var i = 0; i < keyValueArray.length; i++)
	                if (keyValueArray[i]['key'] == key)
	                    return true;
	            return false;
	        },

	        // Internal, private KO utility for updating model properties from within bindings
	        // property:            If the property being updated is (or might be) an observable, pass it here
	        //                      If it turns out to be a writable observable, it will be written to directly
	        // allBindings:         An object with a get method to retrieve bindings in the current execution context.
	        //                      This will be searched for a '_ko_property_writers' property in case you're writing to a non-observable
	        // key:                 The key identifying the property to be written. Example: for { hasFocus: myValue }, write to 'myValue' by specifying the key 'hasFocus'
	        // value:               The value to be written
	        // checkIfDifferent:    If true, and if the property being written is a writable observable, the value will only be written if
	        //                      it is !== existing value on that writable observable
	        writeValueToProperty: function(property, allBindings, key, value, checkIfDifferent) {
	            if (!property || !ko.isObservable(property)) {
	                var propWriters = allBindings.get('_ko_property_writers');
	                if (propWriters && propWriters[key])
	                    propWriters[key](value);
	            } else if (ko.isWriteableObservable(property) && (!checkIfDifferent || property.peek() !== value)) {
	                property(value);
	            }
	        }
	    };
	})();

	ko.exportSymbol('expressionRewriting', ko.expressionRewriting);
	ko.exportSymbol('expressionRewriting.bindingRewriteValidators', ko.expressionRewriting.bindingRewriteValidators);
	ko.exportSymbol('expressionRewriting.parseObjectLiteral', ko.expressionRewriting.parseObjectLiteral);
	ko.exportSymbol('expressionRewriting.preProcessBindings', ko.expressionRewriting.preProcessBindings);

	// Making bindings explicitly declare themselves as "two way" isn't ideal in the long term (it would be better if
	// all bindings could use an official 'property writer' API without needing to declare that they might). However,
	// since this is not, and has never been, a public API (_ko_property_writers was never documented), it's acceptable
	// as an internal implementation detail in the short term.
	// For those developers who rely on _ko_property_writers in their custom bindings, we expose _twoWayBindings as an
	// undocumented feature that makes it relatively easy to upgrade to KO 3.0. However, this is still not an official
	// public API, and we reserve the right to remove it at any time if we create a real public property writers API.
	ko.exportSymbol('expressionRewriting._twoWayBindings', ko.expressionRewriting.twoWayBindings);

	// For backward compatibility, define the following aliases. (Previously, these function names were misleading because
	// they referred to JSON specifically, even though they actually work with arbitrary JavaScript object literal expressions.)
	ko.exportSymbol('jsonExpressionRewriting', ko.expressionRewriting);
	ko.exportSymbol('jsonExpressionRewriting.insertPropertyAccessorsIntoJson', ko.expressionRewriting.preProcessBindings);
	(function() {
	    // "Virtual elements" is an abstraction on top of the usual DOM API which understands the notion that comment nodes
	    // may be used to represent hierarchy (in addition to the DOM's natural hierarchy).
	    // If you call the DOM-manipulating functions on ko.virtualElements, you will be able to read and write the state
	    // of that virtual hierarchy
	    //
	    // The point of all this is to support containerless templates (e.g., <!-- ko foreach:someCollection -->blah<!-- /ko -->)
	    // without having to scatter special cases all over the binding and templating code.

	    // IE 9 cannot reliably read the "nodeValue" property of a comment node (see https://github.com/SteveSanderson/knockout/issues/186)
	    // but it does give them a nonstandard alternative property called "text" that it can read reliably. Other browsers don't have that property.
	    // So, use node.text where available, and node.nodeValue elsewhere
	    var commentNodesHaveTextProperty = document && document.createComment("test").text === "<!--test-->";

	    var startCommentRegex = commentNodesHaveTextProperty ? /^<!--\s*ko(?:\s+([\s\S]+))?\s*-->$/ : /^\s*ko(?:\s+([\s\S]+))?\s*$/;
	    var endCommentRegex =   commentNodesHaveTextProperty ? /^<!--\s*\/ko\s*-->$/ : /^\s*\/ko\s*$/;
	    var htmlTagsWithOptionallyClosingChildren = { 'ul': true, 'ol': true };

	    function isStartComment(node) {
	        return (node.nodeType == 8) && startCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
	    }

	    function isEndComment(node) {
	        return (node.nodeType == 8) && endCommentRegex.test(commentNodesHaveTextProperty ? node.text : node.nodeValue);
	    }

	    function getVirtualChildren(startComment, allowUnbalanced) {
	        var currentNode = startComment;
	        var depth = 1;
	        var children = [];
	        while (currentNode = currentNode.nextSibling) {
	            if (isEndComment(currentNode)) {
	                depth--;
	                if (depth === 0)
	                    return children;
	            }

	            children.push(currentNode);

	            if (isStartComment(currentNode))
	                depth++;
	        }
	        if (!allowUnbalanced)
	            throw new Error("Cannot find closing comment tag to match: " + startComment.nodeValue);
	        return null;
	    }

	    function getMatchingEndComment(startComment, allowUnbalanced) {
	        var allVirtualChildren = getVirtualChildren(startComment, allowUnbalanced);
	        if (allVirtualChildren) {
	            if (allVirtualChildren.length > 0)
	                return allVirtualChildren[allVirtualChildren.length - 1].nextSibling;
	            return startComment.nextSibling;
	        } else
	            return null; // Must have no matching end comment, and allowUnbalanced is true
	    }

	    function getUnbalancedChildTags(node) {
	        // e.g., from <div>OK</div><!-- ko blah --><span>Another</span>, returns: <!-- ko blah --><span>Another</span>
	        //       from <div>OK</div><!-- /ko --><!-- /ko -->,             returns: <!-- /ko --><!-- /ko -->
	        var childNode = node.firstChild, captureRemaining = null;
	        if (childNode) {
	            do {
	                if (captureRemaining)                   // We already hit an unbalanced node and are now just scooping up all subsequent nodes
	                    captureRemaining.push(childNode);
	                else if (isStartComment(childNode)) {
	                    var matchingEndComment = getMatchingEndComment(childNode, /* allowUnbalanced: */ true);
	                    if (matchingEndComment)             // It's a balanced tag, so skip immediately to the end of this virtual set
	                        childNode = matchingEndComment;
	                    else
	                        captureRemaining = [childNode]; // It's unbalanced, so start capturing from this point
	                } else if (isEndComment(childNode)) {
	                    captureRemaining = [childNode];     // It's unbalanced (if it wasn't, we'd have skipped over it already), so start capturing
	                }
	            } while (childNode = childNode.nextSibling);
	        }
	        return captureRemaining;
	    }

	    ko.virtualElements = {
	        allowedBindings: {},

	        childNodes: function(node) {
	            return isStartComment(node) ? getVirtualChildren(node) : node.childNodes;
	        },

	        emptyNode: function(node) {
	            if (!isStartComment(node))
	                ko.utils.emptyDomNode(node);
	            else {
	                var virtualChildren = ko.virtualElements.childNodes(node);
	                for (var i = 0, j = virtualChildren.length; i < j; i++)
	                    ko.removeNode(virtualChildren[i]);
	            }
	        },

	        setDomNodeChildren: function(node, childNodes) {
	            if (!isStartComment(node))
	                ko.utils.setDomNodeChildren(node, childNodes);
	            else {
	                ko.virtualElements.emptyNode(node);
	                var endCommentNode = node.nextSibling; // Must be the next sibling, as we just emptied the children
	                for (var i = 0, j = childNodes.length; i < j; i++)
	                    endCommentNode.parentNode.insertBefore(childNodes[i], endCommentNode);
	            }
	        },

	        prepend: function(containerNode, nodeToPrepend) {
	            if (!isStartComment(containerNode)) {
	                if (containerNode.firstChild)
	                    containerNode.insertBefore(nodeToPrepend, containerNode.firstChild);
	                else
	                    containerNode.appendChild(nodeToPrepend);
	            } else {
	                // Start comments must always have a parent and at least one following sibling (the end comment)
	                containerNode.parentNode.insertBefore(nodeToPrepend, containerNode.nextSibling);
	            }
	        },

	        insertAfter: function(containerNode, nodeToInsert, insertAfterNode) {
	            if (!insertAfterNode) {
	                ko.virtualElements.prepend(containerNode, nodeToInsert);
	            } else if (!isStartComment(containerNode)) {
	                // Insert after insertion point
	                if (insertAfterNode.nextSibling)
	                    containerNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
	                else
	                    containerNode.appendChild(nodeToInsert);
	            } else {
	                // Children of start comments must always have a parent and at least one following sibling (the end comment)
	                containerNode.parentNode.insertBefore(nodeToInsert, insertAfterNode.nextSibling);
	            }
	        },

	        firstChild: function(node) {
	            if (!isStartComment(node))
	                return node.firstChild;
	            if (!node.nextSibling || isEndComment(node.nextSibling))
	                return null;
	            return node.nextSibling;
	        },

	        nextSibling: function(node) {
	            if (isStartComment(node))
	                node = getMatchingEndComment(node);
	            if (node.nextSibling && isEndComment(node.nextSibling))
	                return null;
	            return node.nextSibling;
	        },

	        hasBindingValue: isStartComment,

	        virtualNodeBindingValue: function(node) {
	            var regexMatch = (commentNodesHaveTextProperty ? node.text : node.nodeValue).match(startCommentRegex);
	            return regexMatch ? regexMatch[1] : null;
	        },

	        normaliseVirtualElementDomStructure: function(elementVerified) {
	            // Workaround for https://github.com/SteveSanderson/knockout/issues/155
	            // (IE <= 8 or IE 9 quirks mode parses your HTML weirdly, treating closing </li> tags as if they don't exist, thereby moving comment nodes
	            // that are direct descendants of <ul> into the preceding <li>)
	            if (!htmlTagsWithOptionallyClosingChildren[ko.utils.tagNameLower(elementVerified)])
	                return;

	            // Scan immediate children to see if they contain unbalanced comment tags. If they do, those comment tags
	            // must be intended to appear *after* that child, so move them there.
	            var childNode = elementVerified.firstChild;
	            if (childNode) {
	                do {
	                    if (childNode.nodeType === 1) {
	                        var unbalancedTags = getUnbalancedChildTags(childNode);
	                        if (unbalancedTags) {
	                            // Fix up the DOM by moving the unbalanced tags to where they most likely were intended to be placed - *after* the child
	                            var nodeToInsertBefore = childNode.nextSibling;
	                            for (var i = 0; i < unbalancedTags.length; i++) {
	                                if (nodeToInsertBefore)
	                                    elementVerified.insertBefore(unbalancedTags[i], nodeToInsertBefore);
	                                else
	                                    elementVerified.appendChild(unbalancedTags[i]);
	                            }
	                        }
	                    }
	                } while (childNode = childNode.nextSibling);
	            }
	        }
	    };
	})();
	ko.exportSymbol('virtualElements', ko.virtualElements);
	ko.exportSymbol('virtualElements.allowedBindings', ko.virtualElements.allowedBindings);
	ko.exportSymbol('virtualElements.emptyNode', ko.virtualElements.emptyNode);
	//ko.exportSymbol('virtualElements.firstChild', ko.virtualElements.firstChild);     // firstChild is not minified
	ko.exportSymbol('virtualElements.insertAfter', ko.virtualElements.insertAfter);
	//ko.exportSymbol('virtualElements.nextSibling', ko.virtualElements.nextSibling);   // nextSibling is not minified
	ko.exportSymbol('virtualElements.prepend', ko.virtualElements.prepend);
	ko.exportSymbol('virtualElements.setDomNodeChildren', ko.virtualElements.setDomNodeChildren);
	(function() {
	    var defaultBindingAttributeName = "data-bind";

	    ko.bindingProvider = function() {
	        this.bindingCache = {};
	    };

	    ko.utils.extend(ko.bindingProvider.prototype, {
	        'nodeHasBindings': function(node) {
	            switch (node.nodeType) {
	                case 1: // Element
	                    return node.getAttribute(defaultBindingAttributeName) != null
	                        || ko.components['getComponentNameForNode'](node);
	                case 8: // Comment node
	                    return ko.virtualElements.hasBindingValue(node);
	                default: return false;
	            }
	        },

	        'getBindings': function(node, bindingContext) {
	            var bindingsString = this['getBindingsString'](node, bindingContext),
	                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node) : null;
	            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ false);
	        },

	        'getBindingAccessors': function(node, bindingContext) {
	            var bindingsString = this['getBindingsString'](node, bindingContext),
	                parsedBindings = bindingsString ? this['parseBindingsString'](bindingsString, bindingContext, node, { 'valueAccessors': true }) : null;
	            return ko.components.addBindingsForCustomElement(parsedBindings, node, bindingContext, /* valueAccessors */ true);
	        },

	        // The following function is only used internally by this default provider.
	        // It's not part of the interface definition for a general binding provider.
	        'getBindingsString': function(node, bindingContext) {
	            switch (node.nodeType) {
	                case 1: return node.getAttribute(defaultBindingAttributeName);   // Element
	                case 8: return ko.virtualElements.virtualNodeBindingValue(node); // Comment node
	                default: return null;
	            }
	        },

	        // The following function is only used internally by this default provider.
	        // It's not part of the interface definition for a general binding provider.
	        'parseBindingsString': function(bindingsString, bindingContext, node, options) {
	            try {
	                var bindingFunction = createBindingsStringEvaluatorViaCache(bindingsString, this.bindingCache, options);
	                return bindingFunction(bindingContext, node);
	            } catch (ex) {
	                ex.message = "Unable to parse bindings.\nBindings value: " + bindingsString + "\nMessage: " + ex.message;
	                throw ex;
	            }
	        }
	    });

	    ko.bindingProvider['instance'] = new ko.bindingProvider();

	    function createBindingsStringEvaluatorViaCache(bindingsString, cache, options) {
	        var cacheKey = bindingsString + (options && options['valueAccessors'] || '');
	        return cache[cacheKey]
	            || (cache[cacheKey] = createBindingsStringEvaluator(bindingsString, options));
	    }

	    function createBindingsStringEvaluator(bindingsString, options) {
	        // Build the source for a function that evaluates "expression"
	        // For each scope variable, add an extra level of "with" nesting
	        // Example result: with(sc1) { with(sc0) { return (expression) } }
	        var rewrittenBindings = ko.expressionRewriting.preProcessBindings(bindingsString, options),
	            functionBody = "with($context){with($data||{}){return{" + rewrittenBindings + "}}}";
	        return new Function("$context", "$element", functionBody);
	    }
	})();

	ko.exportSymbol('bindingProvider', ko.bindingProvider);
	(function () {
	    ko.bindingHandlers = {};

	    // The following element types will not be recursed into during binding. In the future, we
	    // may consider adding <template> to this list, because such elements' contents are always
	    // intended to be bound in a different context from where they appear in the document.
	    var bindingDoesNotRecurseIntoElementTypes = {
	        // Don't want bindings that operate on text nodes to mutate <script> and <textarea> contents,
	        // because it's unexpected and a potential XSS issue
	        'script': true,
	        'textarea': true
	    };

	    // Use an overridable method for retrieving binding handlers so that a plugins may support dynamically created handlers
	    ko['getBindingHandler'] = function(bindingKey) {
	        return ko.bindingHandlers[bindingKey];
	    };

	    // The ko.bindingContext constructor is only called directly to create the root context. For child
	    // contexts, use bindingContext.createChildContext or bindingContext.extend.
	    ko.bindingContext = function(dataItemOrAccessor, parentContext, dataItemAlias, extendCallback) {

	        // The binding context object includes static properties for the current, parent, and root view models.
	        // If a view model is actually stored in an observable, the corresponding binding context object, and
	        // any child contexts, must be updated when the view model is changed.
	        function updateContext() {
	            // Most of the time, the context will directly get a view model object, but if a function is given,
	            // we call the function to retrieve the view model. If the function accesses any obsevables or returns
	            // an observable, the dependency is tracked, and those observables can later cause the binding
	            // context to be updated.
	            var dataItemOrObservable = isFunc ? dataItemOrAccessor() : dataItemOrAccessor,
	                dataItem = ko.utils.unwrapObservable(dataItemOrObservable);

	            if (parentContext) {
	                // When a "parent" context is given, register a dependency on the parent context. Thus whenever the
	                // parent context is updated, this context will also be updated.
	                if (parentContext._subscribable)
	                    parentContext._subscribable();

	                // Copy $root and any custom properties from the parent context
	                ko.utils.extend(self, parentContext);

	                // Because the above copy overwrites our own properties, we need to reset them.
	                // During the first execution, "subscribable" isn't set, so don't bother doing the update then.
	                if (subscribable) {
	                    self._subscribable = subscribable;
	                }
	            } else {
	                self['$parents'] = [];
	                self['$root'] = dataItem;

	                // Export 'ko' in the binding context so it will be available in bindings and templates
	                // even if 'ko' isn't exported as a global, such as when using an AMD loader.
	                // See https://github.com/SteveSanderson/knockout/issues/490
	                self['ko'] = ko;
	            }
	            self['$rawData'] = dataItemOrObservable;
	            self['$data'] = dataItem;
	            if (dataItemAlias)
	                self[dataItemAlias] = dataItem;

	            // The extendCallback function is provided when creating a child context or extending a context.
	            // It handles the specific actions needed to finish setting up the binding context. Actions in this
	            // function could also add dependencies to this binding context.
	            if (extendCallback)
	                extendCallback(self, parentContext, dataItem);

	            return self['$data'];
	        }
	        function disposeWhen() {
	            return nodes && !ko.utils.anyDomNodeIsAttachedToDocument(nodes);
	        }

	        var self = this,
	            isFunc = typeof(dataItemOrAccessor) == "function" && !ko.isObservable(dataItemOrAccessor),
	            nodes,
	            subscribable = ko.dependentObservable(updateContext, null, { disposeWhen: disposeWhen, disposeWhenNodeIsRemoved: true });

	        // At this point, the binding context has been initialized, and the "subscribable" computed observable is
	        // subscribed to any observables that were accessed in the process. If there is nothing to track, the
	        // computed will be inactive, and we can safely throw it away. If it's active, the computed is stored in
	        // the context object.
	        if (subscribable.isActive()) {
	            self._subscribable = subscribable;

	            // Always notify because even if the model ($data) hasn't changed, other context properties might have changed
	            subscribable['equalityComparer'] = null;

	            // We need to be able to dispose of this computed observable when it's no longer needed. This would be
	            // easy if we had a single node to watch, but binding contexts can be used by many different nodes, and
	            // we cannot assume that those nodes have any relation to each other. So instead we track any node that
	            // the context is attached to, and dispose the computed when all of those nodes have been cleaned.

	            // Add properties to *subscribable* instead of *self* because any properties added to *self* may be overwritten on updates
	            nodes = [];
	            subscribable._addNode = function(node) {
	                nodes.push(node);
	                ko.utils.domNodeDisposal.addDisposeCallback(node, function(node) {
	                    ko.utils.arrayRemoveItem(nodes, node);
	                    if (!nodes.length) {
	                        subscribable.dispose();
	                        self._subscribable = subscribable = undefined;
	                    }
	                });
	            };
	        }
	    }

	    // Extend the binding context hierarchy with a new view model object. If the parent context is watching
	    // any obsevables, the new child context will automatically get a dependency on the parent context.
	    // But this does not mean that the $data value of the child context will also get updated. If the child
	    // view model also depends on the parent view model, you must provide a function that returns the correct
	    // view model on each update.
	    ko.bindingContext.prototype['createChildContext'] = function (dataItemOrAccessor, dataItemAlias, extendCallback) {
	        return new ko.bindingContext(dataItemOrAccessor, this, dataItemAlias, function(self, parentContext) {
	            // Extend the context hierarchy by setting the appropriate pointers
	            self['$parentContext'] = parentContext;
	            self['$parent'] = parentContext['$data'];
	            self['$parents'] = (parentContext['$parents'] || []).slice(0);
	            self['$parents'].unshift(self['$parent']);
	            if (extendCallback)
	                extendCallback(self);
	        });
	    };

	    // Extend the binding context with new custom properties. This doesn't change the context hierarchy.
	    // Similarly to "child" contexts, provide a function here to make sure that the correct values are set
	    // when an observable view model is updated.
	    ko.bindingContext.prototype['extend'] = function(properties) {
	        // If the parent context references an observable view model, "_subscribable" will always be the
	        // latest view model object. If not, "_subscribable" isn't set, and we can use the static "$data" value.
	        return new ko.bindingContext(this._subscribable || this['$data'], this, null, function(self, parentContext) {
	            // This "child" context doesn't directly track a parent observable view model,
	            // so we need to manually set the $rawData value to match the parent.
	            self['$rawData'] = parentContext['$rawData'];
	            ko.utils.extend(self, typeof(properties) == "function" ? properties() : properties);
	        });
	    };

	    // Returns the valueAccesor function for a binding value
	    function makeValueAccessor(value) {
	        return function() {
	            return value;
	        };
	    }

	    // Returns the value of a valueAccessor function
	    function evaluateValueAccessor(valueAccessor) {
	        return valueAccessor();
	    }

	    // Given a function that returns bindings, create and return a new object that contains
	    // binding value-accessors functions. Each accessor function calls the original function
	    // so that it always gets the latest value and all dependencies are captured. This is used
	    // by ko.applyBindingsToNode and getBindingsAndMakeAccessors.
	    function makeAccessorsFromFunction(callback) {
	        return ko.utils.objectMap(ko.dependencyDetection.ignore(callback), function(value, key) {
	            return function() {
	                return callback()[key];
	            };
	        });
	    }

	    // Given a bindings function or object, create and return a new object that contains
	    // binding value-accessors functions. This is used by ko.applyBindingsToNode.
	    function makeBindingAccessors(bindings, context, node) {
	        if (typeof bindings === 'function') {
	            return makeAccessorsFromFunction(bindings.bind(null, context, node));
	        } else {
	            return ko.utils.objectMap(bindings, makeValueAccessor);
	        }
	    }

	    // This function is used if the binding provider doesn't include a getBindingAccessors function.
	    // It must be called with 'this' set to the provider instance.
	    function getBindingsAndMakeAccessors(node, context) {
	        return makeAccessorsFromFunction(this['getBindings'].bind(this, node, context));
	    }

	    function validateThatBindingIsAllowedForVirtualElements(bindingName) {
	        var validator = ko.virtualElements.allowedBindings[bindingName];
	        if (!validator)
	            throw new Error("The binding '" + bindingName + "' cannot be used with virtual elements")
	    }

	    function applyBindingsToDescendantsInternal (bindingContext, elementOrVirtualElement, bindingContextsMayDifferFromDomParentElement) {
	        var currentChild,
	            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement),
	            provider = ko.bindingProvider['instance'],
	            preprocessNode = provider['preprocessNode'];

	        // Preprocessing allows a binding provider to mutate a node before bindings are applied to it. For example it's
	        // possible to insert new siblings after it, and/or replace the node with a different one. This can be used to
	        // implement custom binding syntaxes, such as {{ value }} for string interpolation, or custom element types that
	        // trigger insertion of <template> contents at that point in the document.
	        if (preprocessNode) {
	            while (currentChild = nextInQueue) {
	                nextInQueue = ko.virtualElements.nextSibling(currentChild);
	                preprocessNode.call(provider, currentChild);
	            }
	            // Reset nextInQueue for the next loop
	            nextInQueue = ko.virtualElements.firstChild(elementOrVirtualElement);
	        }

	        while (currentChild = nextInQueue) {
	            // Keep a record of the next child *before* applying bindings, in case the binding removes the current child from its position
	            nextInQueue = ko.virtualElements.nextSibling(currentChild);
	            applyBindingsToNodeAndDescendantsInternal(bindingContext, currentChild, bindingContextsMayDifferFromDomParentElement);
	        }
	    }

	    function applyBindingsToNodeAndDescendantsInternal (bindingContext, nodeVerified, bindingContextMayDifferFromDomParentElement) {
	        var shouldBindDescendants = true;

	        // Perf optimisation: Apply bindings only if...
	        // (1) We need to store the binding context on this node (because it may differ from the DOM parent node's binding context)
	        //     Note that we can't store binding contexts on non-elements (e.g., text nodes), as IE doesn't allow expando properties for those
	        // (2) It might have bindings (e.g., it has a data-bind attribute, or it's a marker for a containerless template)
	        var isElement = (nodeVerified.nodeType === 1);
	        if (isElement) // Workaround IE <= 8 HTML parsing weirdness
	            ko.virtualElements.normaliseVirtualElementDomStructure(nodeVerified);

	        var shouldApplyBindings = (isElement && bindingContextMayDifferFromDomParentElement)             // Case (1)
	                               || ko.bindingProvider['instance']['nodeHasBindings'](nodeVerified);       // Case (2)
	        if (shouldApplyBindings)
	            shouldBindDescendants = applyBindingsToNodeInternal(nodeVerified, null, bindingContext, bindingContextMayDifferFromDomParentElement)['shouldBindDescendants'];

	        if (shouldBindDescendants && !bindingDoesNotRecurseIntoElementTypes[ko.utils.tagNameLower(nodeVerified)]) {
	            // We're recursing automatically into (real or virtual) child nodes without changing binding contexts. So,
	            //  * For children of a *real* element, the binding context is certainly the same as on their DOM .parentNode,
	            //    hence bindingContextsMayDifferFromDomParentElement is false
	            //  * For children of a *virtual* element, we can't be sure. Evaluating .parentNode on those children may
	            //    skip over any number of intermediate virtual elements, any of which might define a custom binding context,
	            //    hence bindingContextsMayDifferFromDomParentElement is true
	            applyBindingsToDescendantsInternal(bindingContext, nodeVerified, /* bindingContextsMayDifferFromDomParentElement: */ !isElement);
	        }
	    }

	    var boundElementDomDataKey = ko.utils.domData.nextKey();


	    function topologicalSortBindings(bindings) {
	        // Depth-first sort
	        var result = [],                // The list of key/handler pairs that we will return
	            bindingsConsidered = {},    // A temporary record of which bindings are already in 'result'
	            cyclicDependencyStack = []; // Keeps track of a depth-search so that, if there's a cycle, we know which bindings caused it
	        ko.utils.objectForEach(bindings, function pushBinding(bindingKey) {
	            if (!bindingsConsidered[bindingKey]) {
	                var binding = ko['getBindingHandler'](bindingKey);
	                if (binding) {
	                    // First add dependencies (if any) of the current binding
	                    if (binding['after']) {
	                        cyclicDependencyStack.push(bindingKey);
	                        ko.utils.arrayForEach(binding['after'], function(bindingDependencyKey) {
	                            if (bindings[bindingDependencyKey]) {
	                                if (ko.utils.arrayIndexOf(cyclicDependencyStack, bindingDependencyKey) !== -1) {
	                                    throw Error("Cannot combine the following bindings, because they have a cyclic dependency: " + cyclicDependencyStack.join(", "));
	                                } else {
	                                    pushBinding(bindingDependencyKey);
	                                }
	                            }
	                        });
	                        cyclicDependencyStack.length--;
	                    }
	                    // Next add the current binding
	                    result.push({ key: bindingKey, handler: binding });
	                }
	                bindingsConsidered[bindingKey] = true;
	            }
	        });

	        return result;
	    }

	    function applyBindingsToNodeInternal(node, sourceBindings, bindingContext, bindingContextMayDifferFromDomParentElement) {
	        // Prevent multiple applyBindings calls for the same node, except when a binding value is specified
	        var alreadyBound = ko.utils.domData.get(node, boundElementDomDataKey);
	        if (!sourceBindings) {
	            if (alreadyBound) {
	                throw Error("You cannot apply bindings multiple times to the same element.");
	            }
	            ko.utils.domData.set(node, boundElementDomDataKey, true);
	        }

	        // Optimization: Don't store the binding context on this node if it's definitely the same as on node.parentNode, because
	        // we can easily recover it just by scanning up the node's ancestors in the DOM
	        // (note: here, parent node means "real DOM parent" not "virtual parent", as there's no O(1) way to find the virtual parent)
	        if (!alreadyBound && bindingContextMayDifferFromDomParentElement)
	            ko.storedBindingContextForNode(node, bindingContext);

	        // Use bindings if given, otherwise fall back on asking the bindings provider to give us some bindings
	        var bindings;
	        if (sourceBindings && typeof sourceBindings !== 'function') {
	            bindings = sourceBindings;
	        } else {
	            var provider = ko.bindingProvider['instance'],
	                getBindings = provider['getBindingAccessors'] || getBindingsAndMakeAccessors;

	            // Get the binding from the provider within a computed observable so that we can update the bindings whenever
	            // the binding context is updated or if the binding provider accesses observables.
	            var bindingsUpdater = ko.dependentObservable(
	                function() {
	                    bindings = sourceBindings ? sourceBindings(bindingContext, node) : getBindings.call(provider, node, bindingContext);
	                    // Register a dependency on the binding context to support obsevable view models.
	                    if (bindings && bindingContext._subscribable)
	                        bindingContext._subscribable();
	                    return bindings;
	                },
	                null, { disposeWhenNodeIsRemoved: node }
	            );

	            if (!bindings || !bindingsUpdater.isActive())
	                bindingsUpdater = null;
	        }

	        var bindingHandlerThatControlsDescendantBindings;
	        if (bindings) {
	            // Return the value accessor for a given binding. When bindings are static (won't be updated because of a binding
	            // context update), just return the value accessor from the binding. Otherwise, return a function that always gets
	            // the latest binding value and registers a dependency on the binding updater.
	            var getValueAccessor = bindingsUpdater
	                ? function(bindingKey) {
	                    return function() {
	                        return evaluateValueAccessor(bindingsUpdater()[bindingKey]);
	                    };
	                } : function(bindingKey) {
	                    return bindings[bindingKey];
	                };

	            // Use of allBindings as a function is maintained for backwards compatibility, but its use is deprecated
	            function allBindings() {
	                return ko.utils.objectMap(bindingsUpdater ? bindingsUpdater() : bindings, evaluateValueAccessor);
	            }
	            // The following is the 3.x allBindings API
	            allBindings['get'] = function(key) {
	                return bindings[key] && evaluateValueAccessor(getValueAccessor(key));
	            };
	            allBindings['has'] = function(key) {
	                return key in bindings;
	            };

	            // First put the bindings into the right order
	            var orderedBindings = topologicalSortBindings(bindings);

	            // Go through the sorted bindings, calling init and update for each
	            ko.utils.arrayForEach(orderedBindings, function(bindingKeyAndHandler) {
	                // Note that topologicalSortBindings has already filtered out any nonexistent binding handlers,
	                // so bindingKeyAndHandler.handler will always be nonnull.
	                var handlerInitFn = bindingKeyAndHandler.handler["init"],
	                    handlerUpdateFn = bindingKeyAndHandler.handler["update"],
	                    bindingKey = bindingKeyAndHandler.key;

	                if (node.nodeType === 8) {
	                    validateThatBindingIsAllowedForVirtualElements(bindingKey);
	                }

	                try {
	                    // Run init, ignoring any dependencies
	                    if (typeof handlerInitFn == "function") {
	                        ko.dependencyDetection.ignore(function() {
	                            var initResult = handlerInitFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);

	                            // If this binding handler claims to control descendant bindings, make a note of this
	                            if (initResult && initResult['controlsDescendantBindings']) {
	                                if (bindingHandlerThatControlsDescendantBindings !== undefined)
	                                    throw new Error("Multiple bindings (" + bindingHandlerThatControlsDescendantBindings + " and " + bindingKey + ") are trying to control descendant bindings of the same element. You cannot use these bindings together on the same element.");
	                                bindingHandlerThatControlsDescendantBindings = bindingKey;
	                            }
	                        });
	                    }

	                    // Run update in its own computed wrapper
	                    if (typeof handlerUpdateFn == "function") {
	                        ko.dependentObservable(
	                            function() {
	                                handlerUpdateFn(node, getValueAccessor(bindingKey), allBindings, bindingContext['$data'], bindingContext);
	                            },
	                            null,
	                            { disposeWhenNodeIsRemoved: node }
	                        );
	                    }
	                } catch (ex) {
	                    ex.message = "Unable to process binding \"" + bindingKey + ": " + bindings[bindingKey] + "\"\nMessage: " + ex.message;
	                    throw ex;
	                }
	            });
	        }

	        return {
	            'shouldBindDescendants': bindingHandlerThatControlsDescendantBindings === undefined
	        };
	    };

	    var storedBindingContextDomDataKey = ko.utils.domData.nextKey();
	    ko.storedBindingContextForNode = function (node, bindingContext) {
	        if (arguments.length == 2) {
	            ko.utils.domData.set(node, storedBindingContextDomDataKey, bindingContext);
	            if (bindingContext._subscribable)
	                bindingContext._subscribable._addNode(node);
	        } else {
	            return ko.utils.domData.get(node, storedBindingContextDomDataKey);
	        }
	    }

	    function getBindingContext(viewModelOrBindingContext) {
	        return viewModelOrBindingContext && (viewModelOrBindingContext instanceof ko.bindingContext)
	            ? viewModelOrBindingContext
	            : new ko.bindingContext(viewModelOrBindingContext);
	    }

	    ko.applyBindingAccessorsToNode = function (node, bindings, viewModelOrBindingContext) {
	        if (node.nodeType === 1) // If it's an element, workaround IE <= 8 HTML parsing weirdness
	            ko.virtualElements.normaliseVirtualElementDomStructure(node);
	        return applyBindingsToNodeInternal(node, bindings, getBindingContext(viewModelOrBindingContext), true);
	    };

	    ko.applyBindingsToNode = function (node, bindings, viewModelOrBindingContext) {
	        var context = getBindingContext(viewModelOrBindingContext);
	        return ko.applyBindingAccessorsToNode(node, makeBindingAccessors(bindings, context, node), context);
	    };

	    ko.applyBindingsToDescendants = function(viewModelOrBindingContext, rootNode) {
	        if (rootNode.nodeType === 1 || rootNode.nodeType === 8)
	            applyBindingsToDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
	    };

	    ko.applyBindings = function (viewModelOrBindingContext, rootNode) {
	        // If jQuery is loaded after Knockout, we won't initially have access to it. So save it here.
	        if (!jQueryInstance && window['jQuery']) {
	            jQueryInstance = window['jQuery'];
	        }

	        if (rootNode && (rootNode.nodeType !== 1) && (rootNode.nodeType !== 8))
	            throw new Error("ko.applyBindings: first parameter should be your view model; second parameter should be a DOM node");
	        rootNode = rootNode || window.document.body; // Make "rootNode" parameter optional

	        applyBindingsToNodeAndDescendantsInternal(getBindingContext(viewModelOrBindingContext), rootNode, true);
	    };

	    // Retrieving binding context from arbitrary nodes
	    ko.contextFor = function(node) {
	        // We can only do something meaningful for elements and comment nodes (in particular, not text nodes, as IE can't store domdata for them)
	        switch (node.nodeType) {
	            case 1:
	            case 8:
	                var context = ko.storedBindingContextForNode(node);
	                if (context) return context;
	                if (node.parentNode) return ko.contextFor(node.parentNode);
	                break;
	        }
	        return undefined;
	    };
	    ko.dataFor = function(node) {
	        var context = ko.contextFor(node);
	        return context ? context['$data'] : undefined;
	    };

	    ko.exportSymbol('bindingHandlers', ko.bindingHandlers);
	    ko.exportSymbol('applyBindings', ko.applyBindings);
	    ko.exportSymbol('applyBindingsToDescendants', ko.applyBindingsToDescendants);
	    ko.exportSymbol('applyBindingAccessorsToNode', ko.applyBindingAccessorsToNode);
	    ko.exportSymbol('applyBindingsToNode', ko.applyBindingsToNode);
	    ko.exportSymbol('contextFor', ko.contextFor);
	    ko.exportSymbol('dataFor', ko.dataFor);
	})();
	(function(undefined) {
	    var loadingSubscribablesCache = {}, // Tracks component loads that are currently in flight
	        loadedDefinitionsCache = {};    // Tracks component loads that have already completed

	    ko.components = {
	        get: function(componentName, callback) {
	            var cachedDefinition = getObjectOwnProperty(loadedDefinitionsCache, componentName);
	            if (cachedDefinition) {
	                // It's already loaded and cached. Reuse the same definition object.
	                // Note that for API consistency, even cache hits complete asynchronously by default.
	                // You can bypass this by putting synchronous:true on your component config.
	                if (cachedDefinition.isSynchronousComponent) {
	                    ko.dependencyDetection.ignore(function() { // See comment in loaderRegistryBehaviors.js for reasoning
	                        callback(cachedDefinition.definition);
	                    });
	                } else {
	                    setTimeout(function() { callback(cachedDefinition.definition); }, 0);
	                }
	            } else {
	                // Join the loading process that is already underway, or start a new one.
	                loadComponentAndNotify(componentName, callback);
	            }
	        },

	        clearCachedDefinition: function(componentName) {
	            delete loadedDefinitionsCache[componentName];
	        },

	        _getFirstResultFromLoaders: getFirstResultFromLoaders
	    };

	    function getObjectOwnProperty(obj, propName) {
	        return obj.hasOwnProperty(propName) ? obj[propName] : undefined;
	    }

	    function loadComponentAndNotify(componentName, callback) {
	        var subscribable = getObjectOwnProperty(loadingSubscribablesCache, componentName),
	            completedAsync;
	        if (!subscribable) {
	            // It's not started loading yet. Start loading, and when it's done, move it to loadedDefinitionsCache.
	            subscribable = loadingSubscribablesCache[componentName] = new ko.subscribable();
	            subscribable.subscribe(callback);

	            beginLoadingComponent(componentName, function(definition, config) {
	                var isSynchronousComponent = !!(config && config['synchronous']);
	                loadedDefinitionsCache[componentName] = { definition: definition, isSynchronousComponent: isSynchronousComponent };
	                delete loadingSubscribablesCache[componentName];

	                // For API consistency, all loads complete asynchronously. However we want to avoid
	                // adding an extra setTimeout if it's unnecessary (i.e., the completion is already
	                // async) since setTimeout(..., 0) still takes about 16ms or more on most browsers.
	                //
	                // You can bypass the 'always synchronous' feature by putting the synchronous:true
	                // flag on your component configuration when you register it.
	                if (completedAsync || isSynchronousComponent) {
	                    // Note that notifySubscribers ignores any dependencies read within the callback.
	                    // See comment in loaderRegistryBehaviors.js for reasoning
	                    subscribable['notifySubscribers'](definition);
	                } else {
	                    setTimeout(function() {
	                        subscribable['notifySubscribers'](definition);
	                    }, 0);
	                }
	            });
	            completedAsync = true;
	        } else {
	            subscribable.subscribe(callback);
	        }
	    }

	    function beginLoadingComponent(componentName, callback) {
	        getFirstResultFromLoaders('getConfig', [componentName], function(config) {
	            if (config) {
	                // We have a config, so now load its definition
	                getFirstResultFromLoaders('loadComponent', [componentName, config], function(definition) {
	                    callback(definition, config);
	                });
	            } else {
	                // The component has no config - it's unknown to all the loaders.
	                // Note that this is not an error (e.g., a module loading error) - that would abort the
	                // process and this callback would not run. For this callback to run, all loaders must
	                // have confirmed they don't know about this component.
	                callback(null, null);
	            }
	        });
	    }

	    function getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders) {
	        // On the first call in the stack, start with the full set of loaders
	        if (!candidateLoaders) {
	            candidateLoaders = ko.components['loaders'].slice(0); // Use a copy, because we'll be mutating this array
	        }

	        // Try the next candidate
	        var currentCandidateLoader = candidateLoaders.shift();
	        if (currentCandidateLoader) {
	            var methodInstance = currentCandidateLoader[methodName];
	            if (methodInstance) {
	                var wasAborted = false,
	                    synchronousReturnValue = methodInstance.apply(currentCandidateLoader, argsExceptCallback.concat(function(result) {
	                        if (wasAborted) {
	                            callback(null);
	                        } else if (result !== null) {
	                            // This candidate returned a value. Use it.
	                            callback(result);
	                        } else {
	                            // Try the next candidate
	                            getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
	                        }
	                    }));

	                // Currently, loaders may not return anything synchronously. This leaves open the possibility
	                // that we'll extend the API to support synchronous return values in the future. It won't be
	                // a breaking change, because currently no loader is allowed to return anything except undefined.
	                if (synchronousReturnValue !== undefined) {
	                    wasAborted = true;

	                    // Method to suppress exceptions will remain undocumented. This is only to keep
	                    // KO's specs running tidily, since we can observe the loading got aborted without
	                    // having exceptions cluttering up the console too.
	                    if (!currentCandidateLoader['suppressLoaderExceptions']) {
	                        throw new Error('Component loaders must supply values by invoking the callback, not by returning values synchronously.');
	                    }
	                }
	            } else {
	                // This candidate doesn't have the relevant handler. Synchronously move on to the next one.
	                getFirstResultFromLoaders(methodName, argsExceptCallback, callback, candidateLoaders);
	            }
	        } else {
	            // No candidates returned a value
	            callback(null);
	        }
	    }

	    // Reference the loaders via string name so it's possible for developers
	    // to replace the whole array by assigning to ko.components.loaders
	    ko.components['loaders'] = [];

	    ko.exportSymbol('components', ko.components);
	    ko.exportSymbol('components.get', ko.components.get);
	    ko.exportSymbol('components.clearCachedDefinition', ko.components.clearCachedDefinition);
	})();
	(function(undefined) {

	    // The default loader is responsible for two things:
	    // 1. Maintaining the default in-memory registry of component configuration objects
	    //    (i.e., the thing you're writing to when you call ko.components.register(someName, ...))
	    // 2. Answering requests for components by fetching configuration objects
	    //    from that default in-memory registry and resolving them into standard
	    //    component definition objects (of the form { createViewModel: ..., template: ... })
	    // Custom loaders may override either of these facilities, i.e.,
	    // 1. To supply configuration objects from some other source (e.g., conventions)
	    // 2. Or, to resolve configuration objects by loading viewmodels/templates via arbitrary logic.

	    var defaultConfigRegistry = {};

	    ko.components.register = function(componentName, config) {
	        if (!config) {
	            throw new Error('Invalid configuration for ' + componentName);
	        }

	        if (ko.components.isRegistered(componentName)) {
	            throw new Error('Component ' + componentName + ' is already registered');
	        }

	        defaultConfigRegistry[componentName] = config;
	    }

	    ko.components.isRegistered = function(componentName) {
	        return componentName in defaultConfigRegistry;
	    }

	    ko.components.unregister = function(componentName) {
	        delete defaultConfigRegistry[componentName];
	        ko.components.clearCachedDefinition(componentName);
	    }

	    ko.components.defaultLoader = {
	        'getConfig': function(componentName, callback) {
	            var result = defaultConfigRegistry.hasOwnProperty(componentName)
	                ? defaultConfigRegistry[componentName]
	                : null;
	            callback(result);
	        },

	        'loadComponent': function(componentName, config, callback) {
	            var errorCallback = makeErrorCallback(componentName);
	            possiblyGetConfigFromAmd(errorCallback, config, function(loadedConfig) {
	                resolveConfig(componentName, errorCallback, loadedConfig, callback);
	            });
	        },

	        'loadTemplate': function(componentName, templateConfig, callback) {
	            resolveTemplate(makeErrorCallback(componentName), templateConfig, callback);
	        },

	        'loadViewModel': function(componentName, viewModelConfig, callback) {
	            resolveViewModel(makeErrorCallback(componentName), viewModelConfig, callback);
	        }
	    };

	    var createViewModelKey = 'createViewModel';

	    // Takes a config object of the form { template: ..., viewModel: ... }, and asynchronously convert it
	    // into the standard component definition format:
	    //    { template: <ArrayOfDomNodes>, createViewModel: function(params, componentInfo) { ... } }.
	    // Since both template and viewModel may need to be resolved asynchronously, both tasks are performed
	    // in parallel, and the results joined when both are ready. We don't depend on any promises infrastructure,
	    // so this is implemented manually below.
	    function resolveConfig(componentName, errorCallback, config, callback) {
	        var result = {},
	            makeCallBackWhenZero = 2,
	            tryIssueCallback = function() {
	                if (--makeCallBackWhenZero === 0) {
	                    callback(result);
	                }
	            },
	            templateConfig = config['template'],
	            viewModelConfig = config['viewModel'];

	        if (templateConfig) {
	            possiblyGetConfigFromAmd(errorCallback, templateConfig, function(loadedConfig) {
	                ko.components._getFirstResultFromLoaders('loadTemplate', [componentName, loadedConfig], function(resolvedTemplate) {
	                    result['template'] = resolvedTemplate;
	                    tryIssueCallback();
	                });
	            });
	        } else {
	            tryIssueCallback();
	        }

	        if (viewModelConfig) {
	            possiblyGetConfigFromAmd(errorCallback, viewModelConfig, function(loadedConfig) {
	                ko.components._getFirstResultFromLoaders('loadViewModel', [componentName, loadedConfig], function(resolvedViewModel) {
	                    result[createViewModelKey] = resolvedViewModel;
	                    tryIssueCallback();
	                });
	            });
	        } else {
	            tryIssueCallback();
	        }
	    }

	    function resolveTemplate(errorCallback, templateConfig, callback) {
	        if (typeof templateConfig === 'string') {
	            // Markup - parse it
	            callback(ko.utils.parseHtmlFragment(templateConfig));
	        } else if (templateConfig instanceof Array) {
	            // Assume already an array of DOM nodes - pass through unchanged
	            callback(templateConfig);
	        } else if (isDocumentFragment(templateConfig)) {
	            // Document fragment - use its child nodes
	            callback(ko.utils.makeArray(templateConfig.childNodes));
	        } else if (templateConfig['element']) {
	            var element = templateConfig['element'];
	            if (isDomElement(element)) {
	                // Element instance - copy its child nodes
	                callback(cloneNodesFromTemplateSourceElement(element));
	            } else if (typeof element === 'string') {
	                // Element ID - find it, then copy its child nodes
	                var elemInstance = document.getElementById(element);
	                if (elemInstance) {
	                    callback(cloneNodesFromTemplateSourceElement(elemInstance));
	                } else {
	                    errorCallback('Cannot find element with ID ' + element);
	                }
	            } else {
	                errorCallback('Unknown element type: ' + element);
	            }
	        } else {
	            errorCallback('Unknown template value: ' + templateConfig);
	        }
	    }

	    function resolveViewModel(errorCallback, viewModelConfig, callback) {
	        if (typeof viewModelConfig === 'function') {
	            // Constructor - convert to standard factory function format
	            // By design, this does *not* supply componentInfo to the constructor, as the intent is that
	            // componentInfo contains non-viewmodel data (e.g., the component's element) that should only
	            // be used in factory functions, not viewmodel constructors.
	            callback(function (params /*, componentInfo */) {
	                return new viewModelConfig(params);
	            });
	        } else if (typeof viewModelConfig[createViewModelKey] === 'function') {
	            // Already a factory function - use it as-is
	            callback(viewModelConfig[createViewModelKey]);
	        } else if ('instance' in viewModelConfig) {
	            // Fixed object instance - promote to createViewModel format for API consistency
	            var fixedInstance = viewModelConfig['instance'];
	            callback(function (params, componentInfo) {
	                return fixedInstance;
	            });
	        } else if ('viewModel' in viewModelConfig) {
	            // Resolved AMD module whose value is of the form { viewModel: ... }
	            resolveViewModel(errorCallback, viewModelConfig['viewModel'], callback);
	        } else {
	            errorCallback('Unknown viewModel value: ' + viewModelConfig);
	        }
	    }

	    function cloneNodesFromTemplateSourceElement(elemInstance) {
	        switch (ko.utils.tagNameLower(elemInstance)) {
	            case 'script':
	                return ko.utils.parseHtmlFragment(elemInstance.text);
	            case 'textarea':
	                return ko.utils.parseHtmlFragment(elemInstance.value);
	            case 'template':
	                // For browsers with proper <template> element support (i.e., where the .content property
	                // gives a document fragment), use that document fragment.
	                if (isDocumentFragment(elemInstance.content)) {
	                    return ko.utils.cloneNodes(elemInstance.content.childNodes);
	                }
	        }

	        // Regular elements such as <div>, and <template> elements on old browsers that don't really
	        // understand <template> and just treat it as a regular container
	        return ko.utils.cloneNodes(elemInstance.childNodes);
	    }

	    function isDomElement(obj) {
	        if (window['HTMLElement']) {
	            return obj instanceof HTMLElement;
	        } else {
	            return obj && obj.tagName && obj.nodeType === 1;
	        }
	    }

	    function isDocumentFragment(obj) {
	        if (window['DocumentFragment']) {
	            return obj instanceof DocumentFragment;
	        } else {
	            return obj && obj.nodeType === 11;
	        }
	    }

	    function possiblyGetConfigFromAmd(errorCallback, config, callback) {
	        if (typeof config['require'] === 'string') {
	            // The config is the value of an AMD module
	            if (amdRequire || window['require']) {
	                (amdRequire || window['require'])([config['require']], callback);
	            } else {
	                errorCallback('Uses require, but no AMD loader is present');
	            }
	        } else {
	            callback(config);
	        }
	    }

	    function makeErrorCallback(componentName) {
	        return function (message) {
	            throw new Error('Component \'' + componentName + '\': ' + message);
	        };
	    }

	    ko.exportSymbol('components.register', ko.components.register);
	    ko.exportSymbol('components.isRegistered', ko.components.isRegistered);
	    ko.exportSymbol('components.unregister', ko.components.unregister);

	    // Expose the default loader so that developers can directly ask it for configuration
	    // or to resolve configuration
	    ko.exportSymbol('components.defaultLoader', ko.components.defaultLoader);

	    // By default, the default loader is the only registered component loader
	    ko.components['loaders'].push(ko.components.defaultLoader);

	    // Privately expose the underlying config registry for use in old-IE shim
	    ko.components._allRegisteredComponents = defaultConfigRegistry;
	})();
	(function (undefined) {
	    // Overridable API for determining which component name applies to a given node. By overriding this,
	    // you can for example map specific tagNames to components that are not preregistered.
	    ko.components['getComponentNameForNode'] = function(node) {
	        var tagNameLower = ko.utils.tagNameLower(node);
	        return ko.components.isRegistered(tagNameLower) && tagNameLower;
	    };

	    ko.components.addBindingsForCustomElement = function(allBindings, node, bindingContext, valueAccessors) {
	        // Determine if it's really a custom element matching a component
	        if (node.nodeType === 1) {
	            var componentName = ko.components['getComponentNameForNode'](node);
	            if (componentName) {
	                // It does represent a component, so add a component binding for it
	                allBindings = allBindings || {};

	                if (allBindings['component']) {
	                    // Avoid silently overwriting some other 'component' binding that may already be on the element
	                    throw new Error('Cannot use the "component" binding on a custom element matching a component');
	                }

	                var componentBindingValue = { 'name': componentName, 'params': getComponentParamsFromCustomElement(node, bindingContext) };

	                allBindings['component'] = valueAccessors
	                    ? function() { return componentBindingValue; }
	                    : componentBindingValue;
	            }
	        }

	        return allBindings;
	    }

	    var nativeBindingProviderInstance = new ko.bindingProvider();

	    function getComponentParamsFromCustomElement(elem, bindingContext) {
	        var paramsAttribute = elem.getAttribute('params');

	        if (paramsAttribute) {
	            var params = nativeBindingProviderInstance['parseBindingsString'](paramsAttribute, bindingContext, elem, { 'valueAccessors': true, 'bindingParams': true }),
	                rawParamComputedValues = ko.utils.objectMap(params, function(paramValue, paramName) {
	                    return ko.computed(paramValue, null, { disposeWhenNodeIsRemoved: elem });
	                }),
	                result = ko.utils.objectMap(rawParamComputedValues, function(paramValueComputed, paramName) {
	                    var paramValue = paramValueComputed.peek();
	                    // Does the evaluation of the parameter value unwrap any observables?
	                    if (!paramValueComputed.isActive()) {
	                        // No it doesn't, so there's no need for any computed wrapper. Just pass through the supplied value directly.
	                        // Example: "someVal: firstName, age: 123" (whether or not firstName is an observable/computed)
	                        return paramValue;
	                    } else {
	                        // Yes it does. Supply a computed property that unwraps both the outer (binding expression)
	                        // level of observability, and any inner (resulting model value) level of observability.
	                        // This means the component doesn't have to worry about multiple unwrapping. If the value is a
	                        // writable observable, the computed will also be writable and pass the value on to the observable.
	                        return ko.computed({
	                            'read': function() {
	                                return ko.utils.unwrapObservable(paramValueComputed());
	                            },
	                            'write': ko.isWriteableObservable(paramValue) && function(value) {
	                                paramValueComputed()(value);
	                            },
	                            disposeWhenNodeIsRemoved: elem
	                        });
	                    }
	                });

	            // Give access to the raw computeds, as long as that wouldn't overwrite any custom param also called '$raw'
	            // This is in case the developer wants to react to outer (binding) observability separately from inner
	            // (model value) observability, or in case the model value observable has subobservables.
	            if (!result.hasOwnProperty('$raw')) {
	                result['$raw'] = rawParamComputedValues;
	            }

	            return result;
	        } else {
	            // For consistency, absence of a "params" attribute is treated the same as the presence of
	            // any empty one. Otherwise component viewmodels need special code to check whether or not
	            // 'params' or 'params.$raw' is null/undefined before reading subproperties, which is annoying.
	            return { '$raw': {} };
	        }
	    }

	    // --------------------------------------------------------------------------------
	    // Compatibility code for older (pre-HTML5) IE browsers

	    if (ko.utils.ieVersion < 9) {
	        // Whenever you preregister a component, enable it as a custom element in the current document
	        ko.components['register'] = (function(originalFunction) {
	            return function(componentName) {
	                document.createElement(componentName); // Allows IE<9 to parse markup containing the custom element
	                return originalFunction.apply(this, arguments);
	            }
	        })(ko.components['register']);

	        // Whenever you create a document fragment, enable all preregistered component names as custom elements
	        // This is needed to make innerShiv/jQuery HTML parsing correctly handle the custom elements
	        document.createDocumentFragment = (function(originalFunction) {
	            return function() {
	                var newDocFrag = originalFunction(),
	                    allComponents = ko.components._allRegisteredComponents;
	                for (var componentName in allComponents) {
	                    if (allComponents.hasOwnProperty(componentName)) {
	                        newDocFrag.createElement(componentName);
	                    }
	                }
	                return newDocFrag;
	            };
	        })(document.createDocumentFragment);
	    }
	})();(function(undefined) {

	    var componentLoadingOperationUniqueId = 0;

	    ko.bindingHandlers['component'] = {
	        'init': function(element, valueAccessor, ignored1, ignored2, bindingContext) {
	            var currentViewModel,
	                currentLoadingOperationId,
	                disposeAssociatedComponentViewModel = function () {
	                    var currentViewModelDispose = currentViewModel && currentViewModel['dispose'];
	                    if (typeof currentViewModelDispose === 'function') {
	                        currentViewModelDispose.call(currentViewModel);
	                    }

	                    // Any in-flight loading operation is no longer relevant, so make sure we ignore its completion
	                    currentLoadingOperationId = null;
	                },
	                originalChildNodes = ko.utils.makeArray(ko.virtualElements.childNodes(element));

	            ko.utils.domNodeDisposal.addDisposeCallback(element, disposeAssociatedComponentViewModel);

	            ko.computed(function () {
	                var value = ko.utils.unwrapObservable(valueAccessor()),
	                    componentName, componentParams;

	                if (typeof value === 'string') {
	                    componentName = value;
	                } else {
	                    componentName = ko.utils.unwrapObservable(value['name']);
	                    componentParams = ko.utils.unwrapObservable(value['params']);
	                }

	                if (!componentName) {
	                    throw new Error('No component name specified');
	                }

	                var loadingOperationId = currentLoadingOperationId = ++componentLoadingOperationUniqueId;
	                ko.components.get(componentName, function(componentDefinition) {
	                    // If this is not the current load operation for this element, ignore it.
	                    if (currentLoadingOperationId !== loadingOperationId) {
	                        return;
	                    }

	                    // Clean up previous state
	                    disposeAssociatedComponentViewModel();

	                    // Instantiate and bind new component. Implicitly this cleans any old DOM nodes.
	                    if (!componentDefinition) {
	                        throw new Error('Unknown component \'' + componentName + '\'');
	                    }
	                    cloneTemplateIntoElement(componentName, componentDefinition, element);
	                    var componentViewModel = createViewModel(componentDefinition, element, originalChildNodes, componentParams),
	                        childBindingContext = bindingContext['createChildContext'](componentViewModel, /* dataItemAlias */ undefined, function(ctx) {
	                            ctx['$component'] = componentViewModel;
	                            ctx['$componentTemplateNodes'] = originalChildNodes;
	                        });
	                    currentViewModel = componentViewModel;
	                    ko.applyBindingsToDescendants(childBindingContext, element);
	                });
	            }, null, { disposeWhenNodeIsRemoved: element });

	            return { 'controlsDescendantBindings': true };
	        }
	    };

	    ko.virtualElements.allowedBindings['component'] = true;

	    function cloneTemplateIntoElement(componentName, componentDefinition, element) {
	        var template = componentDefinition['template'];
	        if (!template) {
	            throw new Error('Component \'' + componentName + '\' has no template');
	        }

	        var clonedNodesArray = ko.utils.cloneNodes(template);
	        ko.virtualElements.setDomNodeChildren(element, clonedNodesArray);
	    }

	    function createViewModel(componentDefinition, element, originalChildNodes, componentParams) {
	        var componentViewModelFactory = componentDefinition['createViewModel'];
	        return componentViewModelFactory
	            ? componentViewModelFactory.call(componentDefinition, componentParams, { 'element': element, 'templateNodes': originalChildNodes })
	            : componentParams; // Template-only component
	    }

	})();
	var attrHtmlToJavascriptMap = { 'class': 'className', 'for': 'htmlFor' };
	ko.bindingHandlers['attr'] = {
	    'update': function(element, valueAccessor, allBindings) {
	        var value = ko.utils.unwrapObservable(valueAccessor()) || {};
	        ko.utils.objectForEach(value, function(attrName, attrValue) {
	            attrValue = ko.utils.unwrapObservable(attrValue);

	            // To cover cases like "attr: { checked:someProp }", we want to remove the attribute entirely
	            // when someProp is a "no value"-like value (strictly null, false, or undefined)
	            // (because the absence of the "checked" attr is how to mark an element as not checked, etc.)
	            var toRemove = (attrValue === false) || (attrValue === null) || (attrValue === undefined);
	            if (toRemove)
	                element.removeAttribute(attrName);

	            // In IE <= 7 and IE8 Quirks Mode, you have to use the Javascript property name instead of the
	            // HTML attribute name for certain attributes. IE8 Standards Mode supports the correct behavior,
	            // but instead of figuring out the mode, we'll just set the attribute through the Javascript
	            // property for IE <= 8.
	            if (ko.utils.ieVersion <= 8 && attrName in attrHtmlToJavascriptMap) {
	                attrName = attrHtmlToJavascriptMap[attrName];
	                if (toRemove)
	                    element.removeAttribute(attrName);
	                else
	                    element[attrName] = attrValue;
	            } else if (!toRemove) {
	                element.setAttribute(attrName, attrValue.toString());
	            }

	            // Treat "name" specially - although you can think of it as an attribute, it also needs
	            // special handling on older versions of IE (https://github.com/SteveSanderson/knockout/pull/333)
	            // Deliberately being case-sensitive here because XHTML would regard "Name" as a different thing
	            // entirely, and there's no strong reason to allow for such casing in HTML.
	            if (attrName === "name") {
	                ko.utils.setElementName(element, toRemove ? "" : attrValue.toString());
	            }
	        });
	    }
	};
	(function() {

	ko.bindingHandlers['checked'] = {
	    'after': ['value', 'attr'],
	    'init': function (element, valueAccessor, allBindings) {
	        var checkedValue = ko.pureComputed(function() {
	            // Treat "value" like "checkedValue" when it is included with "checked" binding
	            if (allBindings['has']('checkedValue')) {
	                return ko.utils.unwrapObservable(allBindings.get('checkedValue'));
	            } else if (allBindings['has']('value')) {
	                return ko.utils.unwrapObservable(allBindings.get('value'));
	            }

	            return element.value;
	        });

	        function updateModel() {
	            // This updates the model value from the view value.
	            // It runs in response to DOM events (click) and changes in checkedValue.
	            var isChecked = element.checked,
	                elemValue = useCheckedValue ? checkedValue() : isChecked;

	            // When we're first setting up this computed, don't change any model state.
	            if (ko.computedContext.isInitial()) {
	                return;
	            }

	            // We can ignore unchecked radio buttons, because some other radio
	            // button will be getting checked, and that one can take care of updating state.
	            if (isRadio && !isChecked) {
	                return;
	            }

	            var modelValue = ko.dependencyDetection.ignore(valueAccessor);
	            if (isValueArray) {
	                if (oldElemValue !== elemValue) {
	                    // When we're responding to the checkedValue changing, and the element is
	                    // currently checked, replace the old elem value with the new elem value
	                    // in the model array.
	                    if (isChecked) {
	                        ko.utils.addOrRemoveItem(modelValue, elemValue, true);
	                        ko.utils.addOrRemoveItem(modelValue, oldElemValue, false);
	                    }

	                    oldElemValue = elemValue;
	                } else {
	                    // When we're responding to the user having checked/unchecked a checkbox,
	                    // add/remove the element value to the model array.
	                    ko.utils.addOrRemoveItem(modelValue, elemValue, isChecked);
	                }
	            } else {
	                ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'checked', elemValue, true);
	            }
	        };

	        function updateView() {
	            // This updates the view value from the model value.
	            // It runs in response to changes in the bound (checked) value.
	            var modelValue = ko.utils.unwrapObservable(valueAccessor());

	            if (isValueArray) {
	                // When a checkbox is bound to an array, being checked represents its value being present in that array
	                element.checked = ko.utils.arrayIndexOf(modelValue, checkedValue()) >= 0;
	            } else if (isCheckbox) {
	                // When a checkbox is bound to any other value (not an array), being checked represents the value being trueish
	                element.checked = modelValue;
	            } else {
	                // For radio buttons, being checked means that the radio button's value corresponds to the model value
	                element.checked = (checkedValue() === modelValue);
	            }
	        };

	        var isCheckbox = element.type == "checkbox",
	            isRadio = element.type == "radio";

	        // Only bind to check boxes and radio buttons
	        if (!isCheckbox && !isRadio) {
	            return;
	        }

	        var isValueArray = isCheckbox && (ko.utils.unwrapObservable(valueAccessor()) instanceof Array),
	            oldElemValue = isValueArray ? checkedValue() : undefined,
	            useCheckedValue = isRadio || isValueArray;

	        // IE 6 won't allow radio buttons to be selected unless they have a name
	        if (isRadio && !element.name)
	            ko.bindingHandlers['uniqueName']['init'](element, function() { return true });

	        // Set up two computeds to update the binding:

	        // The first responds to changes in the checkedValue value and to element clicks
	        ko.computed(updateModel, null, { disposeWhenNodeIsRemoved: element });
	        ko.utils.registerEventHandler(element, "click", updateModel);

	        // The second responds to changes in the model value (the one associated with the checked binding)
	        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
	    }
	};
	ko.expressionRewriting.twoWayBindings['checked'] = true;

	ko.bindingHandlers['checkedValue'] = {
	    'update': function (element, valueAccessor) {
	        element.value = ko.utils.unwrapObservable(valueAccessor());
	    }
	};

	})();var classesWrittenByBindingKey = '__ko__cssValue';
	ko.bindingHandlers['css'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        if (value !== null && typeof value == "object") {
	            ko.utils.objectForEach(value, function(className, shouldHaveClass) {
	                shouldHaveClass = ko.utils.unwrapObservable(shouldHaveClass);
	                ko.utils.toggleDomNodeCssClass(element, className, shouldHaveClass);
	            });
	        } else {
	            value = String(value || ''); // Make sure we don't try to store or set a non-string value
	            ko.utils.toggleDomNodeCssClass(element, element[classesWrittenByBindingKey], false);
	            element[classesWrittenByBindingKey] = value;
	            ko.utils.toggleDomNodeCssClass(element, value, true);
	        }
	    }
	};
	ko.bindingHandlers['enable'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        if (value && element.disabled)
	            element.removeAttribute("disabled");
	        else if ((!value) && (!element.disabled))
	            element.disabled = true;
	    }
	};

	ko.bindingHandlers['disable'] = {
	    'update': function (element, valueAccessor) {
	        ko.bindingHandlers['enable']['update'](element, function() { return !ko.utils.unwrapObservable(valueAccessor()) });
	    }
	};
	// For certain common events (currently just 'click'), allow a simplified data-binding syntax
	// e.g. click:handler instead of the usual full-length event:{click:handler}
	function makeEventHandlerShortcut(eventName) {
	    ko.bindingHandlers[eventName] = {
	        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var newValueAccessor = function () {
	                var result = {};
	                result[eventName] = valueAccessor();
	                return result;
	            };
	            return ko.bindingHandlers['event']['init'].call(this, element, newValueAccessor, allBindings, viewModel, bindingContext);
	        }
	    }
	}

	ko.bindingHandlers['event'] = {
	    'init' : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var eventsToHandle = valueAccessor() || {};
	        ko.utils.objectForEach(eventsToHandle, function(eventName) {
	            if (typeof eventName == "string") {
	                ko.utils.registerEventHandler(element, eventName, function (event) {
	                    var handlerReturnValue;
	                    var handlerFunction = valueAccessor()[eventName];
	                    if (!handlerFunction)
	                        return;

	                    try {
	                        // Take all the event args, and prefix with the viewmodel
	                        var argsForHandler = ko.utils.makeArray(arguments);
	                        viewModel = bindingContext['$data'];
	                        argsForHandler.unshift(viewModel);
	                        handlerReturnValue = handlerFunction.apply(viewModel, argsForHandler);
	                    } finally {
	                        if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
	                            if (event.preventDefault)
	                                event.preventDefault();
	                            else
	                                event.returnValue = false;
	                        }
	                    }

	                    var bubble = allBindings.get(eventName + 'Bubble') !== false;
	                    if (!bubble) {
	                        event.cancelBubble = true;
	                        if (event.stopPropagation)
	                            event.stopPropagation();
	                    }
	                });
	            }
	        });
	    }
	};
	// "foreach: someExpression" is equivalent to "template: { foreach: someExpression }"
	// "foreach: { data: someExpression, afterAdd: myfn }" is equivalent to "template: { foreach: someExpression, afterAdd: myfn }"
	ko.bindingHandlers['foreach'] = {
	    makeTemplateValueAccessor: function(valueAccessor) {
	        return function() {
	            var modelValue = valueAccessor(),
	                unwrappedValue = ko.utils.peekObservable(modelValue);    // Unwrap without setting a dependency here

	            // If unwrappedValue is the array, pass in the wrapped value on its own
	            // The value will be unwrapped and tracked within the template binding
	            // (See https://github.com/SteveSanderson/knockout/issues/523)
	            if ((!unwrappedValue) || typeof unwrappedValue.length == "number")
	                return { 'foreach': modelValue, 'templateEngine': ko.nativeTemplateEngine.instance };

	            // If unwrappedValue.data is the array, preserve all relevant options and unwrap again value so we get updates
	            ko.utils.unwrapObservable(modelValue);
	            return {
	                'foreach': unwrappedValue['data'],
	                'as': unwrappedValue['as'],
	                'includeDestroyed': unwrappedValue['includeDestroyed'],
	                'afterAdd': unwrappedValue['afterAdd'],
	                'beforeRemove': unwrappedValue['beforeRemove'],
	                'afterRender': unwrappedValue['afterRender'],
	                'beforeMove': unwrappedValue['beforeMove'],
	                'afterMove': unwrappedValue['afterMove'],
	                'templateEngine': ko.nativeTemplateEngine.instance
	            };
	        };
	    },
	    'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        return ko.bindingHandlers['template']['init'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor));
	    },
	    'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        return ko.bindingHandlers['template']['update'](element, ko.bindingHandlers['foreach'].makeTemplateValueAccessor(valueAccessor), allBindings, viewModel, bindingContext);
	    }
	};
	ko.expressionRewriting.bindingRewriteValidators['foreach'] = false; // Can't rewrite control flow bindings
	ko.virtualElements.allowedBindings['foreach'] = true;
	var hasfocusUpdatingProperty = '__ko_hasfocusUpdating';
	var hasfocusLastValue = '__ko_hasfocusLastValue';
	ko.bindingHandlers['hasfocus'] = {
	    'init': function(element, valueAccessor, allBindings) {
	        var handleElementFocusChange = function(isFocused) {
	            // Where possible, ignore which event was raised and determine focus state using activeElement,
	            // as this avoids phantom focus/blur events raised when changing tabs in modern browsers.
	            // However, not all KO-targeted browsers (Firefox 2) support activeElement. For those browsers,
	            // prevent a loss of focus when changing tabs/windows by setting a flag that prevents hasfocus
	            // from calling 'blur()' on the element when it loses focus.
	            // Discussion at https://github.com/SteveSanderson/knockout/pull/352
	            element[hasfocusUpdatingProperty] = true;
	            var ownerDoc = element.ownerDocument;
	            if ("activeElement" in ownerDoc) {
	                var active;
	                try {
	                    active = ownerDoc.activeElement;
	                } catch(e) {
	                    // IE9 throws if you access activeElement during page load (see issue #703)
	                    active = ownerDoc.body;
	                }
	                isFocused = (active === element);
	            }
	            var modelValue = valueAccessor();
	            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'hasfocus', isFocused, true);

	            //cache the latest value, so we can avoid unnecessarily calling focus/blur in the update function
	            element[hasfocusLastValue] = isFocused;
	            element[hasfocusUpdatingProperty] = false;
	        };
	        var handleElementFocusIn = handleElementFocusChange.bind(null, true);
	        var handleElementFocusOut = handleElementFocusChange.bind(null, false);

	        ko.utils.registerEventHandler(element, "focus", handleElementFocusIn);
	        ko.utils.registerEventHandler(element, "focusin", handleElementFocusIn); // For IE
	        ko.utils.registerEventHandler(element, "blur",  handleElementFocusOut);
	        ko.utils.registerEventHandler(element, "focusout",  handleElementFocusOut); // For IE
	    },
	    'update': function(element, valueAccessor) {
	        var value = !!ko.utils.unwrapObservable(valueAccessor()); //force boolean to compare with last value
	        if (!element[hasfocusUpdatingProperty] && element[hasfocusLastValue] !== value) {
	            value ? element.focus() : element.blur();
	            ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, value ? "focusin" : "focusout"]); // For IE, which doesn't reliably fire "focus" or "blur" events synchronously
	        }
	    }
	};
	ko.expressionRewriting.twoWayBindings['hasfocus'] = true;

	ko.bindingHandlers['hasFocus'] = ko.bindingHandlers['hasfocus']; // Make "hasFocus" an alias
	ko.expressionRewriting.twoWayBindings['hasFocus'] = true;
	ko.bindingHandlers['html'] = {
	    'init': function() {
	        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor) {
	        // setHtml will unwrap the value if needed
	        ko.utils.setHtml(element, valueAccessor());
	    }
	};
	// Makes a binding like with or if
	function makeWithIfBinding(bindingKey, isWith, isNot, makeContextCallback) {
	    ko.bindingHandlers[bindingKey] = {
	        'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var didDisplayOnLastUpdate,
	                savedNodes;
	            ko.computed(function() {
	                var dataValue = ko.utils.unwrapObservable(valueAccessor()),
	                    shouldDisplay = !isNot !== !dataValue, // equivalent to isNot ? !dataValue : !!dataValue
	                    isFirstRender = !savedNodes,
	                    needsRefresh = isFirstRender || isWith || (shouldDisplay !== didDisplayOnLastUpdate);

	                if (needsRefresh) {
	                    // Save a copy of the inner nodes on the initial update, but only if we have dependencies.
	                    if (isFirstRender && ko.computedContext.getDependenciesCount()) {
	                        savedNodes = ko.utils.cloneNodes(ko.virtualElements.childNodes(element), true /* shouldCleanNodes */);
	                    }

	                    if (shouldDisplay) {
	                        if (!isFirstRender) {
	                            ko.virtualElements.setDomNodeChildren(element, ko.utils.cloneNodes(savedNodes));
	                        }
	                        ko.applyBindingsToDescendants(makeContextCallback ? makeContextCallback(bindingContext, dataValue) : bindingContext, element);
	                    } else {
	                        ko.virtualElements.emptyNode(element);
	                    }

	                    didDisplayOnLastUpdate = shouldDisplay;
	                }
	            }, null, { disposeWhenNodeIsRemoved: element });
	            return { 'controlsDescendantBindings': true };
	        }
	    };
	    ko.expressionRewriting.bindingRewriteValidators[bindingKey] = false; // Can't rewrite control flow bindings
	    ko.virtualElements.allowedBindings[bindingKey] = true;
	}

	// Construct the actual binding handlers
	makeWithIfBinding('if');
	makeWithIfBinding('ifnot', false /* isWith */, true /* isNot */);
	makeWithIfBinding('with', true /* isWith */, false /* isNot */,
	    function(bindingContext, dataValue) {
	        return bindingContext['createChildContext'](dataValue);
	    }
	);
	var captionPlaceholder = {};
	ko.bindingHandlers['options'] = {
	    'init': function(element) {
	        if (ko.utils.tagNameLower(element) !== "select")
	            throw new Error("options binding applies only to SELECT elements");

	        // Remove all existing <option>s.
	        while (element.length > 0) {
	            element.remove(0);
	        }

	        // Ensures that the binding processor doesn't try to bind the options
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor, allBindings) {
	        function selectedOptions() {
	            return ko.utils.arrayFilter(element.options, function (node) { return node.selected; });
	        }

	        var selectWasPreviouslyEmpty = element.length == 0,
	            multiple = element.multiple,
	            previousScrollTop = (!selectWasPreviouslyEmpty && multiple) ? element.scrollTop : null,
	            unwrappedArray = ko.utils.unwrapObservable(valueAccessor()),
	            valueAllowUnset = allBindings.get('valueAllowUnset') && allBindings['has']('value'),
	            includeDestroyed = allBindings.get('optionsIncludeDestroyed'),
	            arrayToDomNodeChildrenOptions = {},
	            captionValue,
	            filteredArray,
	            previousSelectedValues = [];

	        if (!valueAllowUnset) {
	            if (multiple) {
	                previousSelectedValues = ko.utils.arrayMap(selectedOptions(), ko.selectExtensions.readValue);
	            } else if (element.selectedIndex >= 0) {
	                previousSelectedValues.push(ko.selectExtensions.readValue(element.options[element.selectedIndex]));
	            }
	        }

	        if (unwrappedArray) {
	            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
	                unwrappedArray = [unwrappedArray];

	            // Filter out any entries marked as destroyed
	            filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
	                return includeDestroyed || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
	            });

	            // If caption is included, add it to the array
	            if (allBindings['has']('optionsCaption')) {
	                captionValue = ko.utils.unwrapObservable(allBindings.get('optionsCaption'));
	                // If caption value is null or undefined, don't show a caption
	                if (captionValue !== null && captionValue !== undefined) {
	                    filteredArray.unshift(captionPlaceholder);
	                }
	            }
	        } else {
	            // If a falsy value is provided (e.g. null), we'll simply empty the select element
	        }

	        function applyToObject(object, predicate, defaultValue) {
	            var predicateType = typeof predicate;
	            if (predicateType == "function")    // Given a function; run it against the data value
	                return predicate(object);
	            else if (predicateType == "string") // Given a string; treat it as a property name on the data value
	                return object[predicate];
	            else                                // Given no optionsText arg; use the data value itself
	                return defaultValue;
	        }

	        // The following functions can run at two different times:
	        // The first is when the whole array is being updated directly from this binding handler.
	        // The second is when an observable value for a specific array entry is updated.
	        // oldOptions will be empty in the first case, but will be filled with the previously generated option in the second.
	        var itemUpdate = false;
	        function optionForArrayItem(arrayEntry, index, oldOptions) {
	            if (oldOptions.length) {
	                previousSelectedValues = !valueAllowUnset && oldOptions[0].selected ? [ ko.selectExtensions.readValue(oldOptions[0]) ] : [];
	                itemUpdate = true;
	            }
	            var option = element.ownerDocument.createElement("option");
	            if (arrayEntry === captionPlaceholder) {
	                ko.utils.setTextContent(option, allBindings.get('optionsCaption'));
	                ko.selectExtensions.writeValue(option, undefined);
	            } else {
	                // Apply a value to the option element
	                var optionValue = applyToObject(arrayEntry, allBindings.get('optionsValue'), arrayEntry);
	                ko.selectExtensions.writeValue(option, ko.utils.unwrapObservable(optionValue));

	                // Apply some text to the option element
	                var optionText = applyToObject(arrayEntry, allBindings.get('optionsText'), optionValue);
	                ko.utils.setTextContent(option, optionText);
	            }
	            return [option];
	        }

	        // By using a beforeRemove callback, we delay the removal until after new items are added. This fixes a selection
	        // problem in IE<=8 and Firefox. See https://github.com/knockout/knockout/issues/1208
	        arrayToDomNodeChildrenOptions['beforeRemove'] =
	            function (option) {
	                element.removeChild(option);
	            };

	        function setSelectionCallback(arrayEntry, newOptions) {
	            if (itemUpdate && valueAllowUnset) {
	                // The model value is authoritative, so make sure its value is the one selected
	                // There is no need to use dependencyDetection.ignore since setDomNodeChildrenFromArrayMapping does so already.
	                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
	            } else if (previousSelectedValues.length) {
	                // IE6 doesn't like us to assign selection to OPTION nodes before they're added to the document.
	                // That's why we first added them without selection. Now it's time to set the selection.
	                var isSelected = ko.utils.arrayIndexOf(previousSelectedValues, ko.selectExtensions.readValue(newOptions[0])) >= 0;
	                ko.utils.setOptionNodeSelectionState(newOptions[0], isSelected);

	                // If this option was changed from being selected during a single-item update, notify the change
	                if (itemUpdate && !isSelected) {
	                    ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
	                }
	            }
	        }

	        var callback = setSelectionCallback;
	        if (allBindings['has']('optionsAfterRender') && typeof allBindings.get('optionsAfterRender') == "function") {
	            callback = function(arrayEntry, newOptions) {
	                setSelectionCallback(arrayEntry, newOptions);
	                ko.dependencyDetection.ignore(allBindings.get('optionsAfterRender'), null, [newOptions[0], arrayEntry !== captionPlaceholder ? arrayEntry : undefined]);
	            }
	        }

	        ko.utils.setDomNodeChildrenFromArrayMapping(element, filteredArray, optionForArrayItem, arrayToDomNodeChildrenOptions, callback);

	        ko.dependencyDetection.ignore(function () {
	            if (valueAllowUnset) {
	                // The model value is authoritative, so make sure its value is the one selected
	                ko.selectExtensions.writeValue(element, ko.utils.unwrapObservable(allBindings.get('value')), true /* allowUnset */);
	            } else {
	                // Determine if the selection has changed as a result of updating the options list
	                var selectionChanged;
	                if (multiple) {
	                    // For a multiple-select box, compare the new selection count to the previous one
	                    // But if nothing was selected before, the selection can't have changed
	                    selectionChanged = previousSelectedValues.length && selectedOptions().length < previousSelectedValues.length;
	                } else {
	                    // For a single-select box, compare the current value to the previous value
	                    // But if nothing was selected before or nothing is selected now, just look for a change in selection
	                    selectionChanged = (previousSelectedValues.length && element.selectedIndex >= 0)
	                        ? (ko.selectExtensions.readValue(element.options[element.selectedIndex]) !== previousSelectedValues[0])
	                        : (previousSelectedValues.length || element.selectedIndex >= 0);
	                }

	                // Ensure consistency between model value and selected option.
	                // If the dropdown was changed so that selection is no longer the same,
	                // notify the value or selectedOptions binding.
	                if (selectionChanged) {
	                    ko.utils.triggerEvent(element, "change");
	                }
	            }
	        });

	        // Workaround for IE bug
	        ko.utils.ensureSelectElementIsRenderedCorrectly(element);

	        if (previousScrollTop && Math.abs(previousScrollTop - element.scrollTop) > 20)
	            element.scrollTop = previousScrollTop;
	    }
	};
	ko.bindingHandlers['options'].optionValueDomDataKey = ko.utils.domData.nextKey();
	ko.bindingHandlers['selectedOptions'] = {
	    'after': ['options', 'foreach'],
	    'init': function (element, valueAccessor, allBindings) {
	        ko.utils.registerEventHandler(element, "change", function () {
	            var value = valueAccessor(), valueToWrite = [];
	            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
	                if (node.selected)
	                    valueToWrite.push(ko.selectExtensions.readValue(node));
	            });
	            ko.expressionRewriting.writeValueToProperty(value, allBindings, 'selectedOptions', valueToWrite);
	        });
	    },
	    'update': function (element, valueAccessor) {
	        if (ko.utils.tagNameLower(element) != "select")
	            throw new Error("values binding applies only to SELECT elements");

	        var newValue = ko.utils.unwrapObservable(valueAccessor());
	        if (newValue && typeof newValue.length == "number") {
	            ko.utils.arrayForEach(element.getElementsByTagName("option"), function(node) {
	                var isSelected = ko.utils.arrayIndexOf(newValue, ko.selectExtensions.readValue(node)) >= 0;
	                ko.utils.setOptionNodeSelectionState(node, isSelected);
	            });
	        }
	    }
	};
	ko.expressionRewriting.twoWayBindings['selectedOptions'] = true;
	ko.bindingHandlers['style'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor() || {});
	        ko.utils.objectForEach(value, function(styleName, styleValue) {
	            styleValue = ko.utils.unwrapObservable(styleValue);

	            if (styleValue === null || styleValue === undefined || styleValue === false) {
	                // Empty string removes the value, whereas null/undefined have no effect
	                styleValue = "";
	            }

	            element.style[styleName] = styleValue;
	        });
	    }
	};
	ko.bindingHandlers['submit'] = {
	    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        if (typeof valueAccessor() != "function")
	            throw new Error("The value for a submit binding must be a function");
	        ko.utils.registerEventHandler(element, "submit", function (event) {
	            var handlerReturnValue;
	            var value = valueAccessor();
	            try { handlerReturnValue = value.call(bindingContext['$data'], element); }
	            finally {
	                if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
	                    if (event.preventDefault)
	                        event.preventDefault();
	                    else
	                        event.returnValue = false;
	                }
	            }
	        });
	    }
	};
	ko.bindingHandlers['text'] = {
	    'init': function() {
	        // Prevent binding on the dynamically-injected text node (as developers are unlikely to expect that, and it has security implications).
	        // It should also make things faster, as we no longer have to consider whether the text node might be bindable.
	        return { 'controlsDescendantBindings': true };
	    },
	    'update': function (element, valueAccessor) {
	        ko.utils.setTextContent(element, valueAccessor());
	    }
	};
	ko.virtualElements.allowedBindings['text'] = true;
	(function () {

	if (window && window.navigator) {
	    var parseVersion = function (matches) {
	        if (matches) {
	            return parseFloat(matches[1]);
	        }
	    };

	    // Detect various browser versions because some old versions don't fully support the 'input' event
	    var operaVersion = window.opera && window.opera.version && parseInt(window.opera.version()),
	        userAgent = window.navigator.userAgent,
	        safariVersion = parseVersion(userAgent.match(/^(?:(?!chrome).)*version\/([^ ]*) safari/i)),
	        firefoxVersion = parseVersion(userAgent.match(/Firefox\/([^ ]*)/));
	}

	// IE 8 and 9 have bugs that prevent the normal events from firing when the value changes.
	// But it does fire the 'selectionchange' event on many of those, presumably because the
	// cursor is moving and that counts as the selection changing. The 'selectionchange' event is
	// fired at the document level only and doesn't directly indicate which element changed. We
	// set up just one event handler for the document and use 'activeElement' to determine which
	// element was changed.
	if (ko.utils.ieVersion < 10) {
	    var selectionChangeRegisteredName = ko.utils.domData.nextKey(),
	        selectionChangeHandlerName = ko.utils.domData.nextKey();
	    var selectionChangeHandler = function(event) {
	        var target = this.activeElement,
	            handler = target && ko.utils.domData.get(target, selectionChangeHandlerName);
	        if (handler) {
	            handler(event);
	        }
	    };
	    var registerForSelectionChangeEvent = function (element, handler) {
	        var ownerDoc = element.ownerDocument;
	        if (!ko.utils.domData.get(ownerDoc, selectionChangeRegisteredName)) {
	            ko.utils.domData.set(ownerDoc, selectionChangeRegisteredName, true);
	            ko.utils.registerEventHandler(ownerDoc, 'selectionchange', selectionChangeHandler);
	        }
	        ko.utils.domData.set(element, selectionChangeHandlerName, handler);
	    };
	}

	ko.bindingHandlers['textInput'] = {
	    'init': function (element, valueAccessor, allBindings) {

	        var previousElementValue = element.value,
	            timeoutHandle,
	            elementValueBeforeEvent;

	        var updateModel = function (event) {
	            clearTimeout(timeoutHandle);
	            elementValueBeforeEvent = timeoutHandle = undefined;

	            var elementValue = element.value;
	            if (previousElementValue !== elementValue) {
	                // Provide a way for tests to know exactly which event was processed
	                if (DEBUG && event) element['_ko_textInputProcessedEvent'] = event.type;
	                previousElementValue = elementValue;
	                ko.expressionRewriting.writeValueToProperty(valueAccessor(), allBindings, 'textInput', elementValue);
	            }
	        };

	        var deferUpdateModel = function (event) {
	            if (!timeoutHandle) {
	                // The elementValueBeforeEvent variable is set *only* during the brief gap between an
	                // event firing and the updateModel function running. This allows us to ignore model
	                // updates that are from the previous state of the element, usually due to techniques
	                // such as rateLimit. Such updates, if not ignored, can cause keystrokes to be lost.
	                elementValueBeforeEvent = element.value;
	                var handler = DEBUG ? updateModel.bind(element, {type: event.type}) : updateModel;
	                timeoutHandle = setTimeout(handler, 4);
	            }
	        };

	        var updateView = function () {
	            var modelValue = ko.utils.unwrapObservable(valueAccessor());

	            if (modelValue === null || modelValue === undefined) {
	                modelValue = '';
	            }

	            if (elementValueBeforeEvent !== undefined && modelValue === elementValueBeforeEvent) {
	                setTimeout(updateView, 4);
	                return;
	            }

	            // Update the element only if the element and model are different. On some browsers, updating the value
	            // will move the cursor to the end of the input, which would be bad while the user is typing.
	            if (element.value !== modelValue) {
	                previousElementValue = modelValue;  // Make sure we ignore events (propertychange) that result from updating the value
	                element.value = modelValue;
	            }
	        };

	        var onEvent = function (event, handler) {
	            ko.utils.registerEventHandler(element, event, handler);
	        };

	        if (DEBUG && ko.bindingHandlers['textInput']['_forceUpdateOn']) {
	            // Provide a way for tests to specify exactly which events are bound
	            ko.utils.arrayForEach(ko.bindingHandlers['textInput']['_forceUpdateOn'], function(eventName) {
	                if (eventName.slice(0,5) == 'after') {
	                    onEvent(eventName.slice(5), deferUpdateModel);
	                } else {
	                    onEvent(eventName, updateModel);
	                }
	            });
	        } else {
	            if (ko.utils.ieVersion < 10) {
	                // Internet Explorer <= 8 doesn't support the 'input' event, but does include 'propertychange' that fires whenever
	                // any property of an element changes. Unlike 'input', it also fires if a property is changed from JavaScript code,
	                // but that's an acceptable compromise for this binding. IE 9 does support 'input', but since it doesn't fire it
	                // when using autocomplete, we'll use 'propertychange' for it also.
	                onEvent('propertychange', function(event) {
	                    if (event.propertyName === 'value') {
	                        updateModel(event);
	                    }
	                });

	                if (ko.utils.ieVersion == 8) {
	                    // IE 8 has a bug where it fails to fire 'propertychange' on the first update following a value change from
	                    // JavaScript code. It also doesn't fire if you clear the entire value. To fix this, we bind to the following
	                    // events too.
	                    onEvent('keyup', updateModel);      // A single keystoke
	                    onEvent('keydown', updateModel);    // The first character when a key is held down
	                }
	                if (ko.utils.ieVersion >= 8) {
	                    // Internet Explorer 9 doesn't fire the 'input' event when deleting text, including using
	                    // the backspace, delete, or ctrl-x keys, clicking the 'x' to clear the input, dragging text
	                    // out of the field, and cutting or deleting text using the context menu. 'selectionchange'
	                    // can detect all of those except dragging text out of the field, for which we use 'dragend'.
	                    // These are also needed in IE8 because of the bug described above.
	                    registerForSelectionChangeEvent(element, updateModel);  // 'selectionchange' covers cut, paste, drop, delete, etc.
	                    onEvent('dragend', deferUpdateModel);
	                }
	            } else {
	                // All other supported browsers support the 'input' event, which fires whenever the content of the element is changed
	                // through the user interface.
	                onEvent('input', updateModel);

	                if (safariVersion < 5 && ko.utils.tagNameLower(element) === "textarea") {
	                    // Safari <5 doesn't fire the 'input' event for <textarea> elements (it does fire 'textInput'
	                    // but only when typing). So we'll just catch as much as we can with keydown, cut, and paste.
	                    onEvent('keydown', deferUpdateModel);
	                    onEvent('paste', deferUpdateModel);
	                    onEvent('cut', deferUpdateModel);
	                } else if (operaVersion < 11) {
	                    // Opera 10 doesn't always fire the 'input' event for cut, paste, undo & drop operations.
	                    // We can try to catch some of those using 'keydown'.
	                    onEvent('keydown', deferUpdateModel);
	                } else if (firefoxVersion < 4.0) {
	                    // Firefox <= 3.6 doesn't fire the 'input' event when text is filled in through autocomplete
	                    onEvent('DOMAutoComplete', updateModel);

	                    // Firefox <=3.5 doesn't fire the 'input' event when text is dropped into the input.
	                    onEvent('dragdrop', updateModel);       // <3.5
	                    onEvent('drop', updateModel);           // 3.5
	                }
	            }
	        }

	        // Bind to the change event so that we can catch programmatic updates of the value that fire this event.
	        onEvent('change', updateModel);

	        ko.computed(updateView, null, { disposeWhenNodeIsRemoved: element });
	    }
	};
	ko.expressionRewriting.twoWayBindings['textInput'] = true;

	// textinput is an alias for textInput
	ko.bindingHandlers['textinput'] = {
	    // preprocess is the only way to set up a full alias
	    'preprocess': function (value, name, addBinding) {
	        addBinding('textInput', value);
	    }
	};

	})();ko.bindingHandlers['uniqueName'] = {
	    'init': function (element, valueAccessor) {
	        if (valueAccessor()) {
	            var name = "ko_unique_" + (++ko.bindingHandlers['uniqueName'].currentIndex);
	            ko.utils.setElementName(element, name);
	        }
	    }
	};
	ko.bindingHandlers['uniqueName'].currentIndex = 0;
	ko.bindingHandlers['value'] = {
	    'after': ['options', 'foreach'],
	    'init': function (element, valueAccessor, allBindings) {
	        // If the value binding is placed on a radio/checkbox, then just pass through to checkedValue and quit
	        if (element.tagName.toLowerCase() == "input" && (element.type == "checkbox" || element.type == "radio")) {
	            ko.applyBindingAccessorsToNode(element, { 'checkedValue': valueAccessor });
	            return;
	        }

	        // Always catch "change" event; possibly other events too if asked
	        var eventsToCatch = ["change"];
	        var requestedEventsToCatch = allBindings.get("valueUpdate");
	        var propertyChangedFired = false;
	        var elementValueBeforeEvent = null;

	        if (requestedEventsToCatch) {
	            if (typeof requestedEventsToCatch == "string") // Allow both individual event names, and arrays of event names
	                requestedEventsToCatch = [requestedEventsToCatch];
	            ko.utils.arrayPushAll(eventsToCatch, requestedEventsToCatch);
	            eventsToCatch = ko.utils.arrayGetDistinctValues(eventsToCatch);
	        }

	        var valueUpdateHandler = function() {
	            elementValueBeforeEvent = null;
	            propertyChangedFired = false;
	            var modelValue = valueAccessor();
	            var elementValue = ko.selectExtensions.readValue(element);
	            ko.expressionRewriting.writeValueToProperty(modelValue, allBindings, 'value', elementValue);
	        }

	        // Workaround for https://github.com/SteveSanderson/knockout/issues/122
	        // IE doesn't fire "change" events on textboxes if the user selects a value from its autocomplete list
	        var ieAutoCompleteHackNeeded = ko.utils.ieVersion && element.tagName.toLowerCase() == "input" && element.type == "text"
	                                       && element.autocomplete != "off" && (!element.form || element.form.autocomplete != "off");
	        if (ieAutoCompleteHackNeeded && ko.utils.arrayIndexOf(eventsToCatch, "propertychange") == -1) {
	            ko.utils.registerEventHandler(element, "propertychange", function () { propertyChangedFired = true });
	            ko.utils.registerEventHandler(element, "focus", function () { propertyChangedFired = false });
	            ko.utils.registerEventHandler(element, "blur", function() {
	                if (propertyChangedFired) {
	                    valueUpdateHandler();
	                }
	            });
	        }

	        ko.utils.arrayForEach(eventsToCatch, function(eventName) {
	            // The syntax "after<eventname>" means "run the handler asynchronously after the event"
	            // This is useful, for example, to catch "keydown" events after the browser has updated the control
	            // (otherwise, ko.selectExtensions.readValue(this) will receive the control's value *before* the key event)
	            var handler = valueUpdateHandler;
	            if (ko.utils.stringStartsWith(eventName, "after")) {
	                handler = function() {
	                    // The elementValueBeforeEvent variable is non-null *only* during the brief gap between
	                    // a keyX event firing and the valueUpdateHandler running, which is scheduled to happen
	                    // at the earliest asynchronous opportunity. We store this temporary information so that
	                    // if, between keyX and valueUpdateHandler, the underlying model value changes separately,
	                    // we can overwrite that model value change with the value the user just typed. Otherwise,
	                    // techniques like rateLimit can trigger model changes at critical moments that will
	                    // override the user's inputs, causing keystrokes to be lost.
	                    elementValueBeforeEvent = ko.selectExtensions.readValue(element);
	                    setTimeout(valueUpdateHandler, 0);
	                };
	                eventName = eventName.substring("after".length);
	            }
	            ko.utils.registerEventHandler(element, eventName, handler);
	        });

	        var updateFromModel = function () {
	            var newValue = ko.utils.unwrapObservable(valueAccessor());
	            var elementValue = ko.selectExtensions.readValue(element);

	            if (elementValueBeforeEvent !== null && newValue === elementValueBeforeEvent) {
	                setTimeout(updateFromModel, 0);
	                return;
	            }

	            var valueHasChanged = (newValue !== elementValue);

	            if (valueHasChanged) {
	                if (ko.utils.tagNameLower(element) === "select") {
	                    var allowUnset = allBindings.get('valueAllowUnset');
	                    var applyValueAction = function () {
	                        ko.selectExtensions.writeValue(element, newValue, allowUnset);
	                    };
	                    applyValueAction();

	                    if (!allowUnset && newValue !== ko.selectExtensions.readValue(element)) {
	                        // If you try to set a model value that can't be represented in an already-populated dropdown, reject that change,
	                        // because you're not allowed to have a model value that disagrees with a visible UI selection.
	                        ko.dependencyDetection.ignore(ko.utils.triggerEvent, null, [element, "change"]);
	                    } else {
	                        // Workaround for IE6 bug: It won't reliably apply values to SELECT nodes during the same execution thread
	                        // right after you've changed the set of OPTION nodes on it. So for that node type, we'll schedule a second thread
	                        // to apply the value as well.
	                        setTimeout(applyValueAction, 0);
	                    }
	                } else {
	                    ko.selectExtensions.writeValue(element, newValue);
	                }
	            }
	        };

	        ko.computed(updateFromModel, null, { disposeWhenNodeIsRemoved: element });
	    },
	    'update': function() {} // Keep for backwards compatibility with code that may have wrapped value binding
	};
	ko.expressionRewriting.twoWayBindings['value'] = true;
	ko.bindingHandlers['visible'] = {
	    'update': function (element, valueAccessor) {
	        var value = ko.utils.unwrapObservable(valueAccessor());
	        var isCurrentlyVisible = !(element.style.display == "none");
	        if (value && !isCurrentlyVisible)
	            element.style.display = "";
	        else if ((!value) && isCurrentlyVisible)
	            element.style.display = "none";
	    }
	};
	// 'click' is just a shorthand for the usual full-length event:{click:handler}
	makeEventHandlerShortcut('click');
	// If you want to make a custom template engine,
	//
	// [1] Inherit from this class (like ko.nativeTemplateEngine does)
	// [2] Override 'renderTemplateSource', supplying a function with this signature:
	//
	//        function (templateSource, bindingContext, options) {
	//            // - templateSource.text() is the text of the template you should render
	//            // - bindingContext.$data is the data you should pass into the template
	//            //   - you might also want to make bindingContext.$parent, bindingContext.$parents,
	//            //     and bindingContext.$root available in the template too
	//            // - options gives you access to any other properties set on "data-bind: { template: options }"
	//            // - templateDocument is the document object of the template
	//            //
	//            // Return value: an array of DOM nodes
	//        }
	//
	// [3] Override 'createJavaScriptEvaluatorBlock', supplying a function with this signature:
	//
	//        function (script) {
	//            // Return value: Whatever syntax means "Evaluate the JavaScript statement 'script' and output the result"
	//            //               For example, the jquery.tmpl template engine converts 'someScript' to '${ someScript }'
	//        }
	//
	//     This is only necessary if you want to allow data-bind attributes to reference arbitrary template variables.
	//     If you don't want to allow that, you can set the property 'allowTemplateRewriting' to false (like ko.nativeTemplateEngine does)
	//     and then you don't need to override 'createJavaScriptEvaluatorBlock'.

	ko.templateEngine = function () { };

	ko.templateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
	    throw new Error("Override renderTemplateSource");
	};

	ko.templateEngine.prototype['createJavaScriptEvaluatorBlock'] = function (script) {
	    throw new Error("Override createJavaScriptEvaluatorBlock");
	};

	ko.templateEngine.prototype['makeTemplateSource'] = function(template, templateDocument) {
	    // Named template
	    if (typeof template == "string") {
	        templateDocument = templateDocument || document;
	        var elem = templateDocument.getElementById(template);
	        if (!elem)
	            throw new Error("Cannot find template with ID " + template);
	        return new ko.templateSources.domElement(elem);
	    } else if ((template.nodeType == 1) || (template.nodeType == 8)) {
	        // Anonymous template
	        return new ko.templateSources.anonymousTemplate(template);
	    } else
	        throw new Error("Unknown template type: " + template);
	};

	ko.templateEngine.prototype['renderTemplate'] = function (template, bindingContext, options, templateDocument) {
	    var templateSource = this['makeTemplateSource'](template, templateDocument);
	    return this['renderTemplateSource'](templateSource, bindingContext, options, templateDocument);
	};

	ko.templateEngine.prototype['isTemplateRewritten'] = function (template, templateDocument) {
	    // Skip rewriting if requested
	    if (this['allowTemplateRewriting'] === false)
	        return true;
	    return this['makeTemplateSource'](template, templateDocument)['data']("isRewritten");
	};

	ko.templateEngine.prototype['rewriteTemplate'] = function (template, rewriterCallback, templateDocument) {
	    var templateSource = this['makeTemplateSource'](template, templateDocument);
	    var rewritten = rewriterCallback(templateSource['text']());
	    templateSource['text'](rewritten);
	    templateSource['data']("isRewritten", true);
	};

	ko.exportSymbol('templateEngine', ko.templateEngine);

	ko.templateRewriting = (function () {
	    var memoizeDataBindingAttributeSyntaxRegex = /(<([a-z]+\d*)(?:\s+(?!data-bind\s*=\s*)[a-z0-9\-]+(?:=(?:\"[^\"]*\"|\'[^\']*\'|[^>]*))?)*\s+)data-bind\s*=\s*(["'])([\s\S]*?)\3/gi;
	    var memoizeVirtualContainerBindingSyntaxRegex = /<!--\s*ko\b\s*([\s\S]*?)\s*-->/g;

	    function validateDataBindValuesForRewriting(keyValueArray) {
	        var allValidators = ko.expressionRewriting.bindingRewriteValidators;
	        for (var i = 0; i < keyValueArray.length; i++) {
	            var key = keyValueArray[i]['key'];
	            if (allValidators.hasOwnProperty(key)) {
	                var validator = allValidators[key];

	                if (typeof validator === "function") {
	                    var possibleErrorMessage = validator(keyValueArray[i]['value']);
	                    if (possibleErrorMessage)
	                        throw new Error(possibleErrorMessage);
	                } else if (!validator) {
	                    throw new Error("This template engine does not support the '" + key + "' binding within its templates");
	                }
	            }
	        }
	    }

	    function constructMemoizedTagReplacement(dataBindAttributeValue, tagToRetain, nodeName, templateEngine) {
	        var dataBindKeyValueArray = ko.expressionRewriting.parseObjectLiteral(dataBindAttributeValue);
	        validateDataBindValuesForRewriting(dataBindKeyValueArray);
	        var rewrittenDataBindAttributeValue = ko.expressionRewriting.preProcessBindings(dataBindKeyValueArray, {'valueAccessors':true});

	        // For no obvious reason, Opera fails to evaluate rewrittenDataBindAttributeValue unless it's wrapped in an additional
	        // anonymous function, even though Opera's built-in debugger can evaluate it anyway. No other browser requires this
	        // extra indirection.
	        var applyBindingsToNextSiblingScript =
	            "ko.__tr_ambtns(function($context,$element){return(function(){return{ " + rewrittenDataBindAttributeValue + " } })()},'" + nodeName.toLowerCase() + "')";
	        return templateEngine['createJavaScriptEvaluatorBlock'](applyBindingsToNextSiblingScript) + tagToRetain;
	    }

	    return {
	        ensureTemplateIsRewritten: function (template, templateEngine, templateDocument) {
	            if (!templateEngine['isTemplateRewritten'](template, templateDocument))
	                templateEngine['rewriteTemplate'](template, function (htmlString) {
	                    return ko.templateRewriting.memoizeBindingAttributeSyntax(htmlString, templateEngine);
	                }, templateDocument);
	        },

	        memoizeBindingAttributeSyntax: function (htmlString, templateEngine) {
	            return htmlString.replace(memoizeDataBindingAttributeSyntaxRegex, function () {
	                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[4], /* tagToRetain: */ arguments[1], /* nodeName: */ arguments[2], templateEngine);
	            }).replace(memoizeVirtualContainerBindingSyntaxRegex, function() {
	                return constructMemoizedTagReplacement(/* dataBindAttributeValue: */ arguments[1], /* tagToRetain: */ "<!-- ko -->", /* nodeName: */ "#comment", templateEngine);
	            });
	        },

	        applyMemoizedBindingsToNextSibling: function (bindings, nodeName) {
	            return ko.memoization.memoize(function (domNode, bindingContext) {
	                var nodeToBind = domNode.nextSibling;
	                if (nodeToBind && nodeToBind.nodeName.toLowerCase() === nodeName) {
	                    ko.applyBindingAccessorsToNode(nodeToBind, bindings, bindingContext);
	                }
	            });
	        }
	    }
	})();


	// Exported only because it has to be referenced by string lookup from within rewritten template
	ko.exportSymbol('__tr_ambtns', ko.templateRewriting.applyMemoizedBindingsToNextSibling);
	(function() {
	    // A template source represents a read/write way of accessing a template. This is to eliminate the need for template loading/saving
	    // logic to be duplicated in every template engine (and means they can all work with anonymous templates, etc.)
	    //
	    // Two are provided by default:
	    //  1. ko.templateSources.domElement       - reads/writes the text content of an arbitrary DOM element
	    //  2. ko.templateSources.anonymousElement - uses ko.utils.domData to read/write text *associated* with the DOM element, but
	    //                                           without reading/writing the actual element text content, since it will be overwritten
	    //                                           with the rendered template output.
	    // You can implement your own template source if you want to fetch/store templates somewhere other than in DOM elements.
	    // Template sources need to have the following functions:
	    //   text() 			- returns the template text from your storage location
	    //   text(value)		- writes the supplied template text to your storage location
	    //   data(key)			- reads values stored using data(key, value) - see below
	    //   data(key, value)	- associates "value" with this template and the key "key". Is used to store information like "isRewritten".
	    //
	    // Optionally, template sources can also have the following functions:
	    //   nodes()            - returns a DOM element containing the nodes of this template, where available
	    //   nodes(value)       - writes the given DOM element to your storage location
	    // If a DOM element is available for a given template source, template engines are encouraged to use it in preference over text()
	    // for improved speed. However, all templateSources must supply text() even if they don't supply nodes().
	    //
	    // Once you've implemented a templateSource, make your template engine use it by subclassing whatever template engine you were
	    // using and overriding "makeTemplateSource" to return an instance of your custom template source.

	    ko.templateSources = {};

	    // ---- ko.templateSources.domElement -----

	    ko.templateSources.domElement = function(element) {
	        this.domElement = element;
	    }

	    ko.templateSources.domElement.prototype['text'] = function(/* valueToWrite */) {
	        var tagNameLower = ko.utils.tagNameLower(this.domElement),
	            elemContentsProperty = tagNameLower === "script" ? "text"
	                                 : tagNameLower === "textarea" ? "value"
	                                 : "innerHTML";

	        if (arguments.length == 0) {
	            return this.domElement[elemContentsProperty];
	        } else {
	            var valueToWrite = arguments[0];
	            if (elemContentsProperty === "innerHTML")
	                ko.utils.setHtml(this.domElement, valueToWrite);
	            else
	                this.domElement[elemContentsProperty] = valueToWrite;
	        }
	    };

	    var dataDomDataPrefix = ko.utils.domData.nextKey() + "_";
	    ko.templateSources.domElement.prototype['data'] = function(key /*, valueToWrite */) {
	        if (arguments.length === 1) {
	            return ko.utils.domData.get(this.domElement, dataDomDataPrefix + key);
	        } else {
	            ko.utils.domData.set(this.domElement, dataDomDataPrefix + key, arguments[1]);
	        }
	    };

	    // ---- ko.templateSources.anonymousTemplate -----
	    // Anonymous templates are normally saved/retrieved as DOM nodes through "nodes".
	    // For compatibility, you can also read "text"; it will be serialized from the nodes on demand.
	    // Writing to "text" is still supported, but then the template data will not be available as DOM nodes.

	    var anonymousTemplatesDomDataKey = ko.utils.domData.nextKey();
	    ko.templateSources.anonymousTemplate = function(element) {
	        this.domElement = element;
	    }
	    ko.templateSources.anonymousTemplate.prototype = new ko.templateSources.domElement();
	    ko.templateSources.anonymousTemplate.prototype.constructor = ko.templateSources.anonymousTemplate;
	    ko.templateSources.anonymousTemplate.prototype['text'] = function(/* valueToWrite */) {
	        if (arguments.length == 0) {
	            var templateData = ko.utils.domData.get(this.domElement, anonymousTemplatesDomDataKey) || {};
	            if (templateData.textData === undefined && templateData.containerData)
	                templateData.textData = templateData.containerData.innerHTML;
	            return templateData.textData;
	        } else {
	            var valueToWrite = arguments[0];
	            ko.utils.domData.set(this.domElement, anonymousTemplatesDomDataKey, {textData: valueToWrite});
	        }
	    };
	    ko.templateSources.domElement.prototype['nodes'] = function(/* valueToWrite */) {
	        if (arguments.length == 0) {
	            var templateData = ko.utils.domData.get(this.domElement, anonymousTemplatesDomDataKey) || {};
	            return templateData.containerData;
	        } else {
	            var valueToWrite = arguments[0];
	            ko.utils.domData.set(this.domElement, anonymousTemplatesDomDataKey, {containerData: valueToWrite});
	        }
	    };

	    ko.exportSymbol('templateSources', ko.templateSources);
	    ko.exportSymbol('templateSources.domElement', ko.templateSources.domElement);
	    ko.exportSymbol('templateSources.anonymousTemplate', ko.templateSources.anonymousTemplate);
	})();
	(function () {
	    var _templateEngine;
	    ko.setTemplateEngine = function (templateEngine) {
	        if ((templateEngine != undefined) && !(templateEngine instanceof ko.templateEngine))
	            throw new Error("templateEngine must inherit from ko.templateEngine");
	        _templateEngine = templateEngine;
	    }

	    function invokeForEachNodeInContinuousRange(firstNode, lastNode, action) {
	        var node, nextInQueue = firstNode, firstOutOfRangeNode = ko.virtualElements.nextSibling(lastNode);
	        while (nextInQueue && ((node = nextInQueue) !== firstOutOfRangeNode)) {
	            nextInQueue = ko.virtualElements.nextSibling(node);
	            action(node, nextInQueue);
	        }
	    }

	    function activateBindingsOnContinuousNodeArray(continuousNodeArray, bindingContext) {
	        // To be used on any nodes that have been rendered by a template and have been inserted into some parent element
	        // Walks through continuousNodeArray (which *must* be continuous, i.e., an uninterrupted sequence of sibling nodes, because
	        // the algorithm for walking them relies on this), and for each top-level item in the virtual-element sense,
	        // (1) Does a regular "applyBindings" to associate bindingContext with this node and to activate any non-memoized bindings
	        // (2) Unmemoizes any memos in the DOM subtree (e.g., to activate bindings that had been memoized during template rewriting)

	        if (continuousNodeArray.length) {
	            var firstNode = continuousNodeArray[0],
	                lastNode = continuousNodeArray[continuousNodeArray.length - 1],
	                parentNode = firstNode.parentNode,
	                provider = ko.bindingProvider['instance'],
	                preprocessNode = provider['preprocessNode'];

	            if (preprocessNode) {
	                invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node, nextNodeInRange) {
	                    var nodePreviousSibling = node.previousSibling;
	                    var newNodes = preprocessNode.call(provider, node);
	                    if (newNodes) {
	                        if (node === firstNode)
	                            firstNode = newNodes[0] || nextNodeInRange;
	                        if (node === lastNode)
	                            lastNode = newNodes[newNodes.length - 1] || nodePreviousSibling;
	                    }
	                });

	                // Because preprocessNode can change the nodes, including the first and last nodes, update continuousNodeArray to match.
	                // We need the full set, including inner nodes, because the unmemoize step might remove the first node (and so the real
	                // first node needs to be in the array).
	                continuousNodeArray.length = 0;
	                if (!firstNode) { // preprocessNode might have removed all the nodes, in which case there's nothing left to do
	                    return;
	                }
	                if (firstNode === lastNode) {
	                    continuousNodeArray.push(firstNode);
	                } else {
	                    continuousNodeArray.push(firstNode, lastNode);
	                    ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
	                }
	            }

	            // Need to applyBindings *before* unmemoziation, because unmemoization might introduce extra nodes (that we don't want to re-bind)
	            // whereas a regular applyBindings won't introduce new memoized nodes
	            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
	                if (node.nodeType === 1 || node.nodeType === 8)
	                    ko.applyBindings(bindingContext, node);
	            });
	            invokeForEachNodeInContinuousRange(firstNode, lastNode, function(node) {
	                if (node.nodeType === 1 || node.nodeType === 8)
	                    ko.memoization.unmemoizeDomNodeAndDescendants(node, [bindingContext]);
	            });

	            // Make sure any changes done by applyBindings or unmemoize are reflected in the array
	            ko.utils.fixUpContinuousNodeArray(continuousNodeArray, parentNode);
	        }
	    }

	    function getFirstNodeFromPossibleArray(nodeOrNodeArray) {
	        return nodeOrNodeArray.nodeType ? nodeOrNodeArray
	                                        : nodeOrNodeArray.length > 0 ? nodeOrNodeArray[0]
	                                        : null;
	    }

	    function executeTemplate(targetNodeOrNodeArray, renderMode, template, bindingContext, options) {
	        options = options || {};
	        var firstTargetNode = targetNodeOrNodeArray && getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
	        var templateDocument = (firstTargetNode || template || {}).ownerDocument;
	        var templateEngineToUse = (options['templateEngine'] || _templateEngine);
	        ko.templateRewriting.ensureTemplateIsRewritten(template, templateEngineToUse, templateDocument);
	        var renderedNodesArray = templateEngineToUse['renderTemplate'](template, bindingContext, options, templateDocument);

	        // Loosely check result is an array of DOM nodes
	        if ((typeof renderedNodesArray.length != "number") || (renderedNodesArray.length > 0 && typeof renderedNodesArray[0].nodeType != "number"))
	            throw new Error("Template engine must return an array of DOM nodes");

	        var haveAddedNodesToParent = false;
	        switch (renderMode) {
	            case "replaceChildren":
	                ko.virtualElements.setDomNodeChildren(targetNodeOrNodeArray, renderedNodesArray);
	                haveAddedNodesToParent = true;
	                break;
	            case "replaceNode":
	                ko.utils.replaceDomNodes(targetNodeOrNodeArray, renderedNodesArray);
	                haveAddedNodesToParent = true;
	                break;
	            case "ignoreTargetNode": break;
	            default:
	                throw new Error("Unknown renderMode: " + renderMode);
	        }

	        if (haveAddedNodesToParent) {
	            activateBindingsOnContinuousNodeArray(renderedNodesArray, bindingContext);
	            if (options['afterRender'])
	                ko.dependencyDetection.ignore(options['afterRender'], null, [renderedNodesArray, bindingContext['$data']]);
	        }

	        return renderedNodesArray;
	    }

	    function resolveTemplateName(template, data, context) {
	        // The template can be specified as:
	        if (ko.isObservable(template)) {
	            // 1. An observable, with string value
	            return template();
	        } else if (typeof template === 'function') {
	            // 2. A function of (data, context) returning a string
	            return template(data, context);
	        } else {
	            // 3. A string
	            return template;
	        }
	    }

	    ko.renderTemplate = function (template, dataOrBindingContext, options, targetNodeOrNodeArray, renderMode) {
	        options = options || {};
	        if ((options['templateEngine'] || _templateEngine) == undefined)
	            throw new Error("Set a template engine before calling renderTemplate");
	        renderMode = renderMode || "replaceChildren";

	        if (targetNodeOrNodeArray) {
	            var firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);

	            var whenToDispose = function () { return (!firstTargetNode) || !ko.utils.domNodeIsAttachedToDocument(firstTargetNode); }; // Passive disposal (on next evaluation)
	            var activelyDisposeWhenNodeIsRemoved = (firstTargetNode && renderMode == "replaceNode") ? firstTargetNode.parentNode : firstTargetNode;

	            return ko.dependentObservable( // So the DOM is automatically updated when any dependency changes
	                function () {
	                    // Ensure we've got a proper binding context to work with
	                    var bindingContext = (dataOrBindingContext && (dataOrBindingContext instanceof ko.bindingContext))
	                        ? dataOrBindingContext
	                        : new ko.bindingContext(ko.utils.unwrapObservable(dataOrBindingContext));

	                    var templateName = resolveTemplateName(template, bindingContext['$data'], bindingContext),
	                        renderedNodesArray = executeTemplate(targetNodeOrNodeArray, renderMode, templateName, bindingContext, options);

	                    if (renderMode == "replaceNode") {
	                        targetNodeOrNodeArray = renderedNodesArray;
	                        firstTargetNode = getFirstNodeFromPossibleArray(targetNodeOrNodeArray);
	                    }
	                },
	                null,
	                { disposeWhen: whenToDispose, disposeWhenNodeIsRemoved: activelyDisposeWhenNodeIsRemoved }
	            );
	        } else {
	            // We don't yet have a DOM node to evaluate, so use a memo and render the template later when there is a DOM node
	            return ko.memoization.memoize(function (domNode) {
	                ko.renderTemplate(template, dataOrBindingContext, options, domNode, "replaceNode");
	            });
	        }
	    };

	    ko.renderTemplateForEach = function (template, arrayOrObservableArray, options, targetNode, parentBindingContext) {
	        // Since setDomNodeChildrenFromArrayMapping always calls executeTemplateForArrayItem and then
	        // activateBindingsCallback for added items, we can store the binding context in the former to use in the latter.
	        var arrayItemContext;

	        // This will be called by setDomNodeChildrenFromArrayMapping to get the nodes to add to targetNode
	        var executeTemplateForArrayItem = function (arrayValue, index) {
	            // Support selecting template as a function of the data being rendered
	            arrayItemContext = parentBindingContext['createChildContext'](arrayValue, options['as'], function(context) {
	                context['$index'] = index;
	            });

	            var templateName = resolveTemplateName(template, arrayValue, arrayItemContext);
	            return executeTemplate(null, "ignoreTargetNode", templateName, arrayItemContext, options);
	        }

	        // This will be called whenever setDomNodeChildrenFromArrayMapping has added nodes to targetNode
	        var activateBindingsCallback = function(arrayValue, addedNodesArray, index) {
	            activateBindingsOnContinuousNodeArray(addedNodesArray, arrayItemContext);
	            if (options['afterRender'])
	                options['afterRender'](addedNodesArray, arrayValue);

	            // release the "cache" variable, so that it can be collected by
	            // the GC when its value isn't used from within the bindings anymore.
	            arrayItemContext = null;
	        };

	        return ko.dependentObservable(function () {
	            var unwrappedArray = ko.utils.unwrapObservable(arrayOrObservableArray) || [];
	            if (typeof unwrappedArray.length == "undefined") // Coerce single value into array
	                unwrappedArray = [unwrappedArray];

	            // Filter out any entries marked as destroyed
	            var filteredArray = ko.utils.arrayFilter(unwrappedArray, function(item) {
	                return options['includeDestroyed'] || item === undefined || item === null || !ko.utils.unwrapObservable(item['_destroy']);
	            });

	            // Call setDomNodeChildrenFromArrayMapping, ignoring any observables unwrapped within (most likely from a callback function).
	            // If the array items are observables, though, they will be unwrapped in executeTemplateForArrayItem and managed within setDomNodeChildrenFromArrayMapping.
	            ko.dependencyDetection.ignore(ko.utils.setDomNodeChildrenFromArrayMapping, null, [targetNode, filteredArray, executeTemplateForArrayItem, options, activateBindingsCallback]);

	        }, null, { disposeWhenNodeIsRemoved: targetNode });
	    };

	    var templateComputedDomDataKey = ko.utils.domData.nextKey();
	    function disposeOldComputedAndStoreNewOne(element, newComputed) {
	        var oldComputed = ko.utils.domData.get(element, templateComputedDomDataKey);
	        if (oldComputed && (typeof(oldComputed.dispose) == 'function'))
	            oldComputed.dispose();
	        ko.utils.domData.set(element, templateComputedDomDataKey, (newComputed && newComputed.isActive()) ? newComputed : undefined);
	    }

	    ko.bindingHandlers['template'] = {
	        'init': function(element, valueAccessor) {
	            // Support anonymous templates
	            var bindingValue = ko.utils.unwrapObservable(valueAccessor());
	            if (typeof bindingValue == "string" || bindingValue['name']) {
	                // It's a named template - clear the element
	                ko.virtualElements.emptyNode(element);
	            } else if ('nodes' in bindingValue) {
	                // We've been given an array of DOM nodes. Save them as the template source.
	                // There is no known use case for the node array being an observable array (if the output
	                // varies, put that behavior *into* your template - that's what templates are for), and
	                // the implementation would be a mess, so assert that it's not observable.
	                var nodes = bindingValue['nodes'] || [];
	                if (ko.isObservable(nodes)) {
	                    throw new Error('The "nodes" option must be a plain, non-observable array.');
	                }
	                var container = ko.utils.moveCleanedNodesToContainerElement(nodes); // This also removes the nodes from their current parent
	                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
	            } else {
	                // It's an anonymous template - store the element contents, then clear the element
	                var templateNodes = ko.virtualElements.childNodes(element),
	                    container = ko.utils.moveCleanedNodesToContainerElement(templateNodes); // This also removes the nodes from their current parent
	                new ko.templateSources.anonymousTemplate(element)['nodes'](container);
	            }
	            return { 'controlsDescendantBindings': true };
	        },
	        'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	            var value = valueAccessor(),
	                dataValue,
	                options = ko.utils.unwrapObservable(value),
	                shouldDisplay = true,
	                templateComputed = null,
	                templateName;

	            if (typeof options == "string") {
	                templateName = value;
	                options = {};
	            } else {
	                templateName = options['name'];

	                // Support "if"/"ifnot" conditions
	                if ('if' in options)
	                    shouldDisplay = ko.utils.unwrapObservable(options['if']);
	                if (shouldDisplay && 'ifnot' in options)
	                    shouldDisplay = !ko.utils.unwrapObservable(options['ifnot']);

	                dataValue = ko.utils.unwrapObservable(options['data']);
	            }

	            if ('foreach' in options) {
	                // Render once for each data point (treating data set as empty if shouldDisplay==false)
	                var dataArray = (shouldDisplay && options['foreach']) || [];
	                templateComputed = ko.renderTemplateForEach(templateName || element, dataArray, options, element, bindingContext);
	            } else if (!shouldDisplay) {
	                ko.virtualElements.emptyNode(element);
	            } else {
	                // Render once for this single data point (or use the viewModel if no data was provided)
	                var innerBindingContext = ('data' in options) ?
	                    bindingContext['createChildContext'](dataValue, options['as']) :  // Given an explitit 'data' value, we create a child binding context for it
	                    bindingContext;                                                        // Given no explicit 'data' value, we retain the same binding context
	                templateComputed = ko.renderTemplate(templateName || element, innerBindingContext, options, element);
	            }

	            // It only makes sense to have a single template computed per element (otherwise which one should have its output displayed?)
	            disposeOldComputedAndStoreNewOne(element, templateComputed);
	        }
	    };

	    // Anonymous templates can't be rewritten. Give a nice error message if you try to do it.
	    ko.expressionRewriting.bindingRewriteValidators['template'] = function(bindingValue) {
	        var parsedBindingValue = ko.expressionRewriting.parseObjectLiteral(bindingValue);

	        if ((parsedBindingValue.length == 1) && parsedBindingValue[0]['unknown'])
	            return null; // It looks like a string literal, not an object literal, so treat it as a named template (which is allowed for rewriting)

	        if (ko.expressionRewriting.keyValueArrayContainsKey(parsedBindingValue, "name"))
	            return null; // Named templates can be rewritten, so return "no error"
	        return "This template engine does not support anonymous templates nested within its templates";
	    };

	    ko.virtualElements.allowedBindings['template'] = true;
	})();

	ko.exportSymbol('setTemplateEngine', ko.setTemplateEngine);
	ko.exportSymbol('renderTemplate', ko.renderTemplate);
	// Go through the items that have been added and deleted and try to find matches between them.
	ko.utils.findMovesInArrayComparison = function (left, right, limitFailedCompares) {
	    if (left.length && right.length) {
	        var failedCompares, l, r, leftItem, rightItem;
	        for (failedCompares = l = 0; (!limitFailedCompares || failedCompares < limitFailedCompares) && (leftItem = left[l]); ++l) {
	            for (r = 0; rightItem = right[r]; ++r) {
	                if (leftItem['value'] === rightItem['value']) {
	                    leftItem['moved'] = rightItem['index'];
	                    rightItem['moved'] = leftItem['index'];
	                    right.splice(r, 1);         // This item is marked as moved; so remove it from right list
	                    failedCompares = r = 0;     // Reset failed compares count because we're checking for consecutive failures
	                    break;
	                }
	            }
	            failedCompares += r;
	        }
	    }
	};

	ko.utils.compareArrays = (function () {
	    var statusNotInOld = 'added', statusNotInNew = 'deleted';

	    // Simple calculation based on Levenshtein distance.
	    function compareArrays(oldArray, newArray, options) {
	        // For backward compatibility, if the third arg is actually a bool, interpret
	        // it as the old parameter 'dontLimitMoves'. Newer code should use { dontLimitMoves: true }.
	        options = (typeof options === 'boolean') ? { 'dontLimitMoves': options } : (options || {});
	        oldArray = oldArray || [];
	        newArray = newArray || [];

	        if (oldArray.length <= newArray.length)
	            return compareSmallArrayToBigArray(oldArray, newArray, statusNotInOld, statusNotInNew, options);
	        else
	            return compareSmallArrayToBigArray(newArray, oldArray, statusNotInNew, statusNotInOld, options);
	    }

	    function compareSmallArrayToBigArray(smlArray, bigArray, statusNotInSml, statusNotInBig, options) {
	        var myMin = Math.min,
	            myMax = Math.max,
	            editDistanceMatrix = [],
	            smlIndex, smlIndexMax = smlArray.length,
	            bigIndex, bigIndexMax = bigArray.length,
	            compareRange = (bigIndexMax - smlIndexMax) || 1,
	            maxDistance = smlIndexMax + bigIndexMax + 1,
	            thisRow, lastRow,
	            bigIndexMaxForRow, bigIndexMinForRow;

	        for (smlIndex = 0; smlIndex <= smlIndexMax; smlIndex++) {
	            lastRow = thisRow;
	            editDistanceMatrix.push(thisRow = []);
	            bigIndexMaxForRow = myMin(bigIndexMax, smlIndex + compareRange);
	            bigIndexMinForRow = myMax(0, smlIndex - 1);
	            for (bigIndex = bigIndexMinForRow; bigIndex <= bigIndexMaxForRow; bigIndex++) {
	                if (!bigIndex)
	                    thisRow[bigIndex] = smlIndex + 1;
	                else if (!smlIndex)  // Top row - transform empty array into new array via additions
	                    thisRow[bigIndex] = bigIndex + 1;
	                else if (smlArray[smlIndex - 1] === bigArray[bigIndex - 1])
	                    thisRow[bigIndex] = lastRow[bigIndex - 1];                  // copy value (no edit)
	                else {
	                    var northDistance = lastRow[bigIndex] || maxDistance;       // not in big (deletion)
	                    var westDistance = thisRow[bigIndex - 1] || maxDistance;    // not in small (addition)
	                    thisRow[bigIndex] = myMin(northDistance, westDistance) + 1;
	                }
	            }
	        }

	        var editScript = [], meMinusOne, notInSml = [], notInBig = [];
	        for (smlIndex = smlIndexMax, bigIndex = bigIndexMax; smlIndex || bigIndex;) {
	            meMinusOne = editDistanceMatrix[smlIndex][bigIndex] - 1;
	            if (bigIndex && meMinusOne === editDistanceMatrix[smlIndex][bigIndex-1]) {
	                notInSml.push(editScript[editScript.length] = {     // added
	                    'status': statusNotInSml,
	                    'value': bigArray[--bigIndex],
	                    'index': bigIndex });
	            } else if (smlIndex && meMinusOne === editDistanceMatrix[smlIndex - 1][bigIndex]) {
	                notInBig.push(editScript[editScript.length] = {     // deleted
	                    'status': statusNotInBig,
	                    'value': smlArray[--smlIndex],
	                    'index': smlIndex });
	            } else {
	                --bigIndex;
	                --smlIndex;
	                if (!options['sparse']) {
	                    editScript.push({
	                        'status': "retained",
	                        'value': bigArray[bigIndex] });
	                }
	            }
	        }

	        // Set a limit on the number of consecutive non-matching comparisons; having it a multiple of
	        // smlIndexMax keeps the time complexity of this algorithm linear.
	        ko.utils.findMovesInArrayComparison(notInSml, notInBig, smlIndexMax * 10);

	        return editScript.reverse();
	    }

	    return compareArrays;
	})();

	ko.exportSymbol('utils.compareArrays', ko.utils.compareArrays);
	(function () {
	    // Objective:
	    // * Given an input array, a container DOM node, and a function from array elements to arrays of DOM nodes,
	    //   map the array elements to arrays of DOM nodes, concatenate together all these arrays, and use them to populate the container DOM node
	    // * Next time we're given the same combination of things (with the array possibly having mutated), update the container DOM node
	    //   so that its children is again the concatenation of the mappings of the array elements, but don't re-map any array elements that we
	    //   previously mapped - retain those nodes, and just insert/delete other ones

	    // "callbackAfterAddingNodes" will be invoked after any "mapping"-generated nodes are inserted into the container node
	    // You can use this, for example, to activate bindings on those nodes.

	    function mapNodeAndRefreshWhenChanged(containerNode, mapping, valueToMap, callbackAfterAddingNodes, index) {
	        // Map this array value inside a dependentObservable so we re-map when any dependency changes
	        var mappedNodes = [];
	        var dependentObservable = ko.dependentObservable(function() {
	            var newMappedNodes = mapping(valueToMap, index, ko.utils.fixUpContinuousNodeArray(mappedNodes, containerNode)) || [];

	            // On subsequent evaluations, just replace the previously-inserted DOM nodes
	            if (mappedNodes.length > 0) {
	                ko.utils.replaceDomNodes(mappedNodes, newMappedNodes);
	                if (callbackAfterAddingNodes)
	                    ko.dependencyDetection.ignore(callbackAfterAddingNodes, null, [valueToMap, newMappedNodes, index]);
	            }

	            // Replace the contents of the mappedNodes array, thereby updating the record
	            // of which nodes would be deleted if valueToMap was itself later removed
	            mappedNodes.length = 0;
	            ko.utils.arrayPushAll(mappedNodes, newMappedNodes);
	        }, null, { disposeWhenNodeIsRemoved: containerNode, disposeWhen: function() { return !ko.utils.anyDomNodeIsAttachedToDocument(mappedNodes); } });
	        return { mappedNodes : mappedNodes, dependentObservable : (dependentObservable.isActive() ? dependentObservable : undefined) };
	    }

	    var lastMappingResultDomDataKey = ko.utils.domData.nextKey();

	    ko.utils.setDomNodeChildrenFromArrayMapping = function (domNode, array, mapping, options, callbackAfterAddingNodes) {
	        // Compare the provided array against the previous one
	        array = array || [];
	        options = options || {};
	        var isFirstExecution = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) === undefined;
	        var lastMappingResult = ko.utils.domData.get(domNode, lastMappingResultDomDataKey) || [];
	        var lastArray = ko.utils.arrayMap(lastMappingResult, function (x) { return x.arrayEntry; });
	        var editScript = ko.utils.compareArrays(lastArray, array, options['dontLimitMoves']);

	        // Build the new mapping result
	        var newMappingResult = [];
	        var lastMappingResultIndex = 0;
	        var newMappingResultIndex = 0;

	        var nodesToDelete = [];
	        var itemsToProcess = [];
	        var itemsForBeforeRemoveCallbacks = [];
	        var itemsForMoveCallbacks = [];
	        var itemsForAfterAddCallbacks = [];
	        var mapData;

	        function itemMovedOrRetained(editScriptIndex, oldPosition) {
	            mapData = lastMappingResult[oldPosition];
	            if (newMappingResultIndex !== oldPosition)
	                itemsForMoveCallbacks[editScriptIndex] = mapData;
	            // Since updating the index might change the nodes, do so before calling fixUpContinuousNodeArray
	            mapData.indexObservable(newMappingResultIndex++);
	            ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode);
	            newMappingResult.push(mapData);
	            itemsToProcess.push(mapData);
	        }

	        function callCallback(callback, items) {
	            if (callback) {
	                for (var i = 0, n = items.length; i < n; i++) {
	                    if (items[i]) {
	                        ko.utils.arrayForEach(items[i].mappedNodes, function(node) {
	                            callback(node, i, items[i].arrayEntry);
	                        });
	                    }
	                }
	            }
	        }

	        for (var i = 0, editScriptItem, movedIndex; editScriptItem = editScript[i]; i++) {
	            movedIndex = editScriptItem['moved'];
	            switch (editScriptItem['status']) {
	                case "deleted":
	                    if (movedIndex === undefined) {
	                        mapData = lastMappingResult[lastMappingResultIndex];

	                        // Stop tracking changes to the mapping for these nodes
	                        if (mapData.dependentObservable)
	                            mapData.dependentObservable.dispose();

	                        // Queue these nodes for later removal
	                        nodesToDelete.push.apply(nodesToDelete, ko.utils.fixUpContinuousNodeArray(mapData.mappedNodes, domNode));
	                        if (options['beforeRemove']) {
	                            itemsForBeforeRemoveCallbacks[i] = mapData;
	                            itemsToProcess.push(mapData);
	                        }
	                    }
	                    lastMappingResultIndex++;
	                    break;

	                case "retained":
	                    itemMovedOrRetained(i, lastMappingResultIndex++);
	                    break;

	                case "added":
	                    if (movedIndex !== undefined) {
	                        itemMovedOrRetained(i, movedIndex);
	                    } else {
	                        mapData = { arrayEntry: editScriptItem['value'], indexObservable: ko.observable(newMappingResultIndex++) };
	                        newMappingResult.push(mapData);
	                        itemsToProcess.push(mapData);
	                        if (!isFirstExecution)
	                            itemsForAfterAddCallbacks[i] = mapData;
	                    }
	                    break;
	            }
	        }

	        // Call beforeMove first before any changes have been made to the DOM
	        callCallback(options['beforeMove'], itemsForMoveCallbacks);

	        // Next remove nodes for deleted items (or just clean if there's a beforeRemove callback)
	        ko.utils.arrayForEach(nodesToDelete, options['beforeRemove'] ? ko.cleanNode : ko.removeNode);

	        // Next add/reorder the remaining items (will include deleted items if there's a beforeRemove callback)
	        for (var i = 0, nextNode = ko.virtualElements.firstChild(domNode), lastNode, node; mapData = itemsToProcess[i]; i++) {
	            // Get nodes for newly added items
	            if (!mapData.mappedNodes)
	                ko.utils.extend(mapData, mapNodeAndRefreshWhenChanged(domNode, mapping, mapData.arrayEntry, callbackAfterAddingNodes, mapData.indexObservable));

	            // Put nodes in the right place if they aren't there already
	            for (var j = 0; node = mapData.mappedNodes[j]; nextNode = node.nextSibling, lastNode = node, j++) {
	                if (node !== nextNode)
	                    ko.virtualElements.insertAfter(domNode, node, lastNode);
	            }

	            // Run the callbacks for newly added nodes (for example, to apply bindings, etc.)
	            if (!mapData.initialized && callbackAfterAddingNodes) {
	                callbackAfterAddingNodes(mapData.arrayEntry, mapData.mappedNodes, mapData.indexObservable);
	                mapData.initialized = true;
	            }
	        }

	        // If there's a beforeRemove callback, call it after reordering.
	        // Note that we assume that the beforeRemove callback will usually be used to remove the nodes using
	        // some sort of animation, which is why we first reorder the nodes that will be removed. If the
	        // callback instead removes the nodes right away, it would be more efficient to skip reordering them.
	        // Perhaps we'll make that change in the future if this scenario becomes more common.
	        callCallback(options['beforeRemove'], itemsForBeforeRemoveCallbacks);

	        // Finally call afterMove and afterAdd callbacks
	        callCallback(options['afterMove'], itemsForMoveCallbacks);
	        callCallback(options['afterAdd'], itemsForAfterAddCallbacks);

	        // Store a copy of the array items we just considered so we can difference it next time
	        ko.utils.domData.set(domNode, lastMappingResultDomDataKey, newMappingResult);
	    }
	})();

	ko.exportSymbol('utils.setDomNodeChildrenFromArrayMapping', ko.utils.setDomNodeChildrenFromArrayMapping);
	ko.nativeTemplateEngine = function () {
	    this['allowTemplateRewriting'] = false;
	}

	ko.nativeTemplateEngine.prototype = new ko.templateEngine();
	ko.nativeTemplateEngine.prototype.constructor = ko.nativeTemplateEngine;
	ko.nativeTemplateEngine.prototype['renderTemplateSource'] = function (templateSource, bindingContext, options, templateDocument) {
	    var useNodesIfAvailable = !(ko.utils.ieVersion < 9), // IE<9 cloneNode doesn't work properly
	        templateNodesFunc = useNodesIfAvailable ? templateSource['nodes'] : null,
	        templateNodes = templateNodesFunc ? templateSource['nodes']() : null;

	    if (templateNodes) {
	        return ko.utils.makeArray(templateNodes.cloneNode(true).childNodes);
	    } else {
	        var templateText = templateSource['text']();
	        return ko.utils.parseHtmlFragment(templateText, templateDocument);
	    }
	};

	ko.nativeTemplateEngine.instance = new ko.nativeTemplateEngine();
	ko.setTemplateEngine(ko.nativeTemplateEngine.instance);

	ko.exportSymbol('nativeTemplateEngine', ko.nativeTemplateEngine);
	(function() {
	    ko.jqueryTmplTemplateEngine = function () {
	        // Detect which version of jquery-tmpl you're using. Unfortunately jquery-tmpl
	        // doesn't expose a version number, so we have to infer it.
	        // Note that as of Knockout 1.3, we only support jQuery.tmpl 1.0.0pre and later,
	        // which KO internally refers to as version "2", so older versions are no longer detected.
	        var jQueryTmplVersion = this.jQueryTmplVersion = (function() {
	            if (!jQueryInstance || !(jQueryInstance['tmpl']))
	                return 0;
	            // Since it exposes no official version number, we use our own numbering system. To be updated as jquery-tmpl evolves.
	            try {
	                if (jQueryInstance['tmpl']['tag']['tmpl']['open'].toString().indexOf('__') >= 0) {
	                    // Since 1.0.0pre, custom tags should append markup to an array called "__"
	                    return 2; // Final version of jquery.tmpl
	                }
	            } catch(ex) { /* Apparently not the version we were looking for */ }

	            return 1; // Any older version that we don't support
	        })();

	        function ensureHasReferencedJQueryTemplates() {
	            if (jQueryTmplVersion < 2)
	                throw new Error("Your version of jQuery.tmpl is too old. Please upgrade to jQuery.tmpl 1.0.0pre or later.");
	        }

	        function executeTemplate(compiledTemplate, data, jQueryTemplateOptions) {
	            return jQueryInstance['tmpl'](compiledTemplate, data, jQueryTemplateOptions);
	        }

	        this['renderTemplateSource'] = function(templateSource, bindingContext, options, templateDocument) {
	            templateDocument = templateDocument || document;
	            options = options || {};
	            ensureHasReferencedJQueryTemplates();

	            // Ensure we have stored a precompiled version of this template (don't want to reparse on every render)
	            var precompiled = templateSource['data']('precompiled');
	            if (!precompiled) {
	                var templateText = templateSource['text']() || "";
	                // Wrap in "with($whatever.koBindingContext) { ... }"
	                templateText = "{{ko_with $item.koBindingContext}}" + templateText + "{{/ko_with}}";

	                precompiled = jQueryInstance['template'](null, templateText);
	                templateSource['data']('precompiled', precompiled);
	            }

	            var data = [bindingContext['$data']]; // Prewrap the data in an array to stop jquery.tmpl from trying to unwrap any arrays
	            var jQueryTemplateOptions = jQueryInstance['extend']({ 'koBindingContext': bindingContext }, options['templateOptions']);

	            var resultNodes = executeTemplate(precompiled, data, jQueryTemplateOptions);
	            resultNodes['appendTo'](templateDocument.createElement("div")); // Using "appendTo" forces jQuery/jQuery.tmpl to perform necessary cleanup work

	            jQueryInstance['fragments'] = {}; // Clear jQuery's fragment cache to avoid a memory leak after a large number of template renders
	            return resultNodes;
	        };

	        this['createJavaScriptEvaluatorBlock'] = function(script) {
	            return "{{ko_code ((function() { return " + script + " })()) }}";
	        };

	        this['addTemplate'] = function(templateName, templateMarkup) {
	            document.write("<script type='text/html' id='" + templateName + "'>" + templateMarkup + "<" + "/script>");
	        };

	        if (jQueryTmplVersion > 0) {
	            jQueryInstance['tmpl']['tag']['ko_code'] = {
	                open: "__.push($1 || '');"
	            };
	            jQueryInstance['tmpl']['tag']['ko_with'] = {
	                open: "with($1) {",
	                close: "} "
	            };
	        }
	    };

	    ko.jqueryTmplTemplateEngine.prototype = new ko.templateEngine();
	    ko.jqueryTmplTemplateEngine.prototype.constructor = ko.jqueryTmplTemplateEngine;

	    // Use this one by default *only if jquery.tmpl is referenced*
	    var jqueryTmplTemplateEngineInstance = new ko.jqueryTmplTemplateEngine();
	    if (jqueryTmplTemplateEngineInstance.jQueryTmplVersion > 0)
	        ko.setTemplateEngine(jqueryTmplTemplateEngineInstance);

	    ko.exportSymbol('jqueryTmplTemplateEngine', ko.jqueryTmplTemplateEngine);
	})();
	}));
	}());
	})();

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(27)(module)))

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function() { throw new Error("define cannot be used indirect"); };


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }
/******/ ])
});
;