(function($){
  $.fn.clonePosition = function(element, options){
    var options = $.extend({
      cloneWidth: true,
      cloneHeight: true,
      offsetLeft: 0,
      offsetTop: 0
    }, (options || {}));
    
    var offsets = $(element).offset();
    
    $(this).css({
      position: 'absolute',
      top:  (offsets.top  + options.offsetTop)  + 'px',
      left: (offsets.left + options.offsetLeft) + 'px'
    });
    
    if (options.cloneWidth)  $(this).width($(element).get(0).offsetWidth);
    if (options.cloneHeight) $(this).height($(element).get(0).offsetHeight);
    
    return this;
  }
})(jQuery);
