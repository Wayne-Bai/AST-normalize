/**
 * @class Represents a 2D texture which we can map to our 3D objects
 *
 * @author Paul Lewis
 */
A3.Core.Render.Textures.Texture = function(imagePath, index, callback) {

  var ready               = false;

  /**
   * @description The index
   */
  this.index              = index || 0;

  /**
   * @description The underlying image DOM element for this texture
   * @type DOMElement (Image)
   */
  this.domElement         = new Image();

  // set up the onload and set the source
  this.domElement.onload  = function() {
    ready = true;

    if(!!callback) {
      callback();
    }
  };
  this.domElement.src     = imagePath;

  /**
   * Whether or not the texture has loaded
   */
  this.isReady = function() {
    return ready;
  };
};

A3.Texture = A3.Core.Render.Textures.Texture;
