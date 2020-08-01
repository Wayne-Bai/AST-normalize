/**
 * @ngdoc service
 * @name ExpertsInside.SharePoint.List.$spList
 * @requires ExpertsInside.SharePoint.Core.$spRest
 * @requires ExpertsInside.SharePoint.Core.$spConvert
 *
 * @description A factory which creates a list item resource object that lets you interact with
 *   SharePoint List Items via the SharePoint REST API.
 *
 *   The returned list item object has action methods which provide high-level behaviors without
 *   the need to interact with the low level $http service.
 *
 * @param {string} title The title of the SharePoint List (case-sensitive).
 *
 * @param {Object=} listOptions Hash with custom options for this List. The following options are
 *   supported:
 *
 *   - **`readOnlyFields`** - {Array.{string}=} - Array of field names that will be excluded
 *   from the request when saving an item back to SharePoint
 *   - **`query`** - {Object=} - Default query parameter used by each action. Can be
 *   overridden per action. Prefixing them with `$` is optional. Valid keys:
 *       - **`$select`**
 *       - **`$filter`**
 *       - **`$orderby`**
 *       - **`$top`**
 *       - **`$skip`**
 *       - **`$expand`**
 *       - **`$sort`**
 *   - **`inHostWeb`** - {boolean|string} - Set the host web url for the List. When set to
 *   `true`, ShareCoffe.Commons.getHostWebUrl() will be used. 
 *
 * @return {Object} A dynamically created  class constructor for list items.
 *   See {@link ExpertsInside.SharePoint.List.$spList+ListItem $spList+ListItem} for details.
 */
angular.module('ExpertsInside.SharePoint.List')
  .factory('$spList', function($spRest, $http, $spConvert) {
    'use strict';
    var $spListMinErr = angular.$$minErr('$spList');

    function listFactory(title, listOptions) {
      if (!angular.isString(title) || title === '') {
        throw $spListMinErr('badargs', 'title must be a nen-empty string.');
      }
      if(!angular.isObject(listOptions)) {
        listOptions = {};
      }

      var normalizedTitle = $spConvert.capitalize(title
        .replace(/[^A-Za-z0-9 ]/g, '') // remove invalid chars
        .replace(/\s/g, '_x0020_') // replace whitespaces with _x0020_
      );
      var className = $spConvert.capitalize(normalizedTitle
        .replace(/_x0020/g, '') // remove _x0020_
        .replace(/^\d+/,'') // remove leading digits
       );
      var listItemType = 'SP.Data.' + normalizedTitle + 'ListItem';

      // Constructor function for List dynamically generated List class
      /**
       * @ngdoc service
       * @name ExpertsInside.SharePoint.List.$spList+ListItem
       *
       * @description The dynamically created List Item class, created by
       *   {@link ExpertsInside.SharePoint.List.$spList $spList}. 
       *
       *   Note that all methods prefixed with a `$` are *instance* (or prototype) methods.
       *   Ngdoc doesn't seem to have out-of-box support for those.
       */
      var List = (function() {
        // jshint evil:true, validthis:true
        function __List__(data) {
          this.__metadata = {
            type: listItemType
          };
          angular.extend(this, data);
        }
        var script =
        " (function() {                     " +
            __List__.toString()               +
        "   return __List__;                " +
        " })();                             ";
        return eval(script.replace(/__List__/g, className));
      })();

      /**
       * @private
       * Title of the list
       */
      List.$$title = title;

      /**
       * @private
       * Allowed query parameters
       */
      List.$$queryParameterWhitelist =
        ['$select', '$filter', '$orderby', '$top', '$skip', '$expand', '$sort'];

      /**
       * @private
       * Web relative list url
       */
      List.$$relativeUrl = "web/lists/getByTitle('" + List.$$title + "')";

      /**
       * @private
       * Is this List in the host web?
       */
      List.$$inHostWeb = listOptions.inHostWeb;

      /**
       * @private
       * Decorate the result with $promise and $resolved
       */
      List.$$decorateResult = function(result, httpConfig) {
        if (!angular.isArray(result) && !(result instanceof List)) {
          result = new List(result);
        }
        if (angular.isUndefined(result.$resolved)) {
          result.$resolved = false;
        }
        result.$promise = $http(httpConfig).then(function(response) {
          var data = response.data;

          if (angular.isArray(result) && angular.isArray(data)) {
            angular.forEach(data, function(item) {
              result.push(new List(item));
            });
          } else if (angular.isObject(result)) {
            if (angular.isArray(data)) {
              if (data.length === 1) {
                angular.extend(result, data[0]);
              } else {
                throw $spListMinErr('badresponse', 'Expected response to contain an array with one object but got {1}',
                  data.length);
              }
            } else if (angular.isObject(data)) {
              angular.extend(result, data);
            }
          } else {
            throw $spListMinErr('badresponse', 'Expected response to contain an {0} but got an {1}',
              angular.isArray(result) ? 'array' : 'object', angular.isArray(data) ? 'array' : 'object');
          }

          var responseEtag;
          if(response.status === 204 && angular.isString(responseEtag = response.headers('ETag'))) {
            result.__metadata.etag = responseEtag;
          }
          result.$resolved = true;

          return result;
        });

        return result;
      };

      /**
       * @private
       * @description Builds the http config for the list CRUD actions
       *
       * @param {Object} list List constructor
       * @param {string} action CRUD action
       *
       * @returns {Object} http config
       */
      List.$$buildHttpConfig = function(action, options) {
        var baseUrl = List.$$relativeUrl + '/items';
        var httpConfig = {
          url: baseUrl
        };
        if (angular.isString(List.$$inHostWeb)) {
          httpConfig.hostWebUrl = List.$$inHostWeb;
        } else if (List.$$inHostWeb) {
          httpConfig.hostWebUrl = ShareCoffee.Commons.getHostWebUrl();
        }

        action = angular.isString(action) ? action.toLowerCase() : '';
        options = angular.isDefined(options) ? options : {};
        var query = angular.isDefined(options.query) ?
          $spRest.normalizeParams(options.query, List.$$queryParameterWhitelist) :
          {};

        switch(action) {
        case 'get':
          if (angular.isUndefined(options.id)) {
            throw $spListMinErr('options:get', 'options must have an id');
          }

          httpConfig.url += '(' + options.id + ')';
          httpConfig = ShareCoffee.REST.build.read['for'].angularJS(httpConfig);
          break;
        case 'query':
          httpConfig = ShareCoffee.REST.build.read['for'].angularJS(httpConfig);
          break;
        case 'create':
          if (angular.isUndefined(options.item)) {
            throw $spListMinErr('options:create', 'options must have an item');
          }
          if (angular.isUndefined(options.item.__metadata)) {
            throw $spListMinErr('options:create', 'options.item must have __metadata property');
          }

          if (angular.isDefined(query)) {
            delete query.$expand;
          }

          httpConfig.payload = options.item.$toJson();
          httpConfig = ShareCoffee.REST.build.create['for'].angularJS(httpConfig);
          break;
        case 'update':
          if (angular.isUndefined(options.item)) {
            throw $spListMinErr('options:update', 'options must have an item');
          }
          if (angular.isUndefined(options.item.__metadata)) {
            throw $spListMinErr('options:create', 'options.item must have __metadata property');
          }

          query = {}; // does nothing or breaks things, so we ignore it
          httpConfig.url += '(' + options.item.Id + ')';
          httpConfig.payload = options.item.$toJson();
          httpConfig.eTag = !options.force && angular.isDefined(options.item.__metadata) ?
            options.item.__metadata.etag : null;

          httpConfig = ShareCoffee.REST.build.update['for'].angularJS(httpConfig);
          break;
        case 'delete':
          if (angular.isUndefined(options.item)) {
            throw $spListMinErr('options:delete', 'options must have an item');
          }
          if (angular.isUndefined(options.item.__metadata)) {
            throw $spListMinErr('options:delete', 'options.item must have __metadata');
          }

          httpConfig.url += '(' + options.item.Id + ')';
          httpConfig = ShareCoffee.REST.build['delete']['for'].angularJS(httpConfig);
          break;
        }

        httpConfig.url = $spRest.appendQueryParameters(httpConfig.url, query);
        httpConfig.transformResponse = $spRest.transformResponse;

        return httpConfig;
      };

      /**
       * @ngdoc method
       * @name ExpertsInside.SharePoint.List.$spList#get
       * @methodOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Get a single list item by id
       *
       * @param {Number} id Id of the list item
       * @param {Object=} query Additional query properties
       *
       * @return {Object} List item instance
       */
      List.get = function(id, query) {
        if (angular.isUndefined(id) || id === null) {
          throw $spListMinErr('badargs', 'id is required.');
        }

        var result = {
          Id: id
        };
        var httpConfig = List.$$buildHttpConfig('get', {id: id, query: query});

        return List.$$decorateResult(result, httpConfig);
      };

      /**
       * @ngdoc method
       * @name ExpertsInside.SharePoint.List.$spList#query
       * @methodOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Query for the list for items
       *
       * @param {Object=} query Query properties
       * @param {Object=} options Additional query options.
       *   Accepts the following properties:
       *   - **`singleResult`** - {boolean} - Returns and empty object instead of an array. Throws an
       *     error when more than one item is returned by the query.
       *
       * @return {Array<Object>} Array of list items
       */
      List.query = function(query, options) {
        var result = (angular.isDefined(options) && options.singleResult) ? {} : [];
        var httpConfig = List.$$buildHttpConfig('query', {
          query: angular.extend({}, List.prototype.$$queryDefaults, query)
        });

        return List.$$decorateResult(result, httpConfig);
      };

      /**
       * @ngdoc method
       * @name ExpertsInside.SharePoint.List.$spList#create
       * @methodOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Create a new list item on the server.
       *
       * @param {Object=} item Query properties
       * @param {Object=} options Additional query properties.
       *
       * @return {Object} The decorated list item
       */
      List.create = function(item, query) {
        if (!(angular.isObject(item) && item instanceof List)) {
          throw $spListMinErr('badargs', 'item must be a List instance.');
        }
        item.__metadata = angular.extend({
          type: listItemType
        }, item.__metadata);

        var httpConfig = List.$$buildHttpConfig('create', {
          item: item,
          query: angular.extend({}, item.$$queryDefaults, query)
        });

        return List.$$decorateResult(item, httpConfig);
      };

      /**
       * @ngdoc method
       * @name ExpertsInside.SharePoint.List.$spList#update
       * @methodOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Update an existing list item on the server.
       *
       * @param {Object=} item the list item
       * @param {Object=} options Additional update properties.
       *   Accepts the following properties:
       *   - **`force`** - {boolean} - Overwrite newer versions on the server.
       *
       * @return {Object} The decorated list item
       */
      List.update = function(item, options) {
        if (!(angular.isObject(item) && item instanceof List)) {
          throw $spListMinErr('badargs', 'item must be a List instance.');
        }

        options = angular.extend({}, options, {
          item: item
        });

        var httpConfig = List.$$buildHttpConfig('update', options);

        return List.$$decorateResult(item, httpConfig);
      };

      /**
       * @ngdoc method
       * @name ExpertsInside.SharePoint.List.$spList#save
       * @methodOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Update or create a list item on the server.
       *
       * @param {Object=} item the list item
       * @param {Object=} options Options passed to create or update.
       *
       * @return {Object} The decorated list item
       */
      List.save = function(item, options) {
        if (angular.isDefined(item.__metadata) && angular.isDefined(item.__metadata.id)) {
          return this.update(item, options);
        } else {
          var query = angular.isObject(options) ? options.query : undefined;
          return this.create(item, query);
        }
      };

      /**
       * @ngdoc method
       * @name ExpertsInside.SharePoint.List.$spList#delete
       * @methodOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Delete a list item on the server.
       *
       * @param {Object=} item the list item
       *
       * @return {Object} The decorated list item
       */
      List.delete = function(item) {
        if (!(angular.isObject(item) && item instanceof List)) {
          throw $spListMinErr('badargs', 'item must be a List instance.');
        }
        var httpConfig = List.$$buildHttpConfig('delete', {item: item});

        return List.$$decorateResult(item, httpConfig);
      };

      /**
       * @ngdoc object
       * @name ExpertsInside.SharePoint.List.$spList#queries
       * @propertyOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Object that holds the created named queries
       */
      List.queries = { };

      /**
       * @ngdoc method
       * @name ExpertsInside.SharePoint.List.$spList#addNamedQuery
       * @methodOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Add a named query to the queries hash
       *
       * @param {Object} name name of the query, used as the function name
       * @param {Function} createQuery callback invoked with the arguments passed to
       *   the created named query that creates the final query object
       * @param {Object=} options Additional query options passed to List.query
       *
       * @return {Array} The query result
       */
      List.addNamedQuery = function(name, createQuery, options) {
        List.queries[name] = function() {
          var query = angular.extend(
            {},
            List.prototype.$$queryDefaults,
            createQuery.apply(List, arguments)
          );
          return List.query(query, options);
        };
        return List;
      };

      /**
       * @ngdoc method
       * @name ExpertsInside.SharePoint.List.$spList#toJson
       * @methodOf ExpertsInside.SharePoint.List.$spList
       *
       * @description Create a copy of the item, remove read-only fields
       *   and stringify it.
       *
       * @param {Object} item list item
       *
       * @returns {string} JSON representation
       */
      List.toJson = function(item) {
        var copy = {};
        var blacklist = angular.extend([], item.$$readOnlyFields);

        angular.forEach(item, function(value, key) {
          if (key.indexOf('$') !== 0 && blacklist.indexOf(key) === -1) {
            copy[key] = value;
          }
        });
        return angular.toJson(copy);
      };

      List.prototype = {
        /**
         * @private
         * Properties stripped from JSON when saving an item to avoid server errors.
         */
        $$readOnlyFields: angular.extend([
          'AttachmentFiles',
          'Attachments',
          'Author',
          'AuthorId',
          'ContentType',
          'ContentTypeId',
          'Created',
          'Editor',
          'EditorId', 'FieldValuesAsHtml',
          'FieldValuesAsText',
          'FieldValuesForEdit',
          'File',
          'FileSystemObjectType',
          'FirstUniqueAncestorSecurableObject',
          'Folder',
          'GUID',
          'Modified',
          'OData__UIVersionString',
          'ParentList',
          'RoleAssignments'
        ], listOptions.readOnlyFields),
        /**
         * @private
         * Default query properties
         */
        $$queryDefaults: angular.extend({}, listOptions.query),
        /**
         * @ngdoc method
         * @name ExpertsInside.SharePoint.List.$spList+ListItem#$save
         * @methodOf ExpertsInside.SharePoint.List.$spList+ListItem
         *
         * @description **Instance method**
         *
         * Create or update the list item on the server.
         *
         * @param {Object=} options Options passed to List.Item.create or ListItem.update.
         *
         * @return {Object} Promise
         */
        $save: function(options) {
          return List.save(this, options).$promise;
        },
        /**
         * @ngdoc method
         * @name ExpertsInside.SharePoint.List.$spList+ListItem#$delete
         * @methodOf ExpertsInside.SharePoint.List.$spList+ListItem
         *
         * @description **Instance method**
         *
         * Delete this list item on the server.
         *
         * @return {Object} Promise
         */
        $delete: function() {
          return List.delete(this).$promise;
        },
        /**
         * @ngdoc method
         * @name ExpertsInside.SharePoint.List.$spList+ListItem#$isNew
         * @methodOf ExpertsInside.SharePoint.List.$spList+ListItem
         *
         * @description **Instance method**
         *
         * Check if an item is already persisted on the server
         *
         * @return {bool} `true` when already persisted, `false` otherwhise
         */
        $isNew: function() {
          return angular.isUndefined(this.__metadata) || angular.isUndefined(this.__metadata.id);
        },
        /**
         * @ngdoc method
         * @name ExpertsInside.SharePoint.List.$spList+ListItem#$toJson
         * @methodOf ExpertsInside.SharePoint.List.$spList+ListItem
         *
         * @description **Instance method**
         *
         * JSON representation of the item
         *
         * @return {string} JSON representation
         */
        $toJson: function() {
          return List.toJson(this);
        }
      };

      return List;
    }

    return listFactory;
  });
