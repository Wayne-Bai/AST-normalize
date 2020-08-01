var Collection = require('./collection');
var Query = require('./query');
var util = require('./util');

module.exports = Resource;

/**
 * Values set using the constructor are not marked as dirty. Use `.set()`
 * after instantiation for hydration of dirty attributes.
 *
 * @example
 *
 * ```javascript
 * var user = new User({ name: "alex" });
 * ```
 *
 * @param {Object} values optional
 * @constructor
 * @alias Resource
 * @memberof module:mio
 * @fires module:mio.Resource.on.initialize
 * @fires module:mio.Resource.on.create
 */
function Resource(values) {
  if (!values) values = {};

  /**
   * Run at the beginning of resource constructor.
   *
   * @event initialize
   * @memberof module:mio.Resource.on
   * @param {module:mio.Resource} resource
   * @param {Object} values values passed to constructor
   */
  this.constructor.emit('initialize', this, values);

  Object.defineProperties(this, {
    // For EventEmitter
    listeners: {
      value: Object.create(null),
      writable: true
    },
    hooks: {
      value: Object.create(null),
      writable: true
    },
    // Where we store attribute values
    attributes: {
      value: Object.create(null)
    },
    // Dirty attributes
    dirtyAttributes: {
      value: []
    },
    // A mutable object for saving extra information
    extras: {
      value: Object.create(null),
      writable: true
    },
    // Primary key
    primary: {
      enumerable: false,
      get: function() {
        if (this.constructor.primaryKey) {
          return this[this.constructor.primaryKey];
        }
        else {
          throw new Error("Primary key has not been defined.");
        }
      },
      set: function(value) {
        if (this.constructor.primaryKey) {
          this[this.constructor.primaryKey] = value;
        }
        else {
          throw new Error("Primary key has not been defined.");
        }
      }
    }
  });

  // Create accessors for defined attributes
  this.constructor.attributes = this.constructor.attributes || Object.create(null);

  Object.keys(this.constructor.attributes).forEach(function(name) {
    var params = this.constructor.attributes[name];

    Object.defineProperty(this, name, {
      get: params.get || function() {
        return this.attributes[name];
      },
      set: function(value) {
        var changed = this.attributes[name] !== value;

        if (changed) {
          var prev = this.attributes[name];
          this.attributes[name] = value;

          if (!~this.dirtyAttributes.indexOf(name)) {
            this.dirtyAttributes.push(name);
          }

          /**
           * Fired whenever a resource attribute is changed.
           *
           * @event change
           * @memberof module:mio.Resource.on
           * @param {module:mio.Resource} resource
           * @param {String} name name of the attribute
           * @param {Mixed} value
           * @param {Mixed} prev
           */

          /**
           * Fired whenever [attr] is changed.
           *
           * @event change:[attr]
           * @memberof module:mio.Resource.on
           * @param {Resource} resource
           * @param {Mixed} value
           * @param {Mixed} prev
           */
          this.constructor.emit('change', this, name, value, prev);
          this.constructor.emit('change:' + name, this, value, prev);
          this.emit('change', name, value, prev);
          this.emit('change:' + name, value, prev);
        }
      },
      enumerable: params.enumerable === false ? false : true
    }, this);

    // Set attribute defaults.
    if (params.default !== undefined && this.attributes[name] === undefined) {
      if (values[name] === undefined) {
        values[name] = typeof params.default === 'function' ?
          params.default.call(this) :
          params.default;
      }
    }
    else {
      this.attributes[name] = null;
    }
  }, this);

  // Set initial attribute values if provided.
  for (var name in values) {
    if (this.constructor.attributes[name]) {
      this.attributes[name] = values[name];
    }
  }

  /**
   * Run at the end of resource constructor.
   *
   * **Note:** Not the same event as {@link module:mio.Resource.on.post}.
   *
   * @event create
   * @memberof module:mio.Resource.on
   * @param {Resource} resource
   */
  this.constructor.emit('create', this);
}

/**
 * Extend `Resource` attributes and prototype or class properties.
 *
 * @example
 *
 * ```javascript
 * var User = mio.Resource.extend({
 *   attributes: {
 *     id: { primary: true }
 *   },
 * }, {
 *   baseUrl: '/users'
 * });
 * ```
 *
 * @param {Object} prototype extend resource prototype
 * @param {Object} prototype.attributes attribute definitions passed to
 * {@link Resource.attr}
 * @param {Object=} statics extend resource with static properties or methods
 * @param {String} baseUrl used by {@link Resource#url} to construct URLs
 * @param {Array=} statics.use array of plugins passed to {@link Resource.use}
 * @param {Array=} statics.browser array of browser plugins to use
 * @param {Array=} statics.server array of server plugins to use
 * @returns {module:mio.Resource}
 */
Resource.extend = function (prototype, statics) {
  prototype = util.setEnvSpecificKeys(prototype || {});
  statics = util.setEnvSpecificKeys(statics || {});

  var pluckedPrototype = util.pluck(prototype, [
    'attributes',
    'collection'
  ]);

  var attributes = pluckedPrototype.attributes;

  var pluckedStatics = util.pluck(statics, [
    'events',
    'hooks',
    'server',
    'browser',
    'options',
    'use',
    'collection'
  ]);

  var child = util.extend.call(this, prototype, statics);

  // static object properties to inherit with shallow copy
  var methods = ['attributes', 'hooks', 'listeners', 'options'];
  for (var i = 0, l = methods.length; i < l; i++) {
    var obj = this[methods[i]];

    child[methods[i]] = Object.create(null);

    for (var key in obj) {
      if (obj[key] instanceof Array) {
        child[methods[i]][key] = obj[key].slice(0);
      } else {
        child[methods[i]][key] = obj[key];
      }
    }
  }

  if (pluckedStatics.options) {
    for (var key in pluckedStatics.options) {
      if (pluckedStatics.options.hasOwnProperty(key)) {
        child.options[key] = pluckedStatics.options[key];
      }
    }
  }

  // define instance attributes using `Resource#attr()`
  if (pluckedPrototype.attributes) {
    for (var attr in attributes) {
      if (attributes.hasOwnProperty(attr)) {
        child.attr(attr, attributes[attr]);
      }
    }
  }

  // expose child collection
  if (!statics.collection || typeof statics.collection === 'object') {
    pluckedPrototype.collection = pluckedPrototype.collection || {};
    pluckedPrototype.collection.Resource = child;
    child.Collection = (this.Collection || Collection).extend(
      pluckedPrototype.collection,
      pluckedStatics.collection
    );
  }

  // use plugins
  ['browser', 'server', 'use'].forEach(function (key) {
    pluckedStatics[key] && pluckedStatics[key].forEach(function (plugin) {
      child[key](plugin);
    });
  });

  // register hooks
  for (var events in pluckedStatics.hooks) {
    child.hook(event, pluckedStatics.hooks[event]);
  }

  // register event listeners
  for (var event in pluckedStatics.on) {
    child.on(event, pluckedStatics.on[event]);
  }

  return child;
};

/**
 * Define a resource attribute with the given `name` and `options`.
 *
 * @example
 *
 * ```javascript
 * User
 *   .attr('id', { primary: true })
 *   .attr('name')
 *   .attr('created', {
 *     default: function() {
 *       return new Date();
 *     }
 *   });
 * ```
 *
 * Passing a non-object for `options` sets that value as the default:
 *
 * ```javascript
 * User.attr('created', function () {
 *   return new Date();
 * });
 * ```
 *
 * @param {String} name
 * @param {Object=} options
 * @param {Mixed=} options.default default value or function that returns value
 * @param {Boolean=} options.enumerable attribute is enumerable (default: true)
 * @param {Boolean=} options.serializable include in JSON (default: true)
 * @param {Function=} options.get accessor function
 * @param {Boolean=} options.primary use attribute as primary key
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.on.attribute
 */
Resource.attr = function(name, options) {
  this.attributes = this.attributes || Object.create(null);

  if (typeof options === 'undefined') {
    options = {};
  } else if (typeof options !== 'object') {
    options = {
      'default': options
    };
  }

  if (options.primary) {
    if (this.primaryKey) {
      throw new Error(
        "Primary attribute already exists: " + this.primaryKey
      );
    }
    this.primaryKey = name;
  }

  this.attributes[name] = util.merge(this.attributes[name], options);

  /**
   * @event attribute
   * @memberof module:mio.Resource.on
   * @param {String} name attribute name
   * @param {Object} options attribute options
   */
  this.emit('attribute', name, options);

  return this;
};

/**
 * Call the given `plugin` function with the Resource as both argument and
 * context.
 *
 * @example
 *
 * ```javascript
 * User
 *   .use(require('example-plugin'))
 *   .server(function() {
 *     this.use(require('mio-mysql'));
 *   })
 *   .browser(function() {
 *     this.use(require('mio-ajax'));
 *   });
 * ```
 *
 * @param {module:mio.Resource.use.plugin} plugin
 * @returns {module:mio.Resource}
 */
Resource.use = function(plugin) {
  if (typeof plugin === 'function') {

    /**
     * Called with Resource as argument and context.
     *
     * @callback plugin
     * @memberof module:mio.Resource.use
     * @param {module:mio.Resource} Resource
     * @this {module:mio.Resource}
     */
    plugin.call(this, this);
  } else {
    throw new Error(
      "Plugin must be a function."
    );
  }

  return this;
};

/**
 * Use given `plugin` only in browser.
 *
 * @param {module:mio.Resource.use.plugin} plugin
 * @returns {module:mio.Resource}
 */
Resource.browser = function(plugin) {
  if (typeof window === 'object') {
    this.use.apply(this, arguments);
  }
  return this;
};

/**
 * Use given `plugin` only in node.
 *
 * @param {module:mio.Resource.use.plugin} plugin
 * @returns {module:mio.Resource}
 */
Resource.server = function(fn) {
  if (typeof window === 'undefined') {
    this.use.apply(this, arguments);
  }
  return this;
};

/**
 * Create a new resource and hydrate with given `attributes`,
 * or if `attributes` is already a resource return it.
 *
 * This is simply sugar for `new Resource(attributes)`.
 *
 * @param {Object} attributes
 * @returns {module:mio.Resource}
 */
Resource.create = function(attributes) {
  if (attributes instanceof this) {
    return attributes;
  } else {
    return new (this)(attributes);
  }
};

/**
 * Get a resource with given `query`.
 *
 * If `query` is a non-object (such as an ID) it's transformed into
 * `{ where: { primary: query } }`.
 *
 * @example
 *
 * ```javascript
 * User.get(123, function (err, user) {
 *   // ...
 * });
 * ```
 *
 * @param {module:mio.Query} query
 * @param {module:mio.Resource.get.get} callback
 * @returns {module:mio.Resource|module:mio.Query}
 * @fires module:mio.Resource.hook.get
 * @fires module:mio.Resource.on.get
 */
Resource.get = function(query, callback) {
  if (typeof query === 'string' || typeof query === 'number') {
    query = { where: { id: query } };
  }

  if (arguments.length < 2) {
    return new Query({
      context: this,
      handler: this.get,
      state: query
    });
  }

  /**
   * Runs before callback for `Resource.get` or `Resource#get`.
   *
   * @event get
   * @memberof module:mio.Resource.hook
   * @param {module:mio.Query} query
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.get` or `Resource#get`.
   *
   * @event get
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback get
   * @memberof module:mio.Resource.get
   * @param {Error} err
   * @param {module:mio.Resource} resource
   */
  return this.trigger('get', new Query({
    context: this,
    state: query
  }), callback);
};

/**
 * Replace or create resource using given `query` and `representation`.
 *
 * @param {module:mio.Query} query
 * @param {Object} representation
 * @param {module:mio.Resource.put.put} callback
 * @returns {module:mio.Resource|module:mio.Query}
 * @fires module:mio.Resource.hook.put
 * @fires module:mio.Resource.on.put
 */
Resource.put = function (query, representation, callback) {
  if (arguments.length === 1) {
    representation = query;

    return new Query({
      context: this,
      handler: function (query, callback) {
        this.put(query, representation, callback);
      }
    });
  }

  /**
   * Runs before callback for `Resource.put` or `Resource#put`.
   *
   * @event put
   * @memberof module:mio.Resource.hook
   * @param {module:mio.Query} query
   * @param {Object|module:mio.Resource} representationresentation
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.put` or `Resource#put`.
   *
   * @event put
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Object|module:mio.Resource} representationresentation
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback put
   * @memberof module:mio.Resource.put
   * @param {Error} err
   * @param {module:mio.Resource} resource
   */
  return this.trigger('put', new Query({
    context: this,
    state: query
  }), representation, callback);
};

/**
 * Patch resource using given `query` and corresponding set of `changes`.
 *
 * To patch multiple resources use `Resource.Collection.patch`.
 *
 * @example
 *
 * ```javascript
 * User.patch({ active: true }, { active: false }, function(err) {
 *   // ...
 * });
 * ```
 *
 * @param {module:mio.Query} query
 * @param {Object|Array} changes
 * @param {module:mio.Resource.patch.patch} callback
 * @returns {module:mio.Resource|module:mio.Query}
 * @fires module:mio.Resource.hook.patch
 * @fires module:mio.Resource.on.patch
 */
Resource.patch = function (query, changes, callback) {
  if (arguments.length === 1) {
    changes = query;

    return new Query({
      context: this,
      handler: function (query, callback) {
        this.patch(query, changes, callback);
      }
    });
  }

  /**
   * Runs before callback for `Resource.patch` or `Resource#patch`.
   *
   * @event patch
   * @memberof module:mio.Resource.hook
   * @param {module:mio.Query} query
   * @param {Object|Array.<Object>} patch
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.patch` or `Resource#patch`.
   *
   * @event patch
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Object|Array.<Object>} patch
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback patch
   * @memberof module:mio.Resource.patch
   * @param {Error} err
   * @param {module:mio.Resource} resource
   */
  return this.trigger('patch', new Query({
    context: this,
    state: query
  }), changes, callback);
};

/**
 * Post resource using given `representation`.
 *
 * To post multiple resources use `Resource.Collection.post`.
 *
 * @param {Object} representation
 * @param {module:mio.Resource.post.post} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.hook.post
 * @fires module:mio.Resource.on.post
 */
Resource.post = function (representation, callback) {

  /**
   * Runs before callback for `Resource.post` or `Resource#post`.
   *
   * @event post
   * @memberof module:mio.Resource.hook
   * @param {module:mio.Query} query
   * @param {Object|module:mio.Resource} representation
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.post` or `Resource#post`.
   *
   * @event post
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {Object|module:mio.Resource} representation
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback post
   * @memberof module:mio.Resource.post
   * @param {Error} err
   * @param {module:mio.Resource} resource
   */
  return this.trigger('post', representation, callback);
};

/**
 * Delete resource using given `query`.
 *
 * To delete multiple resources use `Resource.Collection.delete`.
 *
 * @param {module:mio.Query} query
 * @param {module:mio.Resource.delete} callback
 * @returns {module:mio.Resource|query}
 * @fires module:mio.Resource.hook.delete
 * @fires module:mio.Resource.on.delete
 */
Resource.delete = function(query, callback) {
  if (typeof query === 'function') {
    callback = query;
    query = {};
  }

  if (arguments.length === 0) {
    return new Query({
      context: this,
      handler: this.delete
    });
  }

  /**
   * Runs before callback for `Resource.delete` or `Resource#delete`.
   *
   * @event delete
   * @memberof module:mio.Resource.hook
   * @param {module:mio.Query} query
   * @param {module:mio.Resource.trigger.next} next
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Runs at the beginning of callback for `Resource.delete` or `Resource#delete`.
   *
   * @event delete
   * @memberof module:mio.Resource.on
   * @param {module:mio.Query} query
   * @param {module:mio.Resource} resource included if triggered by instance.
   * @this {module:mio.Resource}
   */

  /**
   * Receives arguments passed from the last hook's `next`.
   *
   * @callback delete
   * @memberof module:mio.Resource.delete
   * @param {Error} err
   */
  return this.trigger('delete', new Query({
    context: this,
    state: query
  }), callback);
};

/**
 * Define a new relationship attribute. This is a helper method used by the
 * relation methods such as `.hasOne()`, `.hasMany()`, etc.
 *
 * @param {String} type hasOne, hasMany, belongsTo, or belongsToMany
 * @param {String} attr attribute name
 * @param {Object} params
 * @returns {module:mio.Resource}
 * @private
 */
Resource.addRelation = function (type, attr, params) {
  var options = {
    relation: {
      attribute: attr,
      type: type,
      target: params.target,
      foreignKey: params.foreignKey,
      nested: params.nested
    }
  };

  for (var key in params) {
    if (!params.hasOwnProperty || params.hasOwnProperty(key)) {
      if (!key.match(/^(type|attribute|target|foreignKey|nested)$/)) {
        options[key] = params[key];
      }
    }
  }

  return this.attr(attr, options);
};

/**
 * The `belongsTo` relationship is used when a resource is a member of another
 * target resource. It can be used in a one-to-one association as the inverse of
 * `hasOne`, or in a one-to-many association as the inverse of a `hasMany`.
 * In both cases, the `belongsTo` relationship is referenced by a
 * foreign key on the current resource.
 *
 * @example
 *
 * ```javascript
 * Book.belongsTo('author', {
 *   target: Author,
 *   foreignKey: 'author_id'
 * }):
 *
 * Book.get(1).withRelated('author').exec(function (err, book) {
 *   assert(book.author instanceof Author);
 * });
 * ```
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {module:mio.Resource|Function} params.target can be a function that returns
 * constructor to avoid circular reference issues
 * @param {String} params.foreignKey foreign key on current resource.
 * @param {Boolean} params.nested whether to always include (default: false)
 * @returns {module:mio.Resource}
 */
Resource.belongsTo = function (attr, params) {
  return this.addRelation('belongsTo', attr, params);
};

/**
 * A one-to-one relation, where the resource has exactly one of the specified
 * target resource, referenced by a foreign key on the target resource.
 *
 * @example
 *
 * ```javascript
 * Patient.hasOne('record', {
 *   target: Record,
 *   foreignKey: 'patient_id'
 * });
 *
 * Patent.get(1).withRelated('record').exec(function (err, patient) {
 *   assert(patient.record instanceof Record);
 * });
 * ```
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {module:mio.Resource} params.target
 * @param {String} params.foreignKey foreign key on target resource.
 * @param {Boolean} params.nested whether to always include (default: false)
 * @returns {module:mio.Resource}
 */
Resource.hasOne = function (attr, params) {
  return this.addRelation('hasOne', attr, params);
};

/**
 * The `hasMany` relationship is for a resource with a one-to-many
 * relationship with the target resource. The resource is referenced by a
 * foreign key on the target resource.
 *
 * ```javascript
 * Organization.hasMany('members', {
 *   target: User,
 *   foreignKey: 'organization_id'
 * });
 *
 * Organization.get(1).withRelated('members').exec(function (err, organization)
 *   organization.members.forEach(function (member) {
 *     assert(member instanceof User);
 *   });
 * });
 * ```
 *
 * Many-to-many relationships can be modeled using an intermediary resource,
 * where the current resource is joined to the target resources through an
 * intermediary resource.
 *
 * ```javascript
 * Membership
 *   .belongsTo('organization', {
 *     target: Organization,
 *     foreignKey: 'organization_id'
 *   })
 *   .belongsTo('user', {
 *     target: User,
 *     foreignKey: 'user_id'
 *   });
 *
 * Organization.hasMany('memberships', {
 *   target: Membership,
 *   foreignKey: 'organization_id'
 * });
 *
 * Organization.get(1)
 *   .withRelated('memberships'
 *   .exec(function (err, organization) {
 *     organization.memberships.forEach(function (member) {
 *       assert(membership.member instanceof User);
 *       assert(membership.organization instanceof Organization);
 *     });
 *   });
 * ```
 *
 * While this strategy may seem verbose, it is robust and allows for
 * relationships that keep state such as a membership role, or the date a post
 * was tagged. Sometimes you need both the intermediary resource and the
 * resources it relates, and other times you need solely the relationship
 * (intermediary resource).
 *
 * @param {String} attr name of the attribute populated with target resource
 * @param {Object} params additional parameters passed to `.attr()`
 * @param {module:mio.Resource|Function} params.target can be a function that returns
 * constructor to avoid circular reference issues
 * @param {String} params.foreignKey foreign key on target resource.
 * @param {Boolean} params.nested always include relation in queries (default: false)
 * @returns {module:mio.Resource}
 */
Resource.hasMany = function (attr, params) {
  return this.addRelation('hasMany', attr, params);
};

/**
 * Register `listener` to be called when `event` is emitted.
 *
 * @param {String} event
 * @param {Function} listener
 * @returns {module:mio.Resource}
 */
Resource.on = function(event, listener) {
  if (listener instanceof Array) {
    for (var i = 0, l = listener.length; i < l; i++) {
      this.on(event, listener[i]);
    }
  } else {
    if (!this.listeners[event]) {
      this.listeners[event] = [listener];
    }
    else {
      this.listeners[event].push(listener);
    }
  }

  return this;
};

Resource.prototype.on = Resource.on;

/**
 * Register `listener` to be called once when `event` is next emitted.
 *
 * @param {String} event
 * @param {Function} listener
 * @returns {module:mio.Resource}
 */
Resource.once = function(event, listener) {
  listener.once = true;
  return this.on.apply(this, arguments);
};

Resource.prototype.once = Resource.once;

/**
 * Emit `event` and call listeners.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @returns {module:mio.Resource}
 */
Resource.emit = function(event) {
  var args = Array.prototype.slice.call(arguments, 1);
  var listeners = this.listeners[event];

  if (listeners) {
    for (var i=0, l=listeners.length; i<l; i++) {
      listeners[i].apply(this, args);

      if (listeners[i].once) {
        listeners.splice(i, 1);
        l = listeners.length;
      }
    }
  }

  return this;
};

Resource.prototype.emit = Resource.emit;

/**
 * Register `hook` to be called before `event`.
 *
 * Hooks are {@link module:mio.Resource.trigger|triggered} by various methods
 * such as {@link module:mio.Resource.get} or
 * {@link module:mio.Resource#post}, are asynchronous, and run in series.
 * Hooks receive a `next` function as the last argument, which must be called
 * to continue firing subsequent listeners. Subsequent hooks will not be run
 * if `next` receives any arguments. Arguments received by `next` are passed to
 * the callback of the method that fired the event.
 *
 * @example
 *
 * ```javascript
 * User.hook('get', function (query, next) {
 *   // do something before save such as validation and then call next()
 * });
 * ```
 *
 * @param {String} event
 * @param {Function} hook
 */
Resource.hook = Resource.before = function(event, hook) {
  if (hook instanceof Array) {
    for (var i = 0, l = hook.length; i < l; i++) {
      this.hook(event, hook[i]);
    }
  } else {
    if (!this.hooks[event]) {
      this.hooks[event] = [hook];
    }
    else {
      this.hooks[event].push(hook);
    }
  }

  return this;
};

Resource.prototype.before = Resource.before;
Resource.prototype.hook = Resource.hook;

/**
 * Run {@link module:mio.Resource.before} hooks for given `event`.
 *
 * Hooks are {@link module:mio.Resource.trigger|triggered} by various methods
 * such as {@link module:mio.Resource.get} or
 * {@link module:mio.Resource#post}, are asynchronous, and run in series.
 * Hooks receive a `next` function as the last argument, which must be called
 * to continue firing subsequent listeners. Subsequent hooks will not be run
 * if `next` receives any arguments. Arguments received by `next` are passed to
 * the callback of the method that fired the event.
 *
 * @param {String} event
 * @param {Mixed} args multiple arguments can be passed
 * @param {Function} callback
 * @returns {module:mio.Resource}
 */
Resource.trigger = function(event, args, callback) {
  var Resource = this.dirtyAttributes ? this.constructor : this;
  var resource = this.isNew && this;

  args = Array.prototype.slice.call(arguments, 1);

  if (args.length === 1) {
    callback = args[0];
    args = [];
  } else if (args.length === 2) {
    callback = args[1];
    args = [args[0]];
  } else {
    callback = args.pop();
  }

  var hooks = Resource.hooks[event] || [];
  var instanceHooks = (resource && resource.hooks[event]) || [];
  var self = resource || Resource;
  var nextArgs = args.concat(resource ? [next, resource] : [next]);
  var instanceNextArgs = args.concat([next]);
  var instanceArgs = args.concat([resource]);

  if (hooks) {
    hooks = hooks.slice(0);
  }

  if (instanceHooks) {
    instanceHooks = instanceHooks.slice(0);
  }

  /**
   * Call the next hook in series, unless an `error` or `result` was received.
   *
   * @callback next
   * @memberof module:mio.Resource.trigger
   * @param {Error} error
   * @param {module:mio.Resource|Array.<module:mio.Resource>} result
   * @param {Mixed} ...
   */
  function next (err, result) {
    if (err || result) {
      done.apply(this, arguments);
    }
    else if (hooks.length) {
      hooks.shift().apply(Resource, nextArgs);
    }
    else if (instanceHooks.length) {
      instanceHooks.shift().apply(resource, instanceNextArgs);
    }
    else {
      done.apply(this, arguments);
    }
  }

  // Handle result and emit event(s).
  function done (err) {
    if (err) return callback.call(self, err);

    var cbArgs = Array.prototype.slice.call(arguments, 1);
    cbArgs.unshift(event);

    // Run `.on()` "EVENT" handlers.
    if (resource) {
      Resource.emit.apply(Resource, cbArgs.concat(instanceArgs));
      resource.emit.apply(resource, cbArgs.concat(args));
    }
    else {
      Resource.emit.apply(Resource, cbArgs.concat(args));
    }

    callback.apply(self, arguments);
  }

  next();

  return this;
};

Resource.prototype.trigger = Resource.trigger;

/**
 * Refresh the resource instance with the representation passed to the last
 * hook's `next()`.
 *
 * @param {module:mio.Resource.get.get} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.hook.get
 * @fires module:mio.Resource.on.get
 */
Resource.prototype.get = function (callback) {
  var query = this.primaryKeyQuery();

  return this.trigger('get', query, function (err, representation) {
    if (err) return callback.call(this, err);

    if (representation) {
      this.reset(representation);
    }

    callback.apply(this, arguments);
  });
};

/**
 * Replace resource with instance representation.
 *
 * @param {module:mio.Resource.put.put} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.hook.put
 * @fires module:mio.Resource.on.put
 */
Resource.prototype.put = function (callback) {
  var query = this.primaryKeyQuery();
  return this.trigger('put', query, this.toJSON(), callback);
};

/**
 * Patch resource with diff of instance representation.
 *
 * @param {module:mio.Resource.patch.patch} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.hook.patch
 * @fires module:mio.Resource.on.patch
 */
Resource.prototype.patch = function (callback) {
  var query = this.primaryKeyQuery();
  return this.trigger('patch', query, this.changed(), callback);
};

/**
 * Post resource and update instance.
 *
 * @param {postCallback} callback
 * @returns {resource}
 * @fires module:mio.Resource.hook.post
 * @fires module:mio.Resource.on.post
 */
Resource.prototype.post = function (callback) {
  var representation = this;

  return this.trigger('post', this.changed(), callback);
};

/**
 * Delete resource.
 *
 * @param {module:mio.Resource.delete.delete} callback
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.hook.delete
 * @fires module:mio.Resource.on.delete
 */
Resource.prototype.delete = function (callback) {
  return this.trigger('delete', this.primaryKeyQuery(), callback);
};

/**
 * Return a query using the resources primary key.
 *
 * @returns {module:mio.Query}
 * @private
 */
Resource.prototype.primaryKeyQuery = function () {
  var query = new Query({
    context: this
  });

  if (this.primary) {
    query.where(this.constructor.primaryKey, this.primary);
  }

  return query;
};

/**
 * Check if resource is new and has not been saved.
 *
 * @returns {Boolean}
 */
Resource.prototype.isNew = function() {
  var primaryKey = this.constructor.primaryKey;

  if (primaryKey) {
    return !this[primaryKey] || this.isDirty(primaryKey);
  }
  else {
    throw new Error("Primary key has not been defined.");
  }
};

/**
 * Check if resource is dirty (has any changed attributes).
 * If an attribute name is specified, check if that attribute is dirty.
 *
 * @param {String} attr optional attribute to check if dirty
 * @returns {Boolean}
 */
Resource.prototype.isDirty = function(attr) {
  if (attr) {
    return Boolean(~this.dirtyAttributes.indexOf(attr));
  }

  return this.dirtyAttributes.length > 0;
};

/**
 * Return dirty attributes (changed since last put/patch/post/reset).
 *
 * @returns {Object}
 */
Resource.prototype.changed = function() {
  var changed = Object.create(null);

  for (var len = this.dirtyAttributes.length, i=0; i<len; i++) {
    var name = this.dirtyAttributes[i];
    if (this.constructor.attributes[name]) {
      changed[name] = this[name];
    }
  }

  return changed;
};

/**
 * Check if resource has given `attr`.
 *
 * @param {String} attr
 * @returns {Boolean}
 */
Resource.prototype.has = function(attr) {
  return this.constructor.attributes[attr] !== undefined;
};

/**
 * Set given resource `attributes`.
 *
 * Alternatively, set a key-value pair.
 *
 * @param {Object} attributes
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.on.set
 */
Resource.prototype.set = function (attributes) {
  if (arguments.length === 2) {
    var key = arguments[0];
    var value = arguments[1];
    attributes = {};
    attributes[key] = value;
  } else {

    /**
     * @event set
     * @memberof module:mio.Resource.on
     * @param {Resource} resource
     * @param {Object} attributes
     */
    this.constructor.emit('set', this, attributes);
    this.emit('set', attributes);

    for (var attr in attributes) {
      if (this.constructor.attributes[attr]) {
        this[attr] = attributes[attr];
      }
    }
  }

  return this;
};

/**
 * Reset attributes for resource. Marks resource as clean. Instance attributes
 * not defined in `attributes` will be reset to `undefined`.
 *
 * @param {Object} attributes
 * @returns {module:mio.Resource}
 * @fires module:mio.Resource.on.reset
 */
Resource.prototype.reset = function (attributes) {

  /**
   * @event reset
   * @memberof module:mio.Resource.on
   * @param {module:mio.Resource} resource
   * @param {Object} attributes
   */
  this.constructor.emit('reset', this, attributes);
  this.emit('reset', attributes);

  this.dirtyAttributes.length = 0;

  for (var attr in attributes) {
    if (this.constructor.attributes[attr]) {
      this.attributes[attr] = attributes[attr];
    }
  }

  return this;
};

/**
 * Returns map of HTTP methods to resource URLs. If `method` is specified, the
 * URL for that `method` is returned.
 *
 * @param {String=} method
 * @returns {Object|String}
 */
Resource.url = function (method) {
  var baseUrl = this.baseUrl;
  var urls = this.urls;

  if (!urls) {
    if (baseUrl) {
      urls = {
        'get': baseUrl + '/:primary',
        'put': baseUrl + '/:primary',
        'patch': baseUrl + '/:primary',
        'post': baseUrl,
        'delete': baseUrl + '/:primary',
        'options': baseUrl + '/:primary'
      };
    } else {
      urls = {};
    }
  }

  this.urls = urls;

  return method ? urls[method] : urls;
};

/**
 * Returns map of HTTP methods to resource URLs. If `method` is specified, the
 * URL for that `method` is returned.
 *
 * @param {String=} method
 * @returns {Object|String}
 */
Resource.prototype.url = function (method) {
  return this.constructor.url(method);
};

/**
 * Return serializable attributes for JSON representation.
 *
 * @returns {Object}
 * @private
 */
Resource.prototype.toJSON = function () {
  var attrs = this.constructor.attributes;
  var json = {};

  for (var attr in attrs) {
    if (attrs[attr].serializable !== false) {
      json[attr] = this[attr];
    }
  }

  return json;
};
