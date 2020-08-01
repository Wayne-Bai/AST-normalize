goog.provide('ResourceManager');

goog.require('goog.asserts');
goog.require('goog.log.Logger');

goog.require('graphics.Image');
goog.require('graphics.SpriteSheet');
goog.require('Sound');

/**
 * @constructor
 */
ResourceManager = function() {
  /**
   * @type {goog.log.Logger}
   * @private
   */
  this.logger_ = goog.log.getLogger('ResourceManager');

  /**
   * @type {!Object.<string, !graphics.Image>}
   * @private
   */
  this.images_ = {};

  /**
   * @type {!Object.<string, !graphics.SpriteSheet>}
   * @private
   */
  this.spriteSheets_ = {};

  /**
   * @type {!Object.<string, !Sound>}
   * @private
   */
  this.sounds_ = {};
};

/**
 * @param {string} name
 * @param {string} url
 * @param {number} xTiles
 * @param {number} yTiles
 * @param {function()} loadCb
 */
ResourceManager.prototype.loadImage = function(name, url, xTiles, yTiles, loadCb) {
  var self = this;
  var callback = function() {
    goog.log.info(self.logger_, 'Loaded image: "' + name + '"');
    loadCb();
  };

  goog.log.info(this.logger_, 'Loading image: "' + name + '" using URL: ' + url);
  this.images_[name] = new graphics.Image(xTiles, yTiles);
  this.images_[name].load(url, callback);
};

/**
 * @param {string} name
 * @param {string} url
 * @param {number} xTiles
 * @param {number} yTiles
 * @param {number} frames
 * @param {number} period
 * @param {function()} loadCb
 */
ResourceManager.prototype.loadSpriteSheet = function(name, url, xTiles, yTiles, frames, period, loadCb) {
  var self = this;
  var callback = function() {
    goog.log.info(self.logger_, 'Loaded video ensemble: "' + name + '"');
    loadCb();
  };

  goog.log.info(this.logger_, 'Loading video ensemble: "' + name + '" using URL: ' + url);
  this.spriteSheets_[name] = new graphics.SpriteSheet(xTiles, yTiles, frames, period);
  this.spriteSheets_[name].load(url, callback)
}

/**
 * @param {string} name
 * @param {string} url
 * @param {function()} loadCb
 */
ResourceManager.prototype.loadSound = function(name, url, loadCb) {
  goog.log.info(this.logger_, 'Loading sound: "' + name + '" using URL: ' + url);
  this.sounds_[name] = new Sound();
  this.sounds_[name].load(url, loadCb);
};

/**
 * @param {string} name
 */
ResourceManager.prototype.playSound = function(name) {
  goog.asserts.assert(name in this.sounds_, 'Unable to find sound: ' + name);
  this.sounds_[name].play();
};

/**
 * @param {string} name
 * @return {!graphics.Image}
 */
ResourceManager.prototype.getImage = function(name) {
  goog.asserts.assert(this.images_[name], 'Requesting missing image resource: ' + name);
  return this.images_[name];
};

/**
 * @param {string} name
 * @return {!graphics.SpriteSheet}
 */
ResourceManager.prototype.getSpriteSheet = function(name) {
  goog.asserts.assert(this.spriteSheets_[name], 'Requesting missing video ensemble: ' + name);
  return this.spriteSheets_[name];
};
