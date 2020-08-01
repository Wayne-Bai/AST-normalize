/**
 Select new screen layout (template) for a campaign > timeline
 @class ScreenLayoutSelectorView
 @constructor
 @return {Object} instantiated ScreenLayoutSelectorView
 **/
define(['jquery', 'backbone', 'StackView'], function ($, Backbone, StackView) {

    BB.SERVICES.SCREEN_LAYOUT_SELECTOR_VIEW = 'ScreenLayoutSelectorView';

    var ScreenLayoutSelectorView = BB.View.extend({

        /**
         Constructor
         @method initialize
         **/
        initialize: function () {
            var self = this;
            self.m_screens = [];

            self.listenTo(self.options.stackView, BB.EVENTS.SELECTED_STACK_VIEW, function (e) {
                if (e == self) {
                    self._render();
                }
            });

            $(this.el).find(Elements.PREVIOUS).on('click', function (e) {
                if (self.options.from == null)
                    return;
                self.options.stackView.slideToPage(self.options.from, 'left');
                return false;
            });
        },

        /**
         Build the list of templates a user can select from.
         @method render
         @return none
         **/
        _render: function () {
            var self = this;

            BB.comBroker.getService(BB.SERVICES.PROPERTIES_VIEW).resetPropertiesView();

            $(Elements.SCREEN_LAYOUT_LIST).empty();
            var resolution = BB.comBroker.getService(BB.SERVICES.RESOLUTION_SELECTOR_VIEW).model.get(BB.CONSTS.RESOLUTION);
            var orientation = BB.comBroker.getService(BB.SERVICES.ORIENTATION_SELECTOR_VIEW).model.get(BB.CONSTS.ORIENTATION);

            BB.comBroker.listenOnce(BB.EVENTS.ON_VIEWER_SELECTED, function () {
                setTimeout(function () {
                    self.options.stackView.slideToPage(self.options.to, 'right');
                }, 700)
            });

            $(Elements.SCREEN_LAYOUT_LIST).empty();

        },

        /**
         Hide previous UI button so we can't go back
         @method hidePreviousButton
         **/
        hidePreviousButton: function(){
            var self = this;
            self.$el.find(Elements.PREVIOUS).hide();
        }
    });

    return ScreenLayoutSelectorView;

});

