/*
 * jquery.styleWords
 * https://github.com/jeffreyway/jquery.styleWords
 *
 * Copyright (c) 2012 Jeffrey Way
 * Licensed under the GPL license.
 */

(function($) {

var styleWords = {
  init: function(el, numWords, config) {
    this.numWords = numWords || 1;

    this.config = $.extend({}, $.fn.styleWords.defaults, config);

    this.el = el;
    this.$el = $(el);

    this.updateHTML();
  },

  updateHTML: function() {
    var self = this;

    this.$el.html(function(i, text) {
      return self.createWrapper( text );
    });
  },

  createWrapper: function(text) {
    var words = text.split(' '),
        tag = this.config.tag,
        wrapper;

    delete this.config.tag;

    wrapper = $(tag, this.config).text( words.splice(0, this.numWords).join(' '));
    wrapper = $('<div>').append(wrapper).html();

    return [wrapper].concat(words).join(' ');
  }

};

// Create the plugin
$.fn.styleWords = function(numWords, config) {
  var obj = Object.create(styleWords);
  return this.each(function() {
    obj.init(this, numWords, config);
  });
};

$.fn.styleWords.defaults = {
  tag: '<span>',
  'class': 'styleWords'
};

}(jQuery));
