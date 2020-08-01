// Image Collection
// ---------------
define([
  'underscore',
  'backbone',
  '/javascripts/models/decision_tree_image.js'
], function(_, Backbone, DecisionTreeImage){
  var DecisionTreeImageCollection = Backbone.Collection.extend({
    // Reference to this collection's model.
	  model: DecisionTreeImage,

    // load the images.
    url: '/training/decision_tree_images'
  });
  return DecisionTreeImageCollection;
});
