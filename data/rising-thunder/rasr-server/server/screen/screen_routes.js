"use strict";

var controller = require('./screen_controllers');

module.exports = function(router) {

  // Get specific screen data
  // router.route('/save/:screenId')
  
  // Map editor new tileset route
  router.route('/tileset')
    .post(controller.saveTileSet); 
  
  // get next screen player moves to.
  router.route('/move/:direction/:currentScreenId')
    .get(controller.moveScreen);

  // builds screen next to "currentScreenId"
  router.route('/make/:direction/:currentScreenId')
    .get(controller.createPlacedScreen);

  router.route('/:screenId')
    .get(controller.getScreen)
    .delete(controller.deleteScreen)
    // Map editor API route
    .put(controller.saveScreen);

};
