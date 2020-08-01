/**
 * @module Application
 * @submodule Data
 * @class Tones
 */
define([], function() {

    /**
     * @property data
     * @type Object
     */
    var data = {
        lang: 'zh',
        rune: 'tones',
        strokes: [
            [[383, 0.20, 0.20, 0.6, 0.1, 0.0]],
            [[384, 0.25, 0.25, 0.5, 0.5, 0.0]],
            [[385, 0.15, 0.20, 0.7, 0.6, 0.0]],
            [[386, 0.25, 0.25, 0.5, 0.5, 0.0]],
            [[387, 0.40, 0.40, 0.20, 0.20, 0.0]]
        ]
    };
    /**
     * @method getData
     * @returns {Object}
     */
    function getData() {
        return data;
    }

    return {
        getData: getData
    };

});