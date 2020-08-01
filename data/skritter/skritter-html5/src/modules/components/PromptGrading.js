/**
 * @module Application
 * @submodule Components
 */
define([
    'require.text!templates/components/prompt-grading.html',
    'core/modules/GelatoComponent'
], function(Template, GelatoComponent) {

    /**
     * @class PromptGrading
     * @extends GelatoComponent
     */
    var PromptGrading = GelatoComponent.extend({
        /**
         * @method initialize
         * @param {Object} [options]
         * @constructor
         */
        initialize: function(options) {
            options = options || {};
            this.prompt = options.prompt;
            this.value = null;
            this.on('resize', this.resize);
        },
        /**
         * @method render
         * @returns {PromptGrading}
         */
        render: function() {
            this.renderTemplate(Template);
            return this;
        },
        /**
         * @property events
         * @type Object
         */
        events: {
            'vclick .btn': 'handleClickButton'
        },
        /**
         * @method handleClickButton
         * @param {Event} event
         */
        handleClickButton: function(event) {
            event.preventDefault();
            this.select(parseInt($(event.currentTarget).data('value'), 10));
            this.trigger('select', this.value);
        },
        /**
         * @method select
         * @param {Number} [value]
         * @returns {PromptGrading}
         */
        select: function(value) {
            this.unselect();
            if (value) {
                this.$('.btn-group .btn[data-value="' + value + '"]').addClass('selected');
                this.value = value;
            } else {
                this.value = null;
            }
            return this;
        },
        /**
         * @method unselect
         * @returns {PromptGrading}
         */
        unselect: function() {
            this.$('.btn-group .btn').removeClass('selected');
            return this;
        }
    });

    return PromptGrading;

});