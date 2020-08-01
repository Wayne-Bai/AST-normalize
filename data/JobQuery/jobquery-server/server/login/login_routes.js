'use strict';

var controller = require('./login_controllers.js');

module.exports = exports = function (router) {
  router.route('/')
    .post(controller.post);
};
