/**
 * @module Application
 */
define([
    'core/modules/GelatoModel'
], function(GelatoModel) {

    /**
     * @class PromptResult
     * @extends GelatoModel
     */
    var PromptResult = GelatoModel.extend({
        /**
         * @method defaults
         * @returns {Object}
         */
        defaults: function() {
            return {
                character: null,
                complete: false,
                reviewingStart: 0,
                reviewingStop: 0,
                score: 3,
                submitTime: Moment().unix(),
                thinkingStop: 0,
                vocabId: null
            };
        },
        /**
         * @method getReviewingTime
         * @returns {Number}
         */
        getReviewingTime: function() {
            return (this.get('reviewingStop') - this.get('reviewingStart')) / 1000;
        },
        /**
         * @method getThinkingTime
         * @returns {Number}
         */
        getThinkingTime: function() {
            return (this.get('thinkingStop') - this.get('reviewingStart')) / 1000;
        },
        /**
         * @method start
         * @returns {PromptResult}
         */
        start: function() {
            if (this.get('reviewingStart') === 0) {
                this.set('reviewingStart', new Date().getTime());
            }
            return this;
        },
        /**
         * @method stop
         * @returns {PromptResult}
         */
        stop: function() {
            var timestamp = new Date().getTime();
            this.stopReviewing(timestamp);
            this.stopThinking(timestamp);
            return this;
        },
        /**
         * @method stopReviewing
         * @param {Number} [timestamp]
         * @returns {PromptResult}
         */
        stopReviewing: function(timestamp) {
            if (this.get('reviewingStop') === 0) {
                this.set('reviewingStop', timestamp || new Date().getTime());
            }
            return this;
        },
        /**
         * @method stopThinking
         * @param {Number} [timestamp]
         * @returns {PromptResult}
         */
        stopThinking: function(timestamp) {
            if (this.get('thinkingStop') === 0) {
                this.set('thinkingStop', timestamp || new Date().getTime());
            }
            return this;
        }
    });

    return PromptResult;

});