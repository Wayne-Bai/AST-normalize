/**
 * @module Application
 * @submodule Pages
 */
define([
    'require.text!templates/time-attack.html',
    'core/modules/GelatoPage',
    'modules/components/Prompt'
], function(Template, GelatoPage, Prompt) {

    /**
     * @class PageTimeAttack
     * @extends GelatoPage
     */
    var PageTimeAttack = GelatoPage.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {
            this.completed = [];
            this.prompt = new Prompt();
            this.list = null;
            this.randomIds = [];
            this.timeFinish = 0;
            this.timeStart = 0;
            this.strokes = [];
            this.vocabs = [];
        },
        /**
         * @property title
         * @type String
         */
        title: app.strings.global.title,
        /**
         * @method render
         * @returns {PageTimeAttack}
         */
        render: function() {
            this.renderTemplate(Template);
            this.renderDialog();
            this.prompt.setElement(this.$('.prompt-container'));
            this.prompt.hide().render();
            this.prompt.on('prompt:complete', $.proxy(this.handlePromptComplete, this));
            return this;
        },
        /**
         * @method renderPrompt
         * @returns {PageTimeAttack}
         */
        renderPrompt: function() {
            this.prompt.grading.hide();
            this.prompt.navigation.hide();
            this.prompt.toolbar.hide();
            this.prompt.countdown.show().setRemaining(this.vocabs.length);
            this.prompt.set(this.vocabs[0], 'rune', false);
            this.prompt.show();
            return this;
        },
        /**
         * @method getContainedVocabIds
         * @param {Array} vocabs
         * @returns {Array}
         */
        getContainedVocabIds: function(vocabs) {
            var containedVocabIds = [];
            for (var i = 0, length = vocabs.length; i < length; i++) {
                var vocab = vocabs[i];
                if (vocab.has('containedVocabIds')) {
                    containedVocabIds = containedVocabIds.concat(vocab.get('containedVocabIds'));
                }
            }
            return containedVocabIds;
        },
        /**
         * @method getRandomVocabIds
         * @param {Object} list
         * @param {Number} number
         * @param {Boolean} traditional
         * @returns {Array}
         */
        getRandomVocabIds: function(list, number, traditional) {
            var randomIds = [];
            var listVocabIds = [];
            var rows = _.pluck(list.sections, 'rows');
            for (var a = 0, lengthA = rows.length; a < lengthA; a++) {
                listVocabIds = listVocabIds.concat(_.pluck(rows[a], traditional ? 'tradVocabId' : 'vocabId'));
            }
            for (var b = 0; b < number; b++) {
                var randomIndex = Math.floor(Math.random() * (listVocabIds.length - 1) + 1);
                randomIds.push(listVocabIds.splice(randomIndex, 1)[0]);
            }
            return randomIds;
        },
        /**
         * @method handlePromptComplete
         */
        handlePromptComplete: function() {
            this.completed.push(this.vocabs.shift());
            this.prompt.countdown.setRemaining(this.vocabs.length);
            if (this.vocabs.length) {
                this.prompt.set(this.vocabs[0], 'rune', false);
            } else {
                this.timeFinish = Moment().unix();
                this.$('.finish-time').text(this.timeFinish - this.timeStart);
                this.dialog.show('results-display');
            }

        },
        /**
         * @method load
         * @param {String} listId
         */
        load: function(listId) {
            var self = this;
            Async.series([
                function(callback) {
                    //fetch all rows and vocab ids from list
                    app.api.fetchVocabList(listId, null, function(list) {
                        self.list = list;
                        self.randomIds = self.getRandomVocabIds(list, 5, false);
                        self.$('.list-name').text(list.name);
                        callback();
                    }, function(error) {
                        callback(error);
                    });
                },
                function(callback) {
                    app.api.fetchVocabs({
                        ids: self.randomIds.join('|'),
                        include_strokes: true
                    }, function(result) {
                        self.vocabs = app.user.data.vocabs.add(result.Vocabs);
                        self.strokes = app.user.data.strokes.add(result.Strokes);
                        callback();
                    }, function(error) {
                        callback(error);
                    });
                },
                function(callback) {
                    app.api.fetchVocabs({
                        ids: self.getContainedVocabIds(self.vocabs).join('|'),
                        include_strokes: true
                    }, function(result) {
                        app.user.data.vocabs.add(result.Vocabs);
                        self.strokes = app.user.data.strokes.add(result.Strokes);
                        callback();
                    }, function(error) {
                        callback(error);
                    });
                }
            ], function() {
                self.showReadyConfirmation();
            });

        },
        /**
         * @method showReadyConfirmation
         */
        showReadyConfirmation: function() {
            var self = this;
            this.dialog.show('ready-confirmation');
            this.$('#start-timeattack').on('vclick', function() {
                self.dialog.on('hidden', $.proxy(self.start, self));
                self.dialog.hide();
            });
        },
        /**
         * @method start
         */
        start: function() {
            this.renderPrompt();
            this.timeStart = Moment().unix();
        }
    });

    return PageTimeAttack;

});