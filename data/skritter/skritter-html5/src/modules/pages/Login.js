/**
 * @module Application
 * @submodule Pages
 */
define([
    'require.text!templates/login.html',
    'core/modules/GelatoPage'
], function(Template, GelatoPage) {

    /**
     * @class PageLogin
     * @extends GelatoPage
     */
    var PageLogin = GelatoPage.extend({
        /**
         * @method initialize
         * @constructor
         */
        initialize: function() {},
        /**
         * @property title
         * @type String
         */
        title: app.strings.login.title + ' - ' + app.strings.global.title,
        /**
         * @method render
         * @returns {PageLogin}
         */
        render: function() {
            this.renderTemplate(Template);
            this.renderDialog();
            return this;
        },
        /**
         * @property events
         * @type Object
         */
        events: {
            'vclick #login-submit': 'handleClickLoginSubmit'
        },
        /**
         * @method handleClickLoginSubmit
         * @param {Event} event
         */
        handleClickLoginSubmit: function(event) {
            event.preventDefault();
            var self = this;
            var fieldUsername = this.$('#field-username').val();
            var fieldPassword = this.$('#field-password').val();
            if (!fieldUsername) {
                this.$('.response-message').text('Username is required.');
                return;
            }
            if (!fieldPassword) {
                this.$('.response-message').text('Password is required.');
                return;
            }
            this.disableForm('#login-form');
            this.dialog.show('loading-login');
            app.user.login(fieldUsername, fieldPassword, function() {
                self.dialog.once('hidden', app.reload);
                self.dialog.hide();
            }, function(error) {
                self.$('.response-message').text(JSON.stringify(error));
                self.enableForm('#login-form');
                self.dialog.hide();
            }, function(status) {
                self.$('.loaded-items').text(status);
            });
        }
    });

    return PageLogin;

});