// Filename: training_app.js
define([
  'jquery',
  'underscore',
  'backbone',
  '/javascripts/collections/decision_tree_image_collection.js',
  '/javascripts/views/image_gallery.js'
], function($, _, Backbone, DecisionTreeImageCollection, ImageGalleryView) {

  var imageGallery;
  
  var initialize = function() {
    var trainingApp = this;
    var images = new DecisionTreeImageCollection();
    var q = images.fetch();
    q.done(function() {
      trainingApp.imageGallery = new ImageGalleryView();
      trainingApp.imageGallery.collection = images;
      trainingApp.imageGallery.render();
    });
  }
  
  return App = {
    initialize: initialize,
    imageGallery: imageGallery
  };
});
