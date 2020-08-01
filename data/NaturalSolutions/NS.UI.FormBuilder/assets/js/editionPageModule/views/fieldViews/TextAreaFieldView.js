define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/TextAreaFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var LongTextFieldView = BaseView.extend({
        events: function() {
            return _.extend(BaseView.prototype.events, {
                'focus textarea'        : 'updateSetting'
            });
        },

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;

            BaseView.prototype.initialize.apply(this, [opt]);
            $(this.el).addClass('textArea');
        },

    });

	return LongTextFieldView;

});