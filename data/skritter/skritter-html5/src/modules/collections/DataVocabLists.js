/**
 * @module Application
 */
define([
    'core/modules/GelatoCollection',
    'modules/models/DataVocabList'
], function(GelatoCollection, DataVocabList) {

    /**
     * @class DataVocabLists
     * @extend GelatoCollection
     */
    var DataVocabLists = GelatoCollection.extend({
        /**
         * @method initialize
         * @param {Array} [models]
         * @param {Object} [options]
         * @constructor
         */
        initialize: function(models, options) {
            options = options || {};
        },
        /**
         * @property model
         * @type DataVocabList
         */
        model: DataVocabList,
        /**
         * @method
         * @param {Function} callbackSuccess
         * @param {Function} callbackError
         */
        fetch: function(callbackSuccess, callbackError) {
            var self = this;
            (function next(cursor) {
                app.api.fetchVocabLists({
                    cursor: cursor,
                    lang: app.user.getLanguageCode(),
                    sort: 'studying'
                }, function(result) {
                    app.user.data.insert(result, function() {
                        self.add(result.VocabLists, {merge: true, silent: true});
                        if (result.cursor) {
                            next(result.cursor);
                        } else {
                            callbackSuccess(self);
                        }
                    });
                }, function(error) {
                    callbackError(error);
                });
            })();
        },
        /**
         * @method getAdding
         * @returns {Array}
         */
        getAdding: function() {
            return this.filter(function(list) {
                return list.get('studyingMode') === 'adding';
            });
        },
        /**
         * @method getReviewing
         * @returns {Array}
         */
        getReviewing: function() {
            return this.filter(function(list) {
                return list.get('studyingMode') === 'reviewing';
            });
        },
        /**
         * @method load
         * @param {Function} callbackSuccess
         * @param {Function} callbackError
         * @returns {DataVocabLists}
         */
        load: function(callbackSuccess, callbackError) {
            var self = this;
            Async.series([
                function(callback) {
                    self.fetch(function() {
                        callback();
                    }, function() {
                        callback();
                    });
                },
                function(callback) {
                    app.user.storage.all('vocablists', function(result) {
                        self.add(result, {merge: true});
                        callback();
                    }, function(error) {
                        callback(error);
                    });
                }
            ], function(error) {
                if (error) {
                    callbackError(error);
                } else {
                    callbackSuccess();
                }
            });
            return this;
        }
    });

    return DataVocabLists;

});