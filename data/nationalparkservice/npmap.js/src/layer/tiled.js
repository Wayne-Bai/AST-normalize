/* global L */

'use strict';

var util = require('../util/util');

var TiledLayer = L.TileLayer.extend({
  options: {
    errorTileUrl: L.Util.emptyImageUrl
  },
  initialize: function(options) {
    util.strict(options.url, 'string');
    L.Util.setOptions(this, options);
    L.TileLayer.prototype.initialize.call(this, options.url, options);
    this.fire('ready');
    this.readyFired = true;
    return this;
  }
});

module.exports = function(options) {
  options = options || {};

  if (!options.type) {
    options.type = 'tiled';
  }

  return new TiledLayer(options);
};
