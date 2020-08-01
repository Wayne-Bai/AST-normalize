(function($){
  $.fn.scrollToCenter = function(opts){
    var html = html || ($('body')[0].scrollHeight == $('html')[0].scrollHeight ? $('body')[0] : $('html')[0]);
    var element = $(this).get(0), top = 0, left = 0;
    opts = opts || {};
  
    do {
      top  += element.offsetTop  || 0;
      left += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
  
    var offsetTop  = (window.innerHeight || document.body.clientHeight) / 2;
    var offsetLeft = (window.innerWidth  || document.body.clientWidth)  / 2;
    
    if (opts.complete){
      var complete = opts.complete;
      opts.complete = function (){
        complete.apply(element, arguments);
      };
    }
    
    $(html).animate({
      scrollTop:  top  - (offsetTop  / 2),
      scrollLeft: left - (offsetLeft / 2)
    }, opts);
  
    return this;
  }

})(jQuery);
