/**
 * @module Application
 * @submodule Pages
 */
define([
    'require.text!templates/word.html',
    'core/modules/GelatoPage',
    'modules/components/VocabDetail'
], function(Template, GelatoPage, VocabDetail) {

    /**
     * @class PageWord
     * @extends GelatoPage
     */
    var PageWord = GelatoPage.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {
            this.detail = new VocabDetail();
        },
        /**
         * @property title
         * @type String
         */
        title: app.strings.words.title + ' - ' + app.strings.global.title,
        /**
         * @method render
         * @returns {PageWord}
         */
        render: function() {
            this.renderTemplate(Template);
            this.detail.setElement(this.$('.detail-container')).hide().render();
            return this;
        },
        /**
         * @method load
         * @param {String} writing
         * @returns {PageWord}
         */
        load: function(writing) {
            var self = this;
            app.user.data.vocabs.load(writing, function(result) {
                self.detail.set(result);
                self.detail.show();
            }, function(error) {
                console.log(error);
            });
            return this;
        }
    });

    return PageWord;

});