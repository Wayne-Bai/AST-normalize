/**
 * @module Application
 */
define([
    'core/modules/GelatoCollection',
    'modules/models/CanvasStroke'
], function(GelatoCollection, CanvasStroke) {

    /**
     * @class CanvasCharacter
     * @extend GelatoCollection
     */
    var CanvasCharacter = GelatoCollection.extend({
        /**
         * @method initialize
         * @param {Array|Object} [models]
         * @param {Object} [options]
         * @constructor
         */
        initialize: function(models, options) {
            options = options || {};
            this.targets = [];
        },
        /**
         * @property model
         * @type CanvasStroke
         */
        model: CanvasStroke,
        /**
         * @method comparator
         * @param {CanvasStroke} stroke
         * @returns {Number}
         */
        comparator: function(stroke) {
            return stroke.attributes.position;
        },
        /**
         * @method getNextStroke
         * @returns {CanvasStroke}
         */
        getNextStroke: function() {
            var target = this.getExpectedTargets()[0];
            return this.length ? target.at(this.getPosition()) : target.at(0);
        },
        /**
         * @method getExpectedTargets
         * @returns {Array}
         */
        getExpectedTargets: function() {
            var expected = [];
            var scores = [];
            for (var a = 0, lengthA = this.targets.length; a < lengthA; a++) {
                var target = this.targets[a];
                scores[a] = 0;
                for (var b = 0, lengthB = this.length; b < lengthB; b++) {
                    scores[a] += target.findWhere({id: this.at(b).id}) ? 1 : 0;
                }
            }
            var best = scores[scores.indexOf(Math.max.apply(Math, scores))];
            for (var c = 0, lengthC = scores.length; c < lengthC; c++) {
                if (scores[c] === best) {
                    expected.unshift(this.targets[c]);
                }
            }
            return expected.length ? expected : [this.targets[0]];
        },
        /**
         * @method getMaxPosition
         * @returns {Number}
         */
        getMaxPosition: function() {
            var max = 0;
            for (var i = 0, length = this.targets.length; i < length; i++) {
                var targetMax = this.targets[i].getPosition();
                max = targetMax > max ? targetMax : max;
            }
            return max;
        },
        /**
         * @method getPosition
         * @returns {Number}
         */
        getPosition: function() {
            var position = 1;
            for (var i = 0, length = this.length; i < length; i++) {
                var contains = this.at(i).get('contains');
                position += contains.length ? contains.length : 1;
            }
            return position;
        },
        /**
         * @method getShape
         * @param {Number} [excludeStrokes]
         * @returns {createjs.Container}
         */
        getShape: function(excludeStrokes) {
            var container = new createjs.Container();
            for (var i = 0, length = this.length; i < length; i++) {
                if (!excludeStrokes) {
                    container.addChild(this.at(i).getShape());
                }
            }
            container.name = 'character';
            return container;
        },
        /**
         * @method size
         * @returns {Number}
         */
        getSize: function() {
            return app.get('canvasSize');
        },
        /**
         * @method getTone
         * @param {Number} number
         * @returns {CanvasStroke}
         */
        getTone: function(number) {
            return this.writing === 'tones' ? this.targets[number - 1].at(0) : null;
        },
        /**
         * @method isComplete
         * @returns {Boolean}
         */
        isComplete: function() {
            return this.getPosition() >= this.getMaxPosition();
        },
        /**
         * @method recognize
         * @param {Array} points
         * @param {createjs.Shape} shape
         * @param {Number} size
         * @returns {CanvasStroke}
         */
        recognize: function(points, shape) {
            if (points && points.length > 1) {
                var newStroke = new CanvasStroke({points: points});
                var stroke = app.fn.recognizer.recognize(newStroke, this, this.getSize());
                if (stroke) {
                    stroke.set('squig', shape);
                    return this.add(stroke);
                }
            }
        }
    });

    return CanvasCharacter;

});