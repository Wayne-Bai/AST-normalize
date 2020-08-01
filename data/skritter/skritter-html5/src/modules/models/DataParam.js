/**
 * @module Application
 */
define([
    'core/modules/GelatoModel'
], function(GelatoModel) {

    /**
     * @class DataParam
     * @extends GelatoModel
     */
    var DataParam = GelatoModel.extend({
        /**
         * @property idAttribute
         * @type String
         */
        idAttribute: 'id',
        /**
         * @method defaults
         * @returns {Object}
         */
        defaults: function () {
            return {
                contains: [],
                corners: [],
                strokeId: undefined
            };
        },
        /**
         * @method angle
         * @returns {Number}
         */
        getAngle: function() {
            return app.fn.getAngle(this.get('corners'));
        },
        /**
         * @method getFirstAngle
         * @returns {Number}
         */
        getFirstAngle: function() {
            return app.fn.getAngle(this.get('corners')[0], this.get('corners')[1]);
        },
        /**
         * @method getCornerLength
         * @returns {Number}
         */
        getLength: function() {
            var cornersLength = 0;
            var corners = this.get('corners');
            for (var i = 0, length = corners.length - 1; i < length; i++) {
                cornersLength += app.fn.getDistance(corners[i], corners[i + 1]);
            }
            return cornersLength;
        },
        /**
         * @method getRectangle
         * @returns {Object}
         */
        getRectangle: function() {
            var corners = _.clone(this.get('corners'));
            return app.fn.getBoundingRectangle(corners, this.size, this.size, 18);
        }
    });

    return DataParam;

});