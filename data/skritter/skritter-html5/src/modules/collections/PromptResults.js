/**
 * @module Application
 */
define([
    'core/modules/GelatoCollection',
    'modules/models/PromptResult'
], function(GelatoCollection, PromptResult) {

    /**
     * @class PromptResults
     * @extend GelatoCollection
     */
    var PromptResults = GelatoCollection.extend({
        /**
         * @property model
         * @type DataDecomp
         */
        model: PromptResult
    });

    return PromptResults;

});