'use strict';

var controller = require('./auth_controllers.js');

module.exports = exports = function (router) {
  router.route('/send')
    .post(controller.sendPasswordReset);
  router.route('/reset')
    .post(controller.resetPassword);
};
