var Future;

Future = Npm.require('fibers/future');

Meteor.methods({

  /*
    Search
    @query: string value to search for
    @options: optional object with optional params
      @collection: name of the collection to search
      @fileds: array of field names to search
      @size: number of results to return
   */
  search: function(searchQuery, options) {
    var f, field, future, index, query, _i, _len, _ref;
    index = options && options.index || Meteor.settings.app_name.replace(/\s+/g, '-').toLowerCase() || "meteor-river";
    query = {
      index: index,
      body: {
        query: {
          match: {
            name: searchQuery
          }
        }
      }
    };
    if (options) {
      if (options.collection) {
        query.type = options.collection;
      }
      if (options.fields) {
        query.body.query = {
          bool: {
            should: []
          }
        };
        _ref = options.fields;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          field = _ref[_i];
          f = {
            match: {}
          };
          f.match[field] = searchQuery;
          query.body.query.bool.should.push(f);
        }
      }
      if (options.size) {
        query.body.size = options.size;
      }
    }
    future = new Future();
    ES.search(query).then(function(resp) {
      var hits;
      hits = resp.hits.hits;
      Logger.log("elasticsearch", 'Search results for "' + searchQuery + '" returned', resp);
      return future["return"](hits);
    }, function(err) {
      return console.trace(err.message);
    });
    return future.wait();
  }
});