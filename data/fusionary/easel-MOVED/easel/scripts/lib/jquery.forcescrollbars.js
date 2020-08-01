// https://gist.github.com/1214235
// by @madrobby
// nudge safari 5.1 Lion to (hopefully) display scrollbars correctly
(function($) {
  $.fn.forceScrollbars = function() {
    this.css({
      position: 'static'
    });
    if (this.length > 0) {
      this[0].offsetHeight;
    }
    return this.css({
      position: 'relative'
    });
  };
})(jQuery);