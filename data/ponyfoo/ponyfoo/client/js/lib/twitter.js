'use strict';

var taunus = require('taunus/global');
var throttle = require('./throttle');
var throttledUpdateView = throttle(updateView, 2500);

function updateView (elem) {
  var twitter = global.twttr;
  if (twitter && twitter.widgets) {
    twitter.widgets.load(elem);
  }
}

taunus.on('render', throttledUpdateView);

module.exports = {
  updateView: throttledUpdateView
};
