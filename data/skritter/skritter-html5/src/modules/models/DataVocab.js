/**
 * @module Application
 * @submodule Models
 */
define([
    'core/modules/GelatoModel',
    'modules/collections/PromptResults'
], function(GelatoModel, PromptResults) {

    /**
     * @class DataVocab
     * @extends GelatoModel
     */
    var DataVocab = GelatoModel.extend({
        /**
         * @method initialize
         * @param {Object} [attributes]
         * @param {Object} [options]
         * @constructor
         */
        initialize: function(attributes, options) {
            options = options || {};
        },
        /**
         * @property idAttribute
         * @type String
         */
        idAttribute: 'id',
        /**
         * @method getCanvasCharacters
         * @returns {Array}
         */
        getCanvasCharacters: function() {
            var characters = [];
            var strokes = this.getStrokes();
            for (var i = 0, length = strokes.length; i < length; i++) {
                var stroke = strokes[i];
                if (stroke) {
                    characters.push(stroke.getCanvasCharacter());
                }
            }
            return characters;
        },
        /**
         * @method getCanvasTones
         * @returns {Array}
         */
        getCanvasTones: function() {
            var characters = [];
            var strokes = this.getStrokes();
            for (var i = 0, length = strokes.length; i < length; i++) {
                var tones = app.user.data.strokes.get('tones');
                if (tones) {
                    characters.push(tones.getCanvasCharacter());
                }
            }
            return characters;
        },
        /**
         * @method getCharacters
         * @returns {Array}
         */
        getCharacters: function() {
            return this.get('writing').split('');
        },
        /**
         * @method getDefinition
         * @param {Boolean} [ignoreFormat]
         * @returns {String}
         */
        getDefinition: function(ignoreFormat) {
            var customDefinition = this.get('customDefinition');
            var definition = this.get('definitions')[app.user.settings.get('sourceLang')];
            if (customDefinition && customDefinition !== '') {
                definition = this.get('customDefinition');
            } else if (definition) {
                definition = this.get('definitions').en;
            }
            return ignoreFormat === false ? definition : app.fn.textToHTML(definition);
        },
        /**
         * @method getFontClass
         * @return {String}
         */
        getFontClass: function() {
            return this.isChinese() ? 'text-chinese' : 'text-japanese';
        },
        /**
         * @method getFontName
         * @return {String}
         */
        getFontName: function() {
            return this.isChinese() ? 'Simkai' : 'Kaisho';
        },
        /**
         * @method getHeisig
         * @returns {String}
         */
        getHeisig: function() {
            return null;
        },
        /**
         * @method getMnemonic
         * @returns {String}
         */
        getMnemonic: function() {
            return null;
        },
        /**
         * @method getPromptResult
         * @param {String} part
         * @returns {PromptResults}
         */
        getPromptResult: function(part) {
            var result = new PromptResults();
            var characters = part === 'tone' ? this.getCanvasTones() : this.getCanvasCharacters();
            var containedVocabIds = this.get('containedVocabIds') || [];
            if (['rune', 'tone'].indexOf(part) > -1 && containedVocabIds.length) {
                for (var i = 0, length = containedVocabIds.length; i < length; i++) {
                    result.add({character: characters[i], vocabId: containedVocabIds[i]});
                }
            } else {
                result.add({character: characters[0], vocabId: this.id});
            }
            return result;
        },
        /**
         * @method getReading
         * @returns {String}
         */
        getReading: function() {
            return this.isChinese() ? app.fn.pinyin.toTone(this.get('reading')) : this.get('reading');
        },
        /**
         * @method getReadingElement
         * @returns {String}
         */
        getReadingElement: function() {
            var element = '';
            //TODO: handle fillers for both languages
            //var fillers = [" ... ", "'", " "];
            var variations = this.getSegmentedReading();
            for (var a = 0, lengthA = variations.length; a < lengthA; a++) {
                var variation = variations[a];
                for (var b = 0, lengthB = variation.length; b < lengthB; b++) {
                    var reading = variation[b];
                    var readingMarks = app.fn.pinyin.toTone(reading);
                    var readingToneless = reading.replace(/[1-5]/g, '');
                    var position = b + 1;
                    element += "<div id='reading-position-" + position + "' class='cursor mask'>";
                    element += "<span class='pinyin-marks'>" + readingMarks + "</span>";
                    element += "<span class='pinyin-toneless hidden'>" + readingToneless + "</span>";
                    element += "</div>";
                }
            }
            return element;
        },
        /**
         * @method getSegmentedReading
         * @returns {Array}
         */
        getSegmentedReading: function() {
            var segments = [];
            if (this.isChinese()) {
                var variations = this.get('reading').split(', ');
                for (var a = 0, lengthA = variations.length; a < lengthA; a++) {
                    var variation = variations[a];
                    segments.push(variation.match(/\s|[a-z|A-Z]+[1-5]+| ... |'/g));
                }
            } else {
                //TODO: properly segment Japanese
            }
            return segments;
        },
        /**
         * @method getSentence
         * @returns {String}
         */
        getSentence: function() {
            return null;
        },
        /**
         * @method getStrokes
         * @param {Array}
         */
        getStrokes: function() {
            var strokes = [];
            var characters = this.getCharacters();
            for (var i = 0, length = characters.length; i < length; i++) {
                var stroke = app.user.data.strokes.get(characters[i]);
                if (stroke) {
                    strokes.push(stroke);
                }
            }
            return strokes;
        },
        /**
         * @method getStyle
         * @returns {String}
         */
        getStyle: function() {
            var style = this.get('style');
            if (style === 'simp') {
                return 'simplified';
            }
            if (style === 'trad') {
                return 'traditional';
            }
            return null;
        },
        /**
         * @method getToneNumbers
         * @returns {Array}
         */
        getToneNumbers: function() {
            var tones = [];
            if (this.isChinese()) {
                var readings = this.get('reading').split(', ');
                for (var a = 0, lengthA = readings.length; a < lengthA; a++) {
                    var reading = readings[a].match(/[1-5]+/g);
                    for (var b = 0, lengthB = reading.length; b < lengthB; b++) {
                        var tone = parseInt(reading[b], 10);
                        tones[b] = Array.isArray(tones[b]) ? tones[b].concat(tone) : [tone];
                    }
                }
            }
            return tones;
        },
        /**
         * @method getWritingElement
         * @returns {String}
         */
        getWritingElement: function() {
            var element = '';
            var characters = this.getCharacters();
            for (var i = 0, length = characters.length; i < length; i++) {
                var character = characters[i];
                var position = i + 1;
                element += "<div id='writing-position-" + position + "' class='cursor mask'><span>";
                element += character;
                element += "</span></div>";
            }
            return element;
        },
        /**
         * @method isBanned
         * @returns {Boolean}
         */
        isBanned: function() {
            return this.get('bannedParts').length ? true : false;
        },
        /**
         * @method isChinese
         * @returns {Boolean}
         */
        isChinese: function() {
            return this.get('lang') === 'zh';
        },
        /**
         * @method isJapanese
         * @returns {Boolean}
         */
        isJapanese: function() {
            return this.get('lang') === 'ja';
        },
        /**
         * @method play
         * @returns {DataVocab}
         */
        play: function() {
            if (this.has('audioURL')) {
                app.media.play(this.get('audioURL'));
            }
            return this;
        }
    });

    return DataVocab;

});