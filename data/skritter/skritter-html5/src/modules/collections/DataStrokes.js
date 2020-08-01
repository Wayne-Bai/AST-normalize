/**
 * @module Application
 */
define([
    'core/modules/GelatoCollection',
    'modules/models/DataStroke',
    'modules/data/Kana',
    'modules/data/Tones'
], function(GelatoCollection, DataStroke, Kana, Tones) {

    /**
     * @class DataStrokes
     * @extend GelatoCollection
     */
    var DataStrokes = GelatoCollection.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {
            this.add(Kana.getData());
            this.add(Tones.getData());
        },
        /**
         * @property model
         * @type DataStroke
         */
        model: DataStroke
    });

    return DataStrokes;

});