/**
 * @module Application
 * @submodule Pages
 */
define([
    'require.text!templates/list.html',
    'core/modules/GelatoPage',
    'modules/components/TableViewer',
    'modules/models/DataVocabList'
], function(Template, GelatoPage, TableViewer, DataVocabList) {

    /**
     * @class PageListBrowse
     * @extends GelatoPage
     */
    var PageListBrowse = GelatoPage.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {
            this.list = null;
            this.sections = new TableViewer();
        },
        /**
         * @property title
         * @type String
         */
        title: app.strings.lists.title + ' - ' + app.strings.global.title,
        /**
         * @method render
         * @returns {PageListBrowse}
         */
        render: function() {
            this.renderTemplate(Template);
            this.sections.setElement(this.$('.sections-table-container')).render();
            return this;
        },
        /**
         * @method renderFields
         * @returns {PageListBrowse}
         */
        renderFields: function() {
            if (this.list.has('creator')) {
                this.$('.vocablist-madeby').text(this.list.get('creator'));
            } else {
                this.$('.vocablist-madeby').parent().hide();
            }
            this.$('.vocablist-description').text(this.list.get('description'));
            this.$('.vocablist-name').text(this.list.get('name'));
            if (this.list.has('published')) {
                this.$('.vocablist-published').text(this.list.get('published'));
            } else {
                this.$('.vocablist-published').parent().hide();
            }
            this.$('.vocablist-studiedby').text(this.list.get('peopleStudying'));
            this.$('.vocablist-tags').text(this.list.get('tags').join(', '));
            this.$('.vocablist-wordcount').text(this.list.getWordCount());
            this.renderSections();
            return this;
        },
        /**
         * @method renderSections
         * @returns {PageListBrowse}
         */
        renderSections: function() {
            this.sections.set(this.list.get('sections'), {
                name: {title: '', type: 'row'},
                rows: {title: '', type: 'section-wordcount'},
                status: {title: '', type: 'section-status'}
            }, {showHeader: false});
            this.resize();
            return this;
        },
        /**
         * @property events
         * @type Object
         */
        events: {
            'vclick .sections-table-container tbody tr': 'handleClickSectionTableRow'
        },
        /**
         * @method handleClickSectionTableRow
         * @param {Event} event
         */
        handleClickSectionTableRow: function(event) {
            event.preventDefault();
            var sectionId = $(event.currentTarget).attr('id').replace('row-', '');
            app.router.navigate('lists/browse/' + this.list.id + '/' + sectionId, {trigger: true});
        },
        /**
         * @method load
         * @param {String} listId
         * @return {PageListBrowse}
         */
        load: function(listId) {
            var self = this;
            app.api.fetchVocabList(listId, null, function(result) {
                self.list = new DataVocabList(result) || null;
                self.renderFields();
            }, function(error) {
                console.log(error);
            });
            return this;
        },
        /**
         * @method resize
         */
        resize: function() {
            var contentBlock = this.$('.content-block');
            var menuColumn = this.$('.menu-column');
            menuColumn.height(contentBlock.height());
            return this;
        }
    });

    return PageListBrowse;

});